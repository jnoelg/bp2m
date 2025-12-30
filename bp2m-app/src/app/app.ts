import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseChartDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bp2m');

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Instantaneous BPM',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(148,159,177,0.2)'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true
  };

  bpmEvents = new Array<Date>();

  getIntervalCount() {
    if (this.bpmEvents == null || this.bpmEvents.length < 1)  return 0;
    return this.bpmEvents.length - 1;
  }

  reset() {
    this.bpmEvents = new Array<Date>();
    this.lineChartData.labels = [];
    this.lineChartData.datasets[0].data = [];
    this.chart?.update();
  }

  addBpmEvent() {
    const now = new Date();
    this.bpmEvents.push(now);

    if (this.bpmEvents.length > 1) {
      const prev = this.bpmEvents[this.bpmEvents.length - 2];
      const diff = now.getTime() - prev.getTime();
      const bpm = 60000 / diff;

      this.lineChartData.labels?.push(this.bpmEvents.length - 1);
      this.lineChartData.datasets[0].data.push(bpm);
      this.chart?.update();
    }
  }

  getDuration() {
    if (this.bpmEvents == null || this.bpmEvents.length < 2)  return '-';

    const dateStart = this.bpmEvents[0];
    const dateEnd = this.bpmEvents[this.bpmEvents.length - 1];

    const timespan = (dateEnd.getTime() - dateStart.getTime()) / 1000;

    return timespan.toFixed(1).toString();
  }

  getIntervals() {
    const intervals = new Array<number> ();
    if (this.bpmEvents == null || this.bpmEvents.length < 2) return intervals;

    for (let i = 0; i < this.bpmEvents.length - 1; i++) {
      const dateStart = this.bpmEvents[i];
      const dateEnd = this.bpmEvents[i+1];

      intervals.push(dateEnd.getTime() - dateStart.getTime());
    }

    return intervals;
  }

  getAvg() {
    const intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    const r =  this._average(intervals);
    return r.mean.toFixed(0) + " ms";
  }

  getStdDeviation() {
    const intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    const r =  this._average(intervals);
    return r.deviation.toFixed(0) + " ms";
  }

  getBpmAvg() {
    const intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    let r =  this._average(intervals).mean / 1000;
    r = 60 / r;
    return r.toFixed(1) + " bpm";
  }

  getAvgWithin3StdDeviations() {
    const intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    const r =  this._average(intervals);
    const low = r.mean - (3 * r.deviation);
    const hi = r.mean + (3 * r.deviation);

    const intervalsWithin3StdDeviations = new Array<number> ();
    for (const interval of intervals) {
      if ((interval > low) && (interval < hi)) {
        intervalsWithin3StdDeviations.push(interval);
      }
    }

    if (intervalsWithin3StdDeviations.length < 1) return "-";
    let res =  this._average(intervalsWithin3StdDeviations).mean / 1000;
    res = 60 / res;
    return res.toFixed(1) + " bpm";
  }

  private _average(a: number[]) {
    const n = a.length;
    const sum = a.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    const sumSquaredDiff = a.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const variance = sumSquaredDiff / n;

    const deviation = Math.sqrt(variance);

    return { mean, variance, deviation };
  }
}

import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseChartDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('bp2m');

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Instantaneous BPM',
        fill: true,
        tension: 0.4,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Placeholder, will be replaced by gradient
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)' // Lighter grid lines
        },
        ticks: {
          color: '#666' // Darker tick labels
        }
      },
      x: {
        grid: {
          display: false // Hide vertical grid lines for a cleaner look
        },
        ticks: {
          color: '#666'
        }
      }
    }
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

  ngAfterViewInit(): void {
    this.applyChartStyles();
  }

  private applyChartStyles(): void {
    const chart = this.chart?.chart;
    if (!chart) {
      // Retry if chart is not yet available, which can happen in some rendering scenarios.
      setTimeout(() => this.applyChartStyles(), 50);
      return;
    }

    const gradient = this.createChartGradient(chart);
    this.lineChartData.datasets[0].backgroundColor = gradient;
    this.chart?.update();
  }

  private createChartGradient(chart: Chart): CanvasGradient {
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.1)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.8)');
    return gradient;
  }
}

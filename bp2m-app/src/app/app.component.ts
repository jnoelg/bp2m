import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})

export class AppComponent {
  title = 'BP2M App';

  bpmEvents = new Array<Date>();

  getIntervalCount() {
    if (this.bpmEvents == null || this.bpmEvents.length < 1)  return 0;
    return this.bpmEvents.length - 1;
  }

  reset() {
    this.bpmEvents = new Array<Date>();
  }

  addBpmEvent() {
    let date = new Date();
    this.bpmEvents.push(date);
  }

  getDuration() {
    if (this.bpmEvents == null || this.bpmEvents.length < 2)  return '-';

    var dateStart = this.bpmEvents[0];
    var dateEnd = this.bpmEvents[this.bpmEvents.length - 1];

    var timespan = (dateEnd.getTime() - dateStart.getTime()) / 1000;

    return timespan.toFixed(1).toString();
  }

  getIntervals() {
    var intervals = new Array<number> ();
    if (this.bpmEvents == null || this.bpmEvents.length < 2) return intervals;

    for (var i = 0; i < this.bpmEvents.length - 1; i++) {
      var dateStart = this.bpmEvents[i];
      var dateEnd = this.bpmEvents[i+1];

      intervals.push(dateEnd.getTime() - dateStart.getTime());
    }

    return intervals;
  }

  getAvg() {
    var intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    var r =  this._average(intervals);
    return r.mean.toFixed(0) + " ms";
  }

  getStdDeviation() {
    var intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    var r =  this._average(intervals);
    return r.deviation.toFixed(0) + " ms";
  }

  getBpmAvg() {
    var intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    var r =  this._average(intervals).mean / 1000;
    r = 60 / r;
    return r.toFixed(1) + " bpm";
  }

  getAvgWithin3StdDeviations() {
    var intervals = this.getIntervals();
    if (intervals == null || intervals.length < 1) return "-";
    var r =  this._average(intervals);
    var low = r.mean - (3 * r.deviation);
    var hi = r.mean + (3 * r.deviation);

    var intervalsWithin3StdDeviations = new Array<number> ();
    for (var i = 0; i < intervals.length; i++) {
      var val = intervals[i];
      if ((val > low) && (val < hi)) {
        intervalsWithin3StdDeviations.push(val);
      }
    }

    if (intervalsWithin3StdDeviations.length < 1) return "-";
    var res =  this._average(intervalsWithin3StdDeviations).mean / 1000;
    res = 60 / res;
    return res.toFixed(1) + " bpm";
  }

  private _average(a) {
    var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
    for(var m, s = 0, l = t; l--; s += a[l]);
    for(m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
  }
}



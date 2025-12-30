import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'bp2m' title`, () => {
    // Access protected signal for testing
    expect((component as any).title()).toEqual('bp2m');
  });

  describe('Event Management', () => {
    it('should initialize with empty events list', () => {
      expect(component.bpmEvents).toBeDefined();
      expect(component.bpmEvents.length).toBe(0);
    });

    it('should add BPM events', () => {
      component.addBpmEvent();
      expect(component.bpmEvents.length).toBe(1);
      expect(component.bpmEvents[0]).toBeInstanceOf(Date);
    });

    it('should reset events', () => {
      component.addBpmEvent();
      component.addBpmEvent();
      expect(component.bpmEvents.length).toBe(2);

      component.reset();
      expect(component.bpmEvents.length).toBe(0);
    });

    it('should return correct interval count', () => {
      expect(component.getIntervalCount()).toBe(0);

      component.addBpmEvent();
      expect(component.getIntervalCount()).toBe(0); // 1 event = 0 intervals

      component.addBpmEvent();
      expect(component.getIntervalCount()).toBe(1); // 2 events = 1 interval
    });
  });

  describe('Calculations', () => {
    // Helper to populate bpmEvents with deterministic time gaps
    const setEventsWithIntervals = (intervalsMs: number[]) => {
      const start = new Date('2024-01-01T10:00:00Z').getTime();
      component.bpmEvents = [new Date(start)];

      let current = start;
      intervalsMs.forEach(ms => {
        current += ms;
        component.bpmEvents.push(new Date(current));
      });
    };

    it('should return placeholders when insufficient data', () => {
      component.bpmEvents = [];
      expect(component.getDuration()).toBe('-');
      expect(component.getAvg()).toBe('-');
      expect(component.getStdDeviation()).toBe('-');
      expect(component.getBpmAvg()).toBe('-');
      expect(component.getAvgWithin3StdDeviations()).toBe('-');
    });

    it('should calculate total duration', () => {
      // 500ms + 1500ms = 2000ms = 2.0s
      setEventsWithIntervals([500, 1500]);
      expect(component.getDuration()).toBe('2.0');
    });

    it('should retrieve intervals', () => {
      setEventsWithIntervals([100, 200]);
      expect(component.getIntervals()).toEqual([100, 200]);
    });

    it('should calculate average interval', () => {
      // (1000 + 2000) / 2 = 1500
      setEventsWithIntervals([1000, 2000]);
      expect(component.getAvg()).toBe('1500 ms');
    });

    it('should calculate standard deviation', () => {
      // Intervals: 800, 1200. Mean: 1000.
      // Variance: ((200^2) + (200^2)) / 2 = 40000. Sqrt(40000) = 200.
      setEventsWithIntervals([800, 1200]);
      expect(component.getStdDeviation()).toBe('200 ms');
    });

    it('should calculate BPM average', () => {
      // 1000ms intervals = 60 BPM
      setEventsWithIntervals([1000, 1000]);
      expect(component.getBpmAvg()).toBe('60.0 bpm');
    });

    it('should calculate BPM average excluding outliers (3 std dev)', () => {
      // 9 intervals of 100ms, 1 interval of 10000ms (outlier)
      // The 10000ms is > 3 std devs away from the mean.
      // Remaining average should be 100ms -> 600 BPM.
      const intervals = Array(9).fill(100);
      intervals.push(10000);
      setEventsWithIntervals(intervals);

      expect(component.getAvgWithin3StdDeviations()).toBe('600.0 bpm');
    });
  });
});
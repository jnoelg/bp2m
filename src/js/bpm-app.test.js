import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import BpmApp from './bpm-app';

// Create mock element helper function at module scope
const createMockElement = (props = {}) => {
  const el = {
    addEventListener: vi.fn(),
    style: {},
    innerHTML: '',
    textContent: '0',
    tagName: '',
  };
  if (props.styleDisplay !== undefined) {
    el.style.display = props.styleDisplay;
  }
  if (props.textContent !== undefined) {
    el.textContent = props.textContent;
  }
  if (props.tagName) {
    el.tagName = props.tagName;
  }
  return el;
};

// Mock localStorage for tests
let localStorageStore = {};
const localStorageMock = {
  getItem(key) {
    return localStorageStore[key] || null;
  },
  setItem(key, value) {
    localStorageStore[key] = String(value);
  },
  removeItem(key) {
    delete localStorageStore[key];
  },
  clear() {
    localStorageStore = {};
  }
};

// Create spies for localStorage methods
const localStorageGetSpy = vi.fn(localStorageMock.getItem);
const localStorageSetSpy = vi.fn(localStorageMock.setItem);
const localStorageRemoveSpy = vi.fn(localStorageMock.removeItem);

Object.defineProperty(localStorageMock, 'getItem', { value: localStorageGetSpy, writable: true });
Object.defineProperty(localStorageMock, 'setItem', { value: localStorageSetSpy, writable: true });
Object.defineProperty(localStorageMock, 'removeItem', { value: localStorageRemoveSpy, writable: true });

const createMockElements = () => ({
  tapBtn: createMockElement(),
  resetLink: createMockElement(),
  themeToggle: createMockElement({ tagName: 'BUTTON' }),
  emptyStateEl: createMockElement({ styleDisplay: 'none' }),
  resultsEl: createMockElement({ styleDisplay: 'none' }),
  avgBpmEl: createMockElement({ textContent: '0' }),
  filteredBpmEl: createMockElement({ textContent: '0' }),
  avgIntervalEl: createMockElement({ textContent: '0' }),
  stdDevEl: createMockElement({ textContent: '0' }),
  beatCountEl: createMockElement({ textContent: '0' }),
  durationEl: createMockElement({ textContent: '0s' }),
});

describe('BpmApp', () => {
  let app;

  beforeEach(() => {
    app = new BpmApp();
    app.elements = createMockElements();
    app.tapTimestamps = [];
    app.startTime = null;
    app.intervals = [];

    vi.stubGlobal('localStorage', localStorageMock);

    // Mock canvas element for Chart.js
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillText: vi.fn(),
        stroke: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        clearRect: vi.fn(),
      }),
    };
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'bpmChart') return mockCanvas;
      return null;
    });

    // Mock Chart for this test instance
    vi.stubGlobal('Chart', class MockChart {
      constructor(config) {
        this.data = config.data || { labels: [], datasets: [] };
        this.update = vi.fn();
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (app) {
      app = null;
    }
  });

  describe('calculateStats', () => {
    test('returns null when no intervals', () => {
      const result = app.calculateStats();
      expect(result).toBeNull();
    });

    test('calculates average correctly for single interval', () => {
      app.intervals = [1000];
      const result = app.calculateStats();
      expect(result).toEqual({
        avg: 1000,
        stdDev: 0,
        avgWithin3StdDev: 1000
      });
    });

    test('calculates average correctly for multiple intervals', () => {
      app.intervals = [1000, 1000, 1000, 1000, 1000];
      const result = app.calculateStats();
      expect(result).toEqual({
        avg: 1000,
        stdDev: 0,
        avgWithin3StdDev: 1000
      });
    });

    test('calculates average and stdDev for varying intervals', () => {
      app.intervals = [1000, 1100, 900, 1000, 1000];
      const result = app.calculateStats();
      expect(result.avg).toBeCloseTo(1000, 1);
      expect(result.stdDev).toBeGreaterThan(0);
      expect(result.avgWithin3StdDev).toBeGreaterThan(0);
    });

    test('filters intervals within 3 standard deviations', () => {
      app.intervals = [1000, 1000, 1000, 1000, 1000, 5000];
      const result = app.calculateStats();
      expect(result.avgWithin3StdDev).toBeGreaterThan(0);
    });

    test('handles edge case: all intervals are identical', () => {
      app.intervals = [500, 500, 500, 500];
      const result = app.calculateStats();
      expect(result.stdDev).toBe(0);
      expect(result.avgWithin3StdDev).toBe(500);
    });
  });

  describe('addBpmEvent', () => {
    beforeEach(() => {
      app = new BpmApp();
      app.elements = createMockElements();
      app.tapTimestamps = [];
      app.startTime = null;
      app.intervals = [];

      vi.spyOn(performance, 'now').mockReturnValue(1000);
    });

    test('sets startTime on first tap', () => {
      const now = 1000;
      vi.spyOn(performance, 'now').mockReturnValue(now);

      app.addBpmEvent();

      expect(app.startTime).toBe(now);
      expect(app.tapTimestamps.length).toBe(1);
      expect(app.intervals.length).toBe(0);
    });

    test('calculates interval between consecutive taps', () => {
      const t1 = 1000;
      const t2 = 2000;

      vi.spyOn(performance, 'now').mockReturnValue(t1);
      app.addBpmEvent();

      vi.spyOn(performance, 'now').mockReturnValue(t2);
      app.addBpmEvent();

      expect(app.intervals.length).toBe(1);
      expect(app.intervals[0]).toBe(t2 - t1);
    });

    test('keeps only last MAX_INTERVALS intervals', () => {
      const baseTime = 1000;
      for (let i = 0; i < 105; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(baseTime + i * 1000);
        app.addBpmEvent();
      }

      expect(app.intervals.length).toBe(app.MAX_INTERVALS);
      expect(app.tapTimestamps.length).toBe(app.MAX_INTERVALS + 1);
    });

    test('updates UI after each tap', () => {
      vi.spyOn(app, 'updateUI');

      app.addBpmEvent();

      expect(app.updateUI).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      app = new BpmApp();
      app.elements = createMockElements();
      app.tapTimestamps = [];
      app.startTime = null;
      app.intervals = [];
      app.chart = null;
    });

    test('clears all state', () => {
      app.tapTimestamps = [1000, 2000];
      app.intervals = [1000];
      app.startTime = 1000;
      app.chart = { data: { labels: ['1', '2'], datasets: [{ data: [60, 60] }] }, update: vi.fn() };

      app.reset();

      expect(app.tapTimestamps).toEqual([]);
      expect(app.intervals).toEqual([]);
      expect(app.startTime).toBeNull();
      expect(app.chart.data.labels).toEqual([]);
      expect(app.chart.data.datasets[0].data).toEqual([]);
      expect(app.chart.update).toHaveBeenCalled();
    });
  });

  describe('updateUI', () => {
    beforeEach(() => {
      app = new BpmApp();
      app.elements = createMockElements();
      app.tapTimestamps = [];
      app.startTime = null;
      app.intervals = [];
    });

    test('shows empty state when no data', () => {
      app.updateUI();

      expect(app.elements.emptyStateEl.style.display).toBe('block');
      expect(app.elements.resultsEl.style.display).toBe('none');
    });

    test('shows results when data available', () => {
      app.tapTimestamps = [1000, 2000, 3000];
      app.startTime = 1000;
      app.intervals = [1000, 1000];
      app.updateUI();

      expect(app.elements.emptyStateEl.style.display).toBe('none');
      expect(app.elements.resultsEl.style.display).toBe('block');
      expect(app.elements.avgBpmEl.textContent).not.toBe('0');
    });

    test('displays correct BPM values', () => {
      app.tapTimestamps = [1000, 2000, 3000];
      app.startTime = 1000;
      app.intervals = [1000, 1000];

      app.updateUI();

      expect(app.elements.avgBpmEl.textContent).toBe('60.0');
    });

    test('updates beat count and duration', () => {
      app.tapTimestamps = [1000, 2000, 3000];
      app.startTime = 1000;
      app.intervals = [1000, 1000];
      app.updateUI();

      expect(Number(app.elements.beatCountEl.textContent)).toBe(app.tapTimestamps.length);
      expect(app.elements.durationEl.textContent).toBe('2.0s');
    });
  });

  describe('updateChart', () => {
    beforeEach(() => {
      app = new BpmApp();
      app.elements = createMockElements();
      app.tapTimestamps = [];
      app.startTime = null;
      app.intervals = [];
      app.chart = {
        data: { labels: [], datasets: [{ data: [] }] },
        update: vi.fn()
      };
    });

    test('updates chart with BPM values', () => {
      app.intervals = [1000, 2000, 1500];

      app.updateChart();

      expect(app.chart.data.labels).toEqual([1, 2, 3]);
      expect(app.chart.data.datasets[0].data).toEqual([60, 30, 40]);
      expect(app.chart.update).toHaveBeenCalled();
    });
  });

  describe('toggleTheme', () => {
    test('toggles between light and dark mode', () => {
      vi.spyOn(document.documentElement, 'getAttribute').mockReturnValue('light');
      vi.spyOn(document.documentElement, 'setAttribute');
      localStorageSetSpy('theme', 'light');

      app.toggleTheme();

      expect(document.documentElement.getAttribute).toHaveBeenCalledWith('data-theme');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(localStorageSetSpy).toHaveBeenCalledWith('theme', 'dark');
    });

    test('toggles from dark to light mode', () => {
      vi.spyOn(document.documentElement, 'getAttribute').mockReturnValue('dark');
      vi.spyOn(document.documentElement, 'setAttribute');
      localStorageSetSpy('theme', 'dark');

      app.toggleTheme();

      expect(document.documentElement.getAttribute).toHaveBeenCalledWith('data-theme');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorageSetSpy).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('setInitialTheme', () => {
    beforeEach(() => {
      // Reset localStorageStore and clear spy history
      localStorageStore = {};
      localStorageGetSpy.mockClear();
      localStorageSetSpy.mockClear();
      localStorageRemoveSpy.mockClear();
      app = new BpmApp();
      app.elements = createMockElements();
    });

    test('loads saved theme from localStorage', () => {
      localStorageStore.theme = 'dark';

      app.setInitialTheme();

      expect(localStorageGetSpy).toHaveBeenCalledWith('theme');
      expect(localStorageGetSpy.mock.results[0].value).toBe('dark');
    });

    test('defaults to light theme when no saved theme', () => {
      delete localStorageStore.theme;

      app.setInitialTheme();

      expect(localStorageGetSpy).toHaveBeenCalledWith('theme');
      expect(localStorageGetSpy.mock.results[0].value).toBe(null);
    });
  });

  describe('addBpmEvent with realistic timing', () => {
    beforeEach(() => {
      app = new BpmApp();
      app.elements = createMockElements();
      app.tapTimestamps = [];
      app.startTime = null;
      app.intervals = [];
    });

    test('simulates ~60 BPM with 1-second intervals', () => {
      const startTime = 1000;
      const tapTimes = [startTime, startTime + 1000, startTime + 2000, startTime + 3000];

      tapTimes.forEach(t => {
        vi.spyOn(performance, 'now').mockReturnValue(t);
        app.addBpmEvent();
      });

      expect(app.intervals.length).toBe(3);
      expect(app.intervals).toEqual([1000, 1000, 1000]);
    });
  });
});

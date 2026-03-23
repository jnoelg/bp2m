/**
 * BPM App - Vanilla JavaScript implementation
 * Measures beats per minute (BPM) by recording tap intervals
 */

class BpmApp {
  constructor() {
    // State
    this.tapTimestamps = [];
    this.intervals = [];
    this.startTime = null;
    this.chart = null;

    // DOM Elements cache
    this.elements = {};

    // Configuration
    this.MAX_INTERVALS = 100;
    this.THIRD_STD_DEV_MULTIPLIER = 3;
  }

  /**
   * Initialize the application
   */
  init() {
    // Cache DOM elements
    this.cacheElements();

    // Initialize chart
    this.initializeChart();

    // Setup event listeners
    this.setupEventListeners();

    // Set initial theme
    this.setInitialTheme();
  }

  /**
   * Cache DOM elements for efficient access
   */
  cacheElements() {
    this.elements.tapBtn = document.getElementById('tap-btn');
    this.elements.resetLink = document.getElementById('reset-link');
    this.elements.themeToggle = document.getElementById('theme-toggle');
    this.elements.emptyStateEl = document.getElementById('empty-state');
    this.elements.resultsEl = document.getElementById('results');
    this.elements.avgBpmEl = document.getElementById('avg-bpm');
    this.elements.filteredBpmEl = document.getElementById('filtered-bpm');
    this.elements.avgIntervalEl = document.getElementById('avg-interval');
    this.elements.stdDevEl = document.getElementById('std-dev');
    this.elements.beatCountEl = document.getElementById('beat-count');
    this.elements.durationEl = document.getElementById('duration');
  }

  /**
   * Calculate statistics from tap intervals
   * @returns {Object|null} Statistics object or null if no intervals
   */
  calculateStats() {
    if (this.intervals.length < 1) {
      return null;
    }

    const sum = this.intervals.reduce((a, b) => a + b, 0);
    const avg = sum / this.intervals.length;

    // Calculate standard deviation
    const squareDiffs = this.intervals.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // Filter intervals within 3 standard deviations
    const intervalsWithin3StdDev = this.intervals.filter(
      value => Math.abs(value - avg) <= this.THIRD_STD_DEV_MULTIPLIER * stdDev
    );
    const sumWithin3StdDev = intervalsWithin3StdDev.reduce((a, b) => a + b, 0);
    const avgWithin3StdDev = sumWithin3StdDev / intervalsWithin3StdDev.length;

    return {
      avg,
      stdDev,
      avgWithin3StdDev
    };
  }

  /**
   * Update the UI based on current state
   */
  updateUI() {
    const stats = this.calculateStats();

    if (!stats) {
      this.elements.emptyStateEl.style.display = 'block';
      this.elements.resultsEl.style.display = 'none';
      return;
    }

    this.elements.emptyStateEl.style.display = 'none';
    this.elements.resultsEl.style.display = 'block';

    const avgBpm = 60000 / stats.avg;
    const filteredBpm = 60000 / stats.avgWithin3StdDev;

    this.elements.avgBpmEl.textContent = avgBpm.toFixed(1);
    this.elements.filteredBpmEl.textContent = filteredBpm.toFixed(1);
    this.elements.avgIntervalEl.textContent = stats.avg.toFixed(0);
    this.elements.stdDevEl.textContent = stats.stdDev.toFixed(0);

    this.elements.beatCountEl.textContent = this.tapTimestamps.length;
    const duration = (this.tapTimestamps[this.tapTimestamps.length - 1] - this.startTime) / 1000;
    this.elements.durationEl.textContent = duration.toFixed(1) + 's';

    this.updateChart();
  }

  /**
   * Handle a tap event
   */
  addBpmEvent() {
    const now = performance.now();

    if (this.tapTimestamps.length === 0) {
      this.startTime = now;
    }

    this.tapTimestamps.push(now);

    if (this.tapTimestamps.length > 1) {
      const interval = this.tapTimestamps[this.tapTimestamps.length - 1] - this.tapTimestamps[this.tapTimestamps.length - 2];
      this.intervals.push(interval);
    }

    // Keep only last MAX_INTERVALS intervals for performance
    if (this.intervals.length > this.MAX_INTERVALS) {
      this.intervals.shift();
      this.tapTimestamps.shift();
    }

    this.updateUI();
  }

  /**
   * Reset all state
   */
  reset() {
    this.tapTimestamps = [];
    this.intervals = [];
    this.startTime = null;
    this.updateUI();

    if (this.chart) {
      this.chart.data.labels = [];
      this.chart.data.datasets[0].data = [];
      this.chart.update();
    }
  }

  /**
   * Initialize Chart.js instance
   */
  initializeChart() {
    const ctx = document.getElementById('bpmChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'BPM per Tap',
          data: [],
          borderColor: '#007bff',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            title: { display: true, text: 'BPM' }
          },
          x: {
            title: { display: true, text: 'Tap Count' }
          }
        }
      }
    });
  }

  /**
   * Update the BPM chart with current data
   */
  updateChart() {
    if (!this.chart) return;

    const bpmValues = this.intervals.map(interval => 60000 / interval);
    this.chart.data.labels = bpmValues.map((_, i) => i + 1);
    this.chart.data.datasets[0].data = bpmValues;
    this.chart.update();
  }

  /**
   * Toggle dark/light theme
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateThemeIcon(newTheme);
  }

  /**
   * Update the theme toggle icon
   */
  updateThemeIcon(theme) {
    const icon = theme === 'dark' ? 'moon-stars' : 'sun';
    this.elements.themeToggle.innerHTML = `<i class="bi bi-${icon}"></i>`;
  }

  /**
   * Set initial theme from localStorage
   */
  setInitialTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    this.elements.tapBtn.addEventListener('click', () => this.addBpmEvent());

    this.elements.resetLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.reset();
    });

    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BpmApp;
}

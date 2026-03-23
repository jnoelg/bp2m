# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BP2M (Beats Per Minute Meter) is a vanilla JavaScript web application that measures BPM by recording tap intervals. The app uses plain HTML, CSS, and JavaScript with no frameworks or build steps.

## Architecture

### Application Structure

```
src/
├── index.html          # Main application with Bootstrap 5 styling
└── js/
    ├── bpm-app.js      # Core BpmApp class with BPM measurement logic
    └── bpm-app.test.js # Vitest unit tests
```

### Key Components

**BpmApp Class (`src/js/bpm-app.js`):**
- State management: `tapTimestamps`, `intervals`, `startTime`, `chart`
- Core methods:
  - `init()` - Initialize DOM elements, chart, and event listeners
  - `addBpmEvent()` - Record tap timestamp and calculate interval
  - `calculateStats()` - Compute average, standard deviation, and filtered BPM
  - `updateUI()` - Update statistics display and chart
  - `toggleTheme()` - Switch between light/dark mode with localStorage persistence
- Configuration: `MAX_INTERVALS = 100` (keeps recent intervals for performance)

**Dependencies:**
- Bootstrap 5.3.3 (UI framework)
- Bootstrap Icons (icon library)
- Chart.js 4.4.2 (BPM visualization)

### Testing

**Unit Tests (Vitest):** `src/js/bpm-app.test.js`
- Tests BPM measurement logic, stats calculation, UI updates
- Uses JSDOM environment (configured in `vitest.config.ts`)
- Runs via: `npm test:unit` or `vitest run`

**E2E Tests (Playwright):** `e2e/bpm-app.spec.ts`
- Tests full app flow: tapping, stats display, theme toggle
- Runs against server at `http://localhost:8000` (configured in `playwright.config.ts`)
- Runs via: `npm test:e2e` or `npx playwright test`

## Commands

### Setup

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the application
npm start

# Open http://localhost:8000 in browser
```

### Testing

```bash
# Run all unit tests
npm test:unit

# Run unit tests in watch mode
npm test:unit:watch

# Run all E2E tests
npm test:e2e

# Run single E2E test file
npx playwright test e2e/bpm-app.spec.ts

# Run single unit test file
vitest run src/js/bpm-app.test.js

# Debug unit tests
vitest src/js/bpm-app.test.js --update

# Debug E2E tests
npx playwright test e2e/bpm-app.spec.ts --debug
```

## Code Patterns

### Theme Toggle Icon Updates

When updating the theme icon class names, use these patterns:
- Light mode: `bi-sun`
- Dark mode: `bi-moon-stars`

The `updateThemeIcon()` method in `bpm-app.js` handles this dynamically based on the current theme.

### BPM Calculation

BPM is calculated from intervals:
```javascript
// Interval in milliseconds
BPM = 60000 / interval_ms
```

### Stats Filtering

Intervals are filtered using 3 standard deviations:
```javascript
// Keep intervals where |interval - avg| <= 3 * stdDev
const filtered = intervals.filter(v => Math.abs(v - avg) <= 3 * stdDev);
```

## Data Flow

1. User taps the heart button
2. `addBpmEvent()` records timestamp and calculates interval
3. `calculateStats()` computes statistics from intervals
4. `updateUI()` displays results and updates Chart.js
5. Chart shows BPM per tap for each interval
6. User can reset data via "Reset Data" link

## Notes

- No linting configuration (no ESLint/Prettier)
- Tests use JSDOM for DOM simulation
- The app serves static files directly via `serve`

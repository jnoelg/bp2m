This document provides a high-level overview of the project for AI agents.

## Project Goal

BP2M (Beats Per Minute Meter) is a lightweight vanilla JavaScript web application that measures BPM by recording tap intervals. Primary goals: simplicity and maintainability with zero framework dependencies.

## Technology Stack

**Frontend:**
- Vanilla HTML, CSS, JavaScript
- Bootstrap 5.3.3 (UI framework)
- Bootstrap Icons
- Chart.js 4.4.2 (BPM visualization)

**Testing:**
- Vitest (unit tests in `src/js/*.test.js`)
- Playwright (E2E tests in `e2e/`)

**Dev Dependencies:**
- serve (static file server)
- jsdom (test environment)
- eslint (code linting)
- prettier (code formatting)

## Development Workflow

**Commands:**
- `npm install` - Install dependencies
- `npm start` - Start server on port 8000
- `npm test:unit` - Run Vitest unit tests
- `npm test:e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

**Files:**
- Main app: `src/index.html` (loads `src/js/bpm-app.js`)
- BpmApp class: `src/js/bpm-app.js`
- Unit tests: `src/js/bpm-app.test.js` (JSDOM environment)
- E2E tests: `e2e/bpm-app.spec.ts`

## Key Implementation Details

**BPM Calculation:**
```javascript
BPM = 60000 / interval_ms
```

**Stats Filtering:**
- Keeps intervals where `|interval - avg| <= 3 * stdDev`

**Theme Toggle Icons:**
- Light mode: `bi-sun`
- Dark mode: `bi-moon-stars`
- Preference persisted in localStorage

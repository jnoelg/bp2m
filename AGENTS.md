This document provides a high-level overview of the project for AI agents.

## Project Goal

This is a lightweight, dependency-free web application for calculating Beats Per Minute (BPM). The primary goal is simplicity and maintainability, with zero reliance on web frameworks or complex build systems.

## Technology Stack

*   **Application:** Vanilla HTML, CSS, and JavaScript.
    *   All application code is contained within `src/index.html`.
    *   External libraries (Bootstrap, Chart.js) are loaded via CDN.
*   **Testing:** End-to-end tests are handled by [Playwright](https://playwright.dev/). Unit tests are handled by [Vitest](https://vitest.dev/).
    *   End-to-end test files are located in the `e2e/` directory.
    *   The E2E configuration is in `playwright.config.ts`.
    *   Unit test files are located in `src/` with `.test.js` suffix.
    *   The unit test configuration is in `vitest.config.ts`.

## Development Workflow

*   **Installation:** Run `npm install` to get the development dependencies (`http-server`, `playwright`, `vitest`).
*   **Running the App:** Use `npm start` to launch a local server.
*   **Running Tests:** Use `npm test:e2e` to execute the Playwright test suite. Use `npm test:unit` to execute the vitest test suite.

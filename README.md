# BP2M - Beats Per Minute Meter

A simple, lightweight web application to measure Beats Per Minute (BPM) by tapping.

This project is built with plain HTML, CSS, and JavaScript, with no frameworks or build steps required.

## Getting Started

1.  **Install Dependencies:**
    This project uses `http-server` to serve the application and `Playwright` for end-to-end testing. Install the development dependencies using npm:
    ```bash
    npm install
    ```

2.  **Start the Application:**
    To serve the application locally, run the following command:
    ```bash
    npm start
    ```
    Once the server is running, open your browser and navigate to `http://localhost:8000/`.

## Running Tests

The end-to-end tests are written using [Playwright](https://playwright.dev/). To execute those tests, run:

```bash
npm test:e2e
```

The unit tests are written using [Vitest](https://vitest.dev/). To execute those tests, run

```bash
npm test:unit
```

/**
 * @file: playwright.config.ts
 * @description: Конфігурація Playwright для e2e-сценаріїв фронтенду.
 * @dependencies: @playwright/test
 * @created: 2025-11-09
 */

import { defineConfig, devices } from "@playwright/test";

type WebServerConfig = NonNullable<
  NonNullable<ReturnType<typeof defineConfig>["webServer"]>
>;

const DEFAULT_PORT = Number(process.env.PLAYWRIGHT_APP_PORT ?? "3000");
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`;

const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_CMD;
const webServer: WebServerConfig | undefined = webServerCommand
  ? {
      command: webServerCommand,
      port: DEFAULT_PORT,
      timeout: 120_000,
      reuseExistingServer: true,
    }
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["html", { outputFolder: "playwright-report" }]] : "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 14"],
      },
    },
  ],
  webServer,
});



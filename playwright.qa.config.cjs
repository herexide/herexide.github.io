const { defineConfig } = require("playwright/test");

module.exports = defineConfig({
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.LANDING_URL || "http://127.0.0.1:4174",
    browserName: "chromium",
    channel: "chrome",
    headless: true
  }
});


require("dotenv").config();

const { chromium } = require("playwright-core");

async function testBrowser() {
  let browser;

  try {
    const token = process.env.BROWSERLESS_TOKEN;

    if (!token) {
      throw new Error("Browserless token is missing from .env");
    }

    const browserlessURL =
      `wss://production-sfo.browserless.io?token=${token}`;

    console.log("Connecting to Browserless...");

    browser = await chromium.connectOverCDP(browserlessURL);

    const context = browser.contexts()[0];
    const page = await context.newPage();

    await page.goto("https://example.com");

    console.log("Browserless connection successful!");
    console.log("Page title:", await page.title());

  } catch (error) {
    console.error("Browserless connection failed:", error.message);

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testBrowser();

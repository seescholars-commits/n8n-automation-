
require("dotenv").config();

const express = require("express");
const { chromium } = require("playwright-core");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    browserlessConfigured: Boolean(process.env.BROWSERLESS_TOKEN)
  });
});

app.get("/test-browser", async (req, res) => {
  let browser;

  try {
    const token = process.env.BROWSERLESS_TOKEN;

    if (!token) {
      throw new Error("Browserless token is missing");
    }

    const url = `wss://production-sfo.browserless.io?token=${token}`;

    browser = await chromium.connectOverCDP(url);

    const page = await browser.newPage();
    await page.goto("https://example.com");

    const title = await page.title();

    res.json({
      status: "success",
      message: "Render connected to Browserless",
      pageTitle: title
    });

  } catch (error) {
    console.error("Browserless error:", error.message);

    res.status(500).json({
      status: "error",
      message: error.message
    });

  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const { chromium } = require("playwright-core");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));

// Check that the request comes from our n8n workflow
function authenticate(req, res, next) {
  const suppliedSecret = req.get("x-automation-secret");
  const expectedSecret = process.env.AUTOMATION_SECRET;

  if (!expectedSecret || !suppliedSecret) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required"
    });
  }

  const supplied = Buffer.from(suppliedSecret);
  const expected = Buffer.from(expectedSecret);

  if (
    supplied.length !== expected.length ||
    !crypto.timingSafeEqual(supplied, expected)
  ) {
    return res.status(401).json({
      status: "error",
      message: "Invalid authentication"
    });
  }

  next();
}

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    browserlessConfigured: Boolean(process.env.BROWSERLESS_TOKEN),
    automationSecretConfigured: Boolean(process.env.AUTOMATION_SECRET)
  });
});

app.get("/test-browser", async (req, res) => {
  let browser;

  try {
    const token = process.env.BROWSERLESS_TOKEN;

    if (!token) {
      throw new Error("Browserless token is missing");
    }

    const url = `wss://production-sfo.browserless.io/chromium/playwright?token=${token}&profile=seenepal-squarespace`;

    browser = await chromium.connectOverCDP(url);

    const context = browser.contexts()[0];
    const page = await context.newPage();
    await page.goto("https://account.squarespace.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    res.json({
      status: "success",
      pageTitle: await page.title(),
      currentUrl: page.url()
    });
  } catch (error) {
    console.error("Browserless error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Browserless connection failed"
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Squarespace draft endpoint - browser automation will be added next
app.post("/create-draft", authenticate, async (req, res) => {
  const { studentNumber, title, content } = req.body;

  if (!studentNumber || !title || !content) {
    return res.status(400).json({
      status: "error",
      message: "studentNumber, title and content are required"
    });
  }

  return res.status(501).json({
    status: "pending",
    message: "Authentication and request validation succeeded. Squarespace draft creation is not implemented yet.",
    studentNumber
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

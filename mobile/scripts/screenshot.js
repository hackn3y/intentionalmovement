#!/usr/bin/env node

/**
 * Automated screenshot utility using Puppeteer
 * Takes screenshots of the running Expo web app
 *
 * Usage:
 *   node scripts/screenshot.js [url] [output-path]
 *
 * Examples:
 *   node scripts/screenshot.js http://localhost:8091
 *   node scripts/screenshot.js http://localhost:8091 screenshots/home.png
 *   node scripts/screenshot.js http://localhost:8091/profile screenshots/profile.png
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Default configuration
const DEFAULT_URL = 'http://localhost:8091';
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
const DEFAULT_VIEWPORT = {
  width: 375,  // iPhone viewport width
  height: 812, // iPhone viewport height
  deviceScaleFactor: 2,
};

async function takeScreenshot(url, outputPath, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport (mobile by default)
    await page.setViewport(options.viewport || DEFAULT_VIEWPORT);

    // Navigate to URL
    console.log(`Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait a bit for animations/rendering
    await new Promise(resolve => setTimeout(resolve, options.delay || 1000));

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Take screenshot
    console.log(`Taking screenshot...`);
    await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage || false,
    });

    console.log(`Screenshot saved to: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || DEFAULT_URL;
  const outputPath = args[1] || path.join(DEFAULT_OUTPUT_DIR, `screenshot-${Date.now()}.png`);

  takeScreenshot(url, outputPath)
    .then((path) => {
      console.log('Success!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error.message);
      process.exit(1);
    });
}

// Export for programmatic use
module.exports = { takeScreenshot, DEFAULT_URL, DEFAULT_OUTPUT_DIR, DEFAULT_VIEWPORT };

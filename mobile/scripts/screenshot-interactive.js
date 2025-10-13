#!/usr/bin/env node

/**
 * Interactive screenshot utility for testing and debugging
 * Can click elements and navigate through the app
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DEFAULT_URL = 'http://localhost:8091';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const VIEWPORT = {
  width: 375,
  height: 812,
  deviceScaleFactor: 2,
};

async function takeAppScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    console.log('Starting screenshot tour...\n');

    // 1. Welcome screen
    console.log('📸 Capturing welcome screen...');
    await page.goto(DEFAULT_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-welcome.png') });
    console.log('✓ Saved: 01-welcome.png\n');

    // 2. Try to click "I Already Have an Account" button
    try {
      console.log('📸 Clicking "I Already Have an Account"...');
      await page.waitForSelector('text/I Already Have an Account', { timeout: 5000 });
      await page.click('text/I Already Have an Account');
      await new Promise(resolve => setTimeout(resolve, 1500));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-login.png') });
      console.log('✓ Saved: 02-login.png\n');
    } catch (error) {
      console.log('⚠ Could not find login link, skipping...\n');
    }

    // 3. Try to go back and click "Get Started"
    try {
      console.log('📸 Going back to welcome...');
      await page.goBack();
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📸 Clicking "Get Started"...');
      await page.waitForSelector('text/Get Started', { timeout: 5000 });
      await page.click('text/Get Started');
      await new Promise(resolve => setTimeout(resolve, 1500));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-register.png') });
      console.log('✓ Saved: 03-register.png\n');
    } catch (error) {
      console.log('⚠ Could not navigate to register, skipping...\n');
    }

    // 4. Check if we can see any authenticated screens
    // (This would require login credentials, so we'll skip for now)

    console.log('\n✅ Screenshot tour complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

    return {
      success: true,
      screenshotsDir: SCREENSHOTS_DIR,
    };

  } catch (error) {
    console.error('❌ Error during screenshot tour:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  takeAppScreenshots()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error.message);
      process.exit(1);
    });
}

module.exports = { takeAppScreenshots };

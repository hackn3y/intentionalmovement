const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshot() {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 812,
      isMobile: true,
      hasTouch: true
    });

    console.log('Navigating to mobile app...');
    await page.goto('https://mobile-kappa-orpin.vercel.app/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait a bit for the app to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Taking screenshot of home page...');
    const homeScreenshotPath = path.join(__dirname, 'home-screenshot.png');
    await page.screenshot({
      path: homeScreenshotPath,
      fullPage: false
    });
    console.log(`✅ Home screenshot saved`);

    // Try to navigate to programs
    console.log('Looking for Programs link...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const screenshotPath = path.join(__dirname, 'program-detail-screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

takeScreenshot();

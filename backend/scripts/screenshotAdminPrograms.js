const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Login first
    console.log('Navigating to login page...');
    const baseUrl = 'https://intentionalmovementcorp-admin.vercel.app';
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for login form to load
    await page.waitForSelector('#email', { timeout: 15000 });

    // Fill in login form
    await page.type('#email', 'hackn3y@gmail.com');
    await page.type('#password', 'Password1');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Logged in successfully');

    // Navigate to Programs page
    console.log('Navigating to Programs page...');
    await page.goto(`${baseUrl}/programs`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Take desktop screenshot
    console.log('Taking desktop screenshot...');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({
      path: path.join(__dirname, 'programs-desktop.png'),
      fullPage: true
    });
    console.log('Saved: programs-desktop.png');

    // Take tablet screenshot
    console.log('Taking tablet screenshot...');
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(__dirname, 'programs-tablet.png'),
      fullPage: true
    });
    console.log('Saved: programs-tablet.png');

    // Take mobile screenshot (with hamburger menu)
    console.log('Taking mobile screenshot...');
    await page.setViewport({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(__dirname, 'programs-mobile.png'),
      fullPage: true
    });
    console.log('Saved: programs-mobile.png');

    // Take mobile with hamburger open
    console.log('Opening hamburger menu...');
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(__dirname, 'programs-mobile-menu-open.png'),
      fullPage: true
    });
    console.log('Saved: programs-mobile-menu-open.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  }

  await browser.close();
  console.log('Done!');
}

takeScreenshots();

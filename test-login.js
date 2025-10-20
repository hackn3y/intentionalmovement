const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  // Navigate to the app
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for and click "Sign In" button
  await page.waitForSelector('text/Sign In', { timeout: 10000 });
  await page.click('text/Sign In');

  // Wait for login screen to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take screenshot of login screen
  await page.screenshot({ path: 'C:\\Users\\PC\\Documents\\login-screenshot.png', fullPage: true });

  console.log('Login screen screenshot saved!');

  // Keep browser open for manual inspection
  // await browser.close();
})();

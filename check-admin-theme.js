const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to login page
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait for login form
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Fill in login credentials
  await page.type('input[type="email"]', 'admin@intentionalmovement.com');
  await page.type('input[type="password"]', 'admin123');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Wait a bit more for content to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take a screenshot
  await page.screenshot({ path: 'admin-dashboard-screenshot.png', fullPage: true });

  console.log('Screenshot saved as admin-dashboard-screenshot.png');

  await browser.close();
})();

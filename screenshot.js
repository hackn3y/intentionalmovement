const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: 'C:\\Users\\PC\\Documents\\welcome-screenshot.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved!');
})();

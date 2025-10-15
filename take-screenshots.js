const puppeteer = require('puppeteer');
const path = require('path');

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  try {
    // Screenshot 1: Admin Dashboard (Logged In View)
    console.log('Taking admin dashboard screenshot...');
    const adminPage = await browser.newPage();

    // Set light mode in localStorage before loading the page
    await adminPage.evaluateOnNewDocument(() => {
      localStorage.setItem('darkMode', 'false');
    });

    await adminPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // Log in to see the dashboard with Layout.js theme
    console.log('Logging in to admin dashboard...');
    await adminPage.type('input[type="email"]', 'john@example.com');
    await adminPage.type('input[type="password"]', 'Password123!');
    await adminPage.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any animations

    console.log('Dashboard loaded in light mode');

    await adminPage.screenshot({
      path: path.join(__dirname, 'admin-dashboard-theme.png'),
      fullPage: true
    });
    console.log('Admin dashboard screenshot saved to admin-dashboard-theme.png');

    // Screenshot 2: Mobile App (Welcome Screen)
    console.log('Taking mobile app screenshot...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 414, height: 896 }); // iPhone 11 Pro size
    await mobilePage.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for Expo to load
    await mobilePage.screenshot({
      path: path.join(__dirname, 'mobile-app-theme.png'),
      fullPage: true
    });
    console.log('Mobile app screenshot saved to mobile-app-theme.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();

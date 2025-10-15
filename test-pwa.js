const puppeteer = require('puppeteer');
const path = require('path');

async function testPWA() {
  console.log('🚀 Starting PWA Tests...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 414, height: 896 }, // iPhone 11 Pro size
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  try {
    const page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'log') {
        console.log('   📋 Browser:', msg.text());
      } else if (type === 'error') {
        console.error('   ❌ Browser Error:', msg.text());
      }
    });

    console.log('📱 Loading PWA at http://localhost:8081...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait a bit for everything to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 1: Check if manifest is loaded
    console.log('\n🔍 Test 1: Checking Manifest...');
    const manifestLink = await page.$('link[rel="manifest"]');
    if (manifestLink) {
      const manifestHref = await page.evaluate(el => el.href, manifestLink);
      console.log('   ✅ Manifest link found:', manifestHref);

      try {
        const manifestResponse = await page.goto(manifestHref, { waitUntil: 'networkidle2' });
        const manifestContent = await manifestResponse.json();
        console.log('   ✅ Manifest loaded successfully');
        console.log('   📝 App name:', manifestContent.name);
        console.log('   📝 Theme color:', manifestContent.theme_color);
        console.log('   📝 Icons:', manifestContent.icons?.length || 0);

        // Go back to main page
        await page.goBack();
      } catch (error) {
        console.log('   ⚠️  Could not parse manifest:', error.message);
      }
    } else {
      console.log('   ❌ Manifest link not found');
    }

    // Test 2: Check Service Worker registration
    console.log('\n🔍 Test 2: Checking Service Worker...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const serviceWorkerStatus = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            resolve({
              registered: true,
              active: !!registration.active,
              scope: registration.scope,
              state: registration.active?.state
            });
          }).catch(err => {
            resolve({ registered: false, error: err.message });
          });
        } else {
          resolve({ registered: false, error: 'Service Worker not supported' });
        }
      });
    });

    if (serviceWorkerStatus.registered) {
      console.log('   ✅ Service Worker registered');
      console.log('   📝 Active:', serviceWorkerStatus.active);
      console.log('   📝 State:', serviceWorkerStatus.state);
      console.log('   📝 Scope:', serviceWorkerStatus.scope);
    } else {
      console.log('   ⚠️  Service Worker not registered:', serviceWorkerStatus.error);
    }

    // Test 3: Check PWA install prompt
    console.log('\n🔍 Test 3: Checking Install Prompt...');
    const hasBeforeInstallPrompt = await page.evaluate(() => {
      return new Promise((resolve) => {
        let promptFired = false;
        window.addEventListener('beforeinstallprompt', (e) => {
          promptFired = true;
          resolve(true);
        });

        // Check if it fires within 1 second
        setTimeout(() => {
          resolve(promptFired);
        }, 1000);
      });
    });

    if (hasBeforeInstallPrompt) {
      console.log('   ✅ beforeinstallprompt event available');
    } else {
      console.log('   ⚠️  beforeinstallprompt not fired (normal for localhost or already installed)');
    }

    // Test 4: Check PWA meta tags
    console.log('\n🔍 Test 4: Checking PWA Meta Tags...');
    const metaTags = await page.evaluate(() => {
      return {
        themeColor: document.querySelector('meta[name="theme-color"]')?.content,
        appleMobileWebAppCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content,
        appleMobileWebAppTitle: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content,
        appleStatusBarStyle: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.content,
        mobileWebAppCapable: document.querySelector('meta[name="mobile-web-app-capable"]')?.content,
      };
    });

    console.log('   Theme Color:', metaTags.themeColor || '❌ Not found');
    console.log('   Apple Mobile Web App Capable:', metaTags.appleMobileWebAppCapable || '❌ Not found');
    console.log('   Apple Mobile Web App Title:', metaTags.appleMobileWebAppTitle || '❌ Not found');
    console.log('   Apple Status Bar Style:', metaTags.appleStatusBarStyle || '❌ Not found');
    console.log('   Mobile Web App Capable:', metaTags.mobileWebAppCapable || '❌ Not found');

    // Test 5: Check icons
    console.log('\n🔍 Test 5: Checking Icons...');
    const icons = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel*="icon"]'));
      return links.map(link => ({
        rel: link.rel,
        href: link.href,
        sizes: link.sizes.value
      }));
    });

    console.log('   Found', icons.length, 'icon links');
    icons.forEach((icon, i) => {
      console.log(`   ${i + 1}. ${icon.rel} (${icon.sizes || 'no size'}): ${icon.href}`);
    });

    // Test 6: Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({
      path: path.join(__dirname, 'pwa-test-screenshot.png'),
      fullPage: true
    });
    console.log('   ✅ Screenshot saved: pwa-test-screenshot.png');

    // Test 7: Check if app is installable
    console.log('\n🔍 Test 6: Checking Installability...');
    const installability = await page.evaluate(() => {
      return {
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isFullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
        isMinimalUi: window.matchMedia('(display-mode: minimal-ui)').matches,
        isBrowser: window.matchMedia('(display-mode: browser)').matches,
      };
    });

    console.log('   Display Mode - Standalone:', installability.isStandalone ? '✅' : '❌');
    console.log('   Display Mode - Browser:', installability.isBrowser ? '✅' : '❌');

    if (!installability.isStandalone) {
      console.log('   💡 App is running in browser mode (normal for testing)');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PWA Test Summary');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Manifest loaded', passed: !!manifestLink },
      { name: 'Service Worker registered', passed: serviceWorkerStatus.registered },
      { name: 'Theme color set', passed: !!metaTags.themeColor },
      { name: 'Apple PWA tags present', passed: !!metaTags.appleMobileWebAppCapable },
      { name: 'Icons configured', passed: icons.length > 0 },
    ];

    const passedTests = tests.filter(t => t.passed).length;
    const totalTests = tests.length;

    tests.forEach(test => {
      console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
    });

    console.log('='.repeat(60));
    console.log(`Results: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(60));

    if (passedTests === totalTests) {
      console.log('\n🎉 All PWA tests passed! Your app is ready to be installed as a PWA!');
    } else {
      console.log('\n⚠️  Some tests failed. Review the output above for details.');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Open Chrome DevTools → Application tab → Manifest');
    console.log('   2. Check Service Workers registration');
    console.log('   3. Run Lighthouse audit for detailed PWA score');
    console.log('   4. Test installation on an Android device');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
  } finally {
    console.log('\n⏰ Keeping browser open for 10 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
    console.log('✅ Browser closed');
  }
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║          Intentional Movement - PWA Test Suite           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

testPWA().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

/**
 * Post-build script to fix PWA configuration after Expo export
 * Run this after: npx expo export --platform web
 */

const distDir = path.join(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

console.log('🔧 Running post-build PWA fixes...\n');

// Fix 1: Enable scrolling on web
console.log('1. Fixing scroll functionality...');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace overflow: hidden with overflow: auto
  html = html.replace(
    /body\s*{\s*overflow:\s*hidden;/g,
    'body {\n        overflow: auto;'
  );

  // Replace height: 100% with min-height: 100% on root
  html = html.replace(
    /#root\s*{\s*display:\s*flex;\s*height:\s*100%;/g,
    '#root {\n        display: flex;\n        min-height: 100%;'
  );

  fs.writeFileSync(indexPath, html);
  console.log('   ✅ Scroll fixed in index.html');
} else {
  console.log('   ⚠️  index.html not found');
}

// Fix 2: Copy PWA files
console.log('\n2. Copying PWA files...');
const filesToCopy = [
  { src: '../web/manifest.json', dest: 'manifest.json' },
  { src: '../web/service-worker.js', dest: 'service-worker.js' },
  { src: '../web/offline.html', dest: 'offline.html' },
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(distDir, dest);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✅ Copied ${dest}`);
  } else {
    console.log(`   ⚠️  ${src} not found`);
  }
});

// Fix 3: Copy icons directory
console.log('\n3. Copying PWA icons...');
const iconsDir = path.join(__dirname, '../web/icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }

  const iconFiles = fs.readdirSync(iconsDir);
  iconFiles.forEach(file => {
    fs.copyFileSync(
      path.join(iconsDir, file),
      path.join(distIconsDir, file)
    );
  });
  console.log(`   ✅ Copied ${iconFiles.length} icon files`);
} else {
  console.log('   ⚠️  icons directory not found');
}

// Fix 4: Verify PWA meta tags are present
console.log('\n4. Verifying PWA meta tags...');
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');

  const checks = {
    'manifest link': html.includes('<link rel="manifest"'),
    'theme-color': html.includes('name="theme-color"'),
    'apple-mobile-web-app-capable': html.includes('name="apple-mobile-web-app-capable"'),
    'service worker registration': html.includes('serviceWorker.register'),
  };

  Object.entries(checks).forEach(([check, present]) => {
    console.log(`   ${present ? '✅' : '❌'} ${check}`);
  });
}

console.log('\n✅ Post-build PWA fixes complete!');
console.log('\n📝 Next steps:');
console.log('   1. Test at http://localhost:3000 (if serving)');
console.log('   2. Run Lighthouse audit');
console.log('   3. Deploy to Vercel/Netlify\n');

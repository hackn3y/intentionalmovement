const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
];

const sourceIcon = path.join(__dirname, '../assets/icon.png');
const outputDir = path.join(__dirname, '../web/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from:', sourceIcon);
  console.log('Output directory:', outputDir);

  for (const { size, name } of sizes) {
    const outputPath = path.join(outputDir, name);

    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 253, g: 242, b: 248, alpha: 1 } // Light pink background (#fdf2f8)
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  console.log('\n✓ All PWA icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});

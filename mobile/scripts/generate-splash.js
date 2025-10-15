const sharp = require('sharp');
const path = require('path');

const sourceIcon = path.join(__dirname, '../assets/icon.png');
const splashPath = path.join(__dirname, '../assets/splash.png');

async function generateSplash() {
  console.log('Generating splash screen...');

  // Create a 1284x2778 splash screen (iPhone 12 Pro Max size)
  // with the icon centered on a light pink background
  await sharp({
    create: {
      width: 1284,
      height: 2778,
      channels: 4,
      background: { r: 253, g: 242, b: 248, alpha: 1 } // #fdf2f8
    }
  })
    .composite([
      {
        input: await sharp(sourceIcon)
          .resize(400, 400, { fit: 'contain' })
          .toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(splashPath);

  console.log('✓ Splash screen generated:', splashPath);
}

generateSplash().catch(err => {
  console.error('Error generating splash:', err);
  process.exit(1);
});

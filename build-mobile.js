#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Change to mobile directory
const mobileDir = path.join(__dirname, 'mobile');
process.chdir(mobileDir);

console.log('Building mobile app from directory:', process.cwd());

// Run the build command
try {
  execSync('npm run build:pwa', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

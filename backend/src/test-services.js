/**
 * Service Testing Script
 * Run with: node src/test-services.js
 *
 * Tests all configured external services:
 * - SendGrid Email
 * - AWS S3 File Upload
 * - Mux Video
 * - Firebase (requires mobile app for full test)
 */

require('dotenv').config();
const emailService = require('./services/emailService');
const s3Service = require('./services/s3Service');
const videoService = require('./services/videoService');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(service, message) {
  log(`✅ ${service}: ${message}`, 'green');
}

function logError(service, message) {
  log(`❌ ${service}: ${message}`, 'red');
}

function logInfo(service, message) {
  log(`ℹ️  ${service}: ${message}`, 'blue');
}

// Test SendGrid Email Service
async function testEmailService() {
  log('\n📧 Testing SendGrid Email Service...', 'yellow');

  try {
    const testEmail = process.env.TEST_EMAIL || 'hackn3y@gmail.com';

    const result = await emailService.sendEmail({
      to: testEmail,
      subject: 'Test Email from Intentional Movement Corp',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your backend server.</p>
        <p>If you're seeing this, SendGrid is configured correctly! 🎉</p>
        <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
      `,
      text: 'This is a test email from your backend server. SendGrid is working!'
    });

    logSuccess('SendGrid', `Email sent successfully to ${testEmail}`);
    logInfo('SendGrid', `Status Code: ${result[0].statusCode}`);
    return true;
  } catch (error) {
    logError('SendGrid', error.message);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return false;
  }
}

// Test AWS S3 File Upload
async function testS3Service() {
  log('\n☁️  Testing AWS S3 File Upload...', 'yellow');

  try {
    // Create a test file buffer
    const testContent = `Test file uploaded at ${new Date().toISOString()}`;
    const testFile = {
      originalname: 'test-file.txt',
      buffer: Buffer.from(testContent),
      mimetype: 'text/plain'
    };

    const result = await s3Service.uploadFile(testFile, 'tests');

    logSuccess('AWS S3', 'File uploaded successfully');
    logInfo('AWS S3', `URL: ${result.url}`);
    logInfo('AWS S3', `Key: ${result.key}`);

    // Test if file exists
    const exists = await s3Service.fileExists(result.key);
    logSuccess('AWS S3', `File verification: ${exists ? 'PASSED' : 'FAILED'}`);

    // Clean up - delete test file
    await s3Service.deleteFile(result.key);
    logSuccess('AWS S3', 'Test file cleaned up');

    return true;
  } catch (error) {
    logError('AWS S3', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Test Mux Video Service
async function testMuxService() {
  log('\n🎥 Testing Mux Video Service...', 'yellow');

  try {
    // Create a direct upload URL
    const upload = await videoService.createDirectUpload({
      playbackPolicy: 'public',
      maxResolution: '1080p'
    });

    logSuccess('Mux', 'Direct upload URL created');
    logInfo('Mux', `Upload ID: ${upload.uploadId}`);
    logInfo('Mux', `Upload URL: ${upload.uploadUrl.substring(0, 50)}...`);
    logInfo('Mux', 'You can use this URL to upload a video file');

    // List assets (may be empty if no videos uploaded yet)
    const assets = await videoService.listAssets({ limit: 5 });
    logSuccess('Mux', `Found ${assets.length} video asset(s)`);

    if (assets.length > 0) {
      logInfo('Mux', `Latest asset ID: ${assets[0].assetId}`);
      logInfo('Mux', `Status: ${assets[0].status}`);
    }

    return true;
  } catch (error) {
    logError('Mux', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Test Firebase (basic check)
async function testFirebaseService() {
  log('\n🔔 Checking Firebase Configuration...', 'yellow');

  try {
    const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const hasApiKey = !!process.env.FIREBASE_API_KEY;
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;

    if (hasServiceAccount && hasApiKey && hasProjectId) {
      logSuccess('Firebase', 'Configuration found');
      logInfo('Firebase', `Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      logInfo('Firebase', 'Push notifications require the mobile app to test fully');
      return true;
    } else {
      logError('Firebase', 'Configuration incomplete');
      return false;
    }
  } catch (error) {
    logError('Firebase', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n🧪 Starting Service Tests...', 'yellow');
  log('='.repeat(60), 'yellow');

  const results = {
    email: await testEmailService(),
    s3: await testS3Service(),
    mux: await testMuxService(),
    firebase: await testFirebaseService()
  };

  log('\n' + '='.repeat(60), 'yellow');
  log('\n📊 Test Results Summary:', 'yellow');
  log('='.repeat(60), 'yellow');

  Object.entries(results).forEach(([service, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${service.toUpperCase().padEnd(15)} ${status}`, color);
  });

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  log('\n' + '='.repeat(60), 'yellow');
  log(`\nTotal: ${passedCount}/${totalCount} services passed`,
    passedCount === totalCount ? 'green' : 'yellow');
  log('='.repeat(60), 'yellow');

  if (passedCount === totalCount) {
    log('\n🎉 All services are working correctly!', 'green');
  } else {
    log('\n⚠️  Some services need attention. Check the errors above.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  logError('TEST SCRIPT', error.message);
  console.error(error);
  process.exit(1);
});

/**
 * Fix S3 bucket CORS configuration for profile images
 * Run with: node backend/fix-s3-cors.js
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-2'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'intentionalmovement-uploads';

async function checkAndFixCORS() {
  try {
    console.log(`Checking CORS configuration for bucket: ${BUCKET_NAME}`);

    // Try to get current CORS configuration
    try {
      const currentCORS = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
      console.log('Current CORS configuration:');
      console.log(JSON.stringify(currentCORS, null, 2));
    } catch (error) {
      if (error.code === 'NoSuchCORSConfiguration') {
        console.log('No CORS configuration exists');
      } else {
        throw error;
      }
    }

    // Set CORS configuration
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: ['*'], // Allow all origins for now
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    console.log('\nSetting new CORS configuration...');
    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }).promise();

    console.log('✅ CORS configuration updated successfully!');

    // Verify the update
    const updatedCORS = await s3.getBucketCors({ Bucket: BUCKET_NAME }).promise();
    console.log('\nNew CORS configuration:');
    console.log(JSON.stringify(updatedCORS, null, 2));

    // Check bucket policy for public read access
    console.log('\n\nChecking bucket policy...');
    try {
      const policy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log('Current bucket policy:');
      console.log(policy.Policy);
    } catch (error) {
      if (error.code === 'NoSuchBucketPolicy') {
        console.log('No bucket policy exists');
        console.log('\n⚠️  WARNING: You need to add a bucket policy for public read access');
        console.log('Add this policy in AWS S3 Console:');
        console.log(JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadGetObject',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
            }
          ]
        }, null, 2));
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAndFixCORS();

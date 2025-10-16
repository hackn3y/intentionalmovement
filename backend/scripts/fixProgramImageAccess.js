require('dotenv').config();
const { sequelize, Program } = require('../src/models');
const s3Service = require('../src/services/s3Service');

async function fixProgramImageAccess() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const program = await Program.findOne({ where: { slug: 'own-your-sale' } });

    if (!program) {
      console.error('Program "Own Your Sale" not found');
      process.exit(1);
    }

    console.log('Current cover image:', program.coverImage);

    // Extract the S3 key from the URL
    const imageKey = 'programs/own-your-sale-cover.jpg';

    // Check if file exists
    const exists = await s3Service.fileExists(imageKey);
    console.log('File exists in S3:', exists);

    if (exists) {
      // Generate a signed URL (valid for 1 year)
      const signedUrl = await s3Service.getSignedUrl(imageKey, 31536000);
      console.log('\nSigned URL generated (valid for 1 year):');
      console.log(signedUrl);

      // Update program with signed URL
      await program.update({ coverImage: signedUrl });
      console.log('\nProgram cover image updated with signed URL!');
    } else {
      console.error('Image file does not exist in S3 at key:', imageKey);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixProgramImageAccess();

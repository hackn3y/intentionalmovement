require('dotenv').config();
const { sequelize, Program } = require('../src/models');

async function updateProgramImage() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const program = await Program.findOne({ where: { slug: 'own-your-sale' } });

    if (!program) {
      console.error('Program "Own Your Sale" not found');
      process.exit(1);
    }

    // Update with your S3 URL or external image URL
    const imageUrl = 'https://intentionalmovement-uploads.s3.us-east-2.amazonaws.com/programs/own-your-sale-cover.jpg';

    await program.update({
      coverImage: imageUrl
    });

    console.log('Program cover image updated successfully!');
    console.log('Cover Image URL:', program.coverImage);

    process.exit(0);
  } catch (error) {
    console.error('Error updating program:', error);
    process.exit(1);
  }
}

updateProgramImage();

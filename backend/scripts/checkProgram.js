require('dotenv').config();
const { sequelize, Program } = require('../src/models');

async function checkProgram() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully\n');

    // Find the program
    const program = await Program.findOne({
      where: { slug: 'own-your-sale' }
    });

    if (!program) {
      console.error('❌ Program "Own Your Sale" not found in database');

      // List all programs
      const allPrograms = await Program.findAll({
        attributes: ['id', 'title', 'slug', 'isPublished', 'category']
      });

      console.log('\nAll programs in database:');
      console.table(allPrograms.map(p => ({
        title: p.title,
        slug: p.slug,
        published: p.isPublished,
        category: p.category
      })));

      process.exit(1);
    }

    console.log('✅ Program found!\n');
    console.log('ID:', program.id);
    console.log('Title:', program.title);
    console.log('Slug:', program.slug);
    console.log('Category:', program.category);
    console.log('Price:', program.price);
    console.log('Discount Price:', program.discountPrice);
    console.log('Published:', program.isPublished);
    console.log('Featured:', program.isFeatured);
    console.log('Cover Image:', program.coverImage || 'Not set');
    console.log('\nDescription:', program.description);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProgram();

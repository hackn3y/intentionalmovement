require('dotenv').config();
const { sequelize, Program } = require('../src/models');

async function testPrograms() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Test query that the API would run
    const whereClause = { isPublished: true };

    console.log('Testing Program.findAll with whereClause:', whereClause);

    const programs = await Program.findAll({
      where: whereClause,
      limit: 20,
      offset: 0,
      order: [
        ['isFeatured', 'DESC'],
        ['enrollmentCount', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    console.log(`\nFound ${programs.length} program(s):\n`);

    programs.forEach(p => {
      console.log('---');
      console.log('Title:', p.title);
      console.log('Slug:', p.slug);
      console.log('Category:', p.category);
      console.log('Price:', p.price);
      console.log('Published:', p.isPublished);
      console.log('Featured:', p.isFeatured);
    });

    // Test with real-estate category filter
    console.log('\n\n=== Testing with real-estate category filter ===\n');

    const realEstatePrograms = await Program.findAll({
      where: { ...whereClause, category: 'real-estate' },
      limit: 20,
      offset: 0,
      order: [
        ['isFeatured', 'DESC'],
        ['enrollmentCount', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    console.log(`Found ${realEstatePrograms.length} real-estate program(s):\n`);
    realEstatePrograms.forEach(p => {
      console.log('- ', p.title);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testPrograms();

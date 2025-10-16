require('dotenv').config();
const { sequelize, DailyContent } = require('../src/models');

async function createTestContent() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Create today's content
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await DailyContent.findOne({
      where: { date: today }
    });

    if (existing) {
      console.log('Today\'s content already exists:', existing.title);
      process.exit(0);
    }

    const content = await DailyContent.create({
      date: today,
      contentType: 'quote',
      title: 'Daily Inspiration',
      message: 'The journey of a thousand miles begins with a single step. Take that step today with intention and purpose.',
      category: 'motivation',
      isActive: true,
      notificationSent: false
    });

    console.log('✓ Test daily content created successfully!');
    console.log('  Title:', content.title);
    console.log('  Type:', content.contentType);
    console.log('  Date:', content.date);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestContent();

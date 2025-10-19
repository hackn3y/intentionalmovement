const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function seedDailyContent() {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contents = [
      {
        id: 'dc-001',
        date: new Date(today),
        contentType: 'quote',
        title: 'Embrace Your Journey',
        message: 'Your body is your temple. Keep it pure and clean for the soul to reside in. Every movement is a step toward a stronger, healthier you.',
        category: 'motivation',
        isActive: true
      },
      {
        id: 'dc-002',
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        contentType: 'tip',
        title: 'Morning Movement Routine',
        message: 'Start your day with 5 minutes of gentle stretching. Focus on your breath and set a positive intention for the day ahead.',
        category: 'wellness',
        isActive: true
      },
      {
        id: 'dc-003',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        contentType: 'challenge',
        title: '5-Minute Movement',
        message: 'Complete 5 minutes of non-stop movement today. Mix it up: jumping jacks, high knees, burpees, or dance!',
        category: 'fitness',
        isActive: true
      },
      {
        id: 'dc-004',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        contentType: 'affirmation',
        title: 'I Am Strong',
        message: 'I am strong, capable, and worthy of achieving my health goals. My body is amazing and I treat it with love.',
        category: 'mindfulness',
        isActive: true
      },
      {
        id: 'dc-005',
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        contentType: 'reflection',
        title: 'Weekly Wins',
        message: 'What movements made you feel strongest this week? How can you incorporate more of what works for you?',
        category: 'growth',
        isActive: true
      },
      // Past content
      {
        id: 'dc-past-001',
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        contentType: 'quote',
        title: 'Power of Progress',
        message: 'Your only limit is you. Be brave and fearless to know that you can do anything you put your mind to.',
        category: 'motivation',
        isActive: true
      },
      {
        id: 'dc-past-002',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        contentType: 'challenge',
        title: 'Plank Progress',
        message: 'Hold a plank for 30 seconds longer than yesterday. Remember: straight line from head to heels!',
        category: 'fitness',
        isActive: true
      }
    ];

    console.log('🌱 Seeding daily content...');

    for (const content of contents) {
      try {
        await sequelize.query(
          `INSERT INTO daily_contents (id, date, contentType, title, message, category, isActive, createdAt, updatedAt)
           VALUES (:id, :date, :contentType, :title, :message, :category, :isActive, :createdAt, :updatedAt)`,
          {
            replacements: {
              ...content,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        );
        console.log(`✅ Added: ${content.title} (${new Date(content.date).toDateString()})`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️  Already exists: ${content.title}`);
        } else {
          console.error(`❌ Error adding ${content.title}:`, error.message);
        }
      }
    }

    console.log('\n✨ Daily content seeding completed!');
    console.log('📱 You can now test the daily content feature at http://localhost:8083');

  } catch (error) {
    console.error('Error seeding daily content:', error);
  } finally {
    await sequelize.close();
  }
}

seedDailyContent();
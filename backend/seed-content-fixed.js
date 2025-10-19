const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: console.log
});

async function seedDailyContent() {
  try {
    // Check table structure
    const [results] = await sequelize.query(`PRAGMA table_info(daily_contents)`);
    console.log('Table structure:', results.map(r => `${r.name}: ${r.type}`).join(', '));

    // Get today's date string in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const contents = [
      {
        id: uuidv4(),
        date: todayStr,
        contentType: 'quote',
        title: 'Embrace Your Journey',
        message: 'Your body is your temple. Keep it pure and clean for the soul to reside in. Every movement is a step toward a stronger, healthier you.',
        category: 'motivation',
        isActive: 1  // SQLite uses 0/1 for boolean
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'tip',
        title: 'Morning Movement Routine',
        message: 'Start your day with 5 minutes of gentle stretching. Focus on your breath and set a positive intention for the day ahead.',
        category: 'wellness',
        isActive: 1
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'challenge',
        title: '5-Minute Movement',
        message: 'Complete 5 minutes of non-stop movement today. Mix it up: jumping jacks, high knees, burpees, or dance!',
        category: 'fitness',
        isActive: 1
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'affirmation',
        title: 'I Am Strong',
        message: 'I am strong, capable, and worthy of achieving my health goals. My body is amazing and I treat it with love.',
        category: 'mindfulness',
        isActive: 1
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'reflection',
        title: 'Weekly Wins',
        message: 'What movements made you feel strongest this week? How can you incorporate more of what works for you?',
        category: 'growth',
        isActive: 1
      },
      // Past content
      {
        id: uuidv4(),
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'quote',
        title: 'Power of Progress',
        message: 'Your only limit is you. Be brave and fearless to know that you can do anything you put your mind to.',
        category: 'motivation',
        isActive: 1
      },
      {
        id: uuidv4(),
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'challenge',
        title: 'Plank Progress',
        message: 'Hold a plank for 30 seconds longer than yesterday. Remember: straight line from head to heels!',
        category: 'fitness',
        isActive: 1
      }
    ];

    console.log('\n🌱 Seeding daily content...');

    for (const content of contents) {
      try {
        const now = new Date().toISOString();
        await sequelize.query(
          `INSERT OR REPLACE INTO daily_contents (id, date, contentType, title, message, category, isActive, createdAt, updatedAt)
           VALUES (:id, :date, :contentType, :title, :message, :category, :isActive, :createdAt, :updatedAt)`,
          {
            replacements: {
              ...content,
              createdAt: now,
              updatedAt: now
            }
          }
        );
        console.log(`✅ Added: ${content.title} (${content.date})`);
      } catch (error) {
        console.error(`❌ Error adding ${content.title}:`, error.message);
      }
    }

    // Verify the data was inserted
    const [verifyResults] = await sequelize.query(`SELECT COUNT(*) as count FROM daily_contents`);
    console.log(`\n📊 Total daily content in database: ${verifyResults[0].count}`);

    // Check today's content specifically
    const [todayContent] = await sequelize.query(
      `SELECT * FROM daily_contents WHERE date = :date`,
      { replacements: { date: todayStr } }
    );

    if (todayContent.length > 0) {
      console.log(`\n✨ Today's content ready: "${todayContent[0].title}"`);
    } else {
      console.log(`\n⚠️ No content found for today (${todayStr})`);
    }

    console.log('\n🎉 Daily content seeding completed!');
    console.log('📱 You can now test the daily content feature at http://localhost:8083');

  } catch (error) {
    console.error('Error seeding daily content:', error);
  } finally {
    await sequelize.close();
  }
}

seedDailyContent();
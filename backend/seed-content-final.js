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
    // Get today's date string in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const contents = [
      {
        date: todayStr,
        contentType: 'quote',
        title: 'Embrace Your Journey',
        message: 'Your body is your temple. Keep it pure and clean for the soul to reside in. Every movement is a step toward a stronger, healthier you.',
        category: 'motivation',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      {
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'tip',
        title: 'Morning Movement Routine',
        message: 'Start your day with 5 minutes of gentle stretching. Focus on your breath and set a positive intention for the day ahead.',
        category: 'wellness',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      {
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'challenge',
        title: '5-Minute Movement',
        message: 'Complete 5 minutes of non-stop movement today. Mix it up: jumping jacks, high knees, burpees, or dance!',
        category: 'fitness',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      {
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'affirmation',
        title: 'I Am Strong',
        message: 'I am strong, capable, and worthy of achieving my health goals. My body is amazing and I treat it with love.',
        category: 'mindfulness',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      {
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'reflection',
        title: 'Weekly Wins',
        message: 'What movements made you feel strongest this week? How can you incorporate more of what works for you?',
        category: 'growth',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      // Past content
      {
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'quote',
        title: 'Power of Progress',
        message: 'Your only limit is you. Be brave and fearless to know that you can do anything you put your mind to.',
        category: 'motivation',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      },
      {
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contentType: 'challenge',
        title: 'Plank Progress',
        message: 'Hold a plank for 30 seconds longer than yesterday. Remember: straight line from head to heels!',
        category: 'fitness',
        mediaUrl: null,
        isActive: 1,
        notificationSent: 0
      }
    ];

    console.log('🌱 Seeding daily content...\n');

    for (const content of contents) {
      try {
        const now = new Date().toISOString();

        // First check if content already exists for this date
        const [existing] = await sequelize.query(
          `SELECT id FROM daily_contents WHERE date = :date`,
          { replacements: { date: content.date } }
        );

        if (existing.length > 0) {
          // Update existing content
          await sequelize.query(
            `UPDATE daily_contents
             SET contentType = :contentType, title = :title, message = :message,
                 category = :category, mediaUrl = :mediaUrl, isActive = :isActive,
                 notificationSent = :notificationSent, updatedAt = :updatedAt
             WHERE date = :date`,
            {
              replacements: {
                ...content,
                updatedAt: now
              }
            }
          );
          console.log(`✅ Updated: ${content.title} (${content.date})`);
        } else {
          // Insert new content (let SQLite auto-generate the ID)
          await sequelize.query(
            `INSERT INTO daily_contents (date, contentType, title, message, mediaUrl, category, isActive, notificationSent, createdAt, updatedAt)
             VALUES (:date, :contentType, :title, :message, :mediaUrl, :category, :isActive, :notificationSent, :createdAt, :updatedAt)`,
            {
              replacements: {
                ...content,
                createdAt: now,
                updatedAt: now
              }
            }
          );
          console.log(`✅ Added: ${content.title} (${content.date})`);
        }
      } catch (error) {
        console.error(`❌ Error with ${content.title}:`, error.message);
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
      console.log(`   Type: ${todayContent[0].contentType}`);
      console.log(`   Category: ${todayContent[0].category}`);
    } else {
      console.log(`\n⚠️ No content found for today (${todayStr})`);
    }

    console.log('\n🎉 Daily content seeding completed!');
    console.log('📱 You can now test the daily content feature at http://localhost:8083');
    console.log('\n📌 Try these features:');
    console.log('   • View today\'s daily content');
    console.log('   • Browse the content calendar');
    console.log('   • Check your streak');
    console.log('   • Click different dates to see their content');

  } catch (error) {
    console.error('Error seeding daily content:', error);
  } finally {
    await sequelize.close();
  }
}

seedDailyContent();
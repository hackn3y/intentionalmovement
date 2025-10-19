/**
 * Script to create daily content for testing
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Admin credentials
const ADMIN_USER = {
  email: 'admin@intentionalmovement.com',
  password: 'SecureAdmin_dfe986665e36f3c2ddddf47b3a0e89e4'
};

let authToken = '';

async function login() {
  console.log('🔐 Logging in as admin...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_USER);
    authToken = response.data.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function createDailyContent() {
  const today = new Date();
  const contents = [];

  // Create content for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const contentTypes = ['quote', 'tip', 'challenge', 'affirmation', 'reflection'];
    const contentType = contentTypes[i % contentTypes.length];

    const contentData = {
      date: dateStr,
      contentType: contentType,
      title: getTitle(contentType, i),
      message: getMessage(contentType, i),
      category: getCategory(contentType),
      isActive: true
    };

    contents.push(contentData);
  }

  // Create each content item
  for (const content of contents) {
    try {
      console.log(`\n📝 Creating ${content.contentType} for ${content.date}...`);
      const response = await axios.post(
        `${API_URL}/daily-content/admin/create`,
        content,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log(`✅ Created: ${content.title}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Content already exists for ${content.date}`);
      } else {
        console.error(`❌ Failed:`, error.response?.data?.error || error.message);
      }
    }
  }
}

function getTitle(type, index) {
  const titles = {
    quote: [
      "Embrace Your Journey",
      "Rise and Shine",
      "Strength in Movement",
      "Daily Inspiration",
      "Power of Progress",
      "Mindful Momentum",
      "Elevate Your Energy"
    ],
    tip: [
      "Morning Movement Routine",
      "Hydration Habits",
      "Stretching Secrets",
      "Nutrition Nuggets",
      "Recovery Rituals",
      "Breathing Basics",
      "Form Focus"
    ],
    challenge: [
      "5-Minute Movement",
      "Plank Progress",
      "Step It Up",
      "Core Connection",
      "Balance Builder",
      "Flexibility Flow",
      "Strength Circuit"
    ],
    affirmation: [
      "I Am Strong",
      "My Body Is Capable",
      "Progress Not Perfection",
      "I Choose Movement",
      "Every Step Counts",
      "I Am Resilient",
      "Today I Thrive"
    ],
    reflection: [
      "Weekly Wins",
      "Growth Moments",
      "Mindful Check-in",
      "Gratitude Practice",
      "Progress Review",
      "Energy Assessment",
      "Goal Setting"
    ]
  };

  return titles[type][index % titles[type].length];
}

function getMessage(type, index) {
  const messages = {
    quote: [
      "Your body is your temple. Keep it pure and clean for the soul to reside in. Every movement is a step toward a stronger, healthier you.",
      "The journey of a thousand miles begins with a single step. Today, take that step with intention and purpose.",
      "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
      "Movement is medicine for creating change in a person's physical, emotional, and mental states.",
      "Your only limit is you. Be brave and fearless to know that you can do anything you put your mind to.",
      "The body achieves what the mind believes. Set your intention and watch your body follow.",
      "Every workout is progress. Every healthy choice is a victory. Celebrate your commitment to yourself."
    ],
    tip: [
      "Start your day with 5 minutes of gentle stretching. Focus on your breath and set a positive intention for the day ahead.",
      "Aim for at least 8 glasses of water daily. Keep a water bottle with you and take sips throughout your workout.",
      "Hold each stretch for 30 seconds minimum. Breathe deeply and visualize your muscles lengthening and releasing tension.",
      "Fuel your body with whole foods. Include protein with every meal to support muscle recovery and growth.",
      "Rest days are growth days. Give your body time to repair and come back stronger.",
      "Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 4 times.",
      "Focus on quality over quantity. Perfect form with lighter weight beats poor form with heavy weight every time."
    ],
    challenge: [
      "Complete 5 minutes of non-stop movement today. Mix it up: jumping jacks, high knees, burpees, or dance!",
      "Hold a plank for 30 seconds longer than yesterday. Remember: straight line from head to heels!",
      "Add 1,000 extra steps to your daily count. Take the stairs, park farther away, or enjoy a short walk.",
      "Complete 3 sets of 10 bicycle crunches. Focus on slow, controlled movements and engage your core.",
      "Balance on one foot for 30 seconds per side. Try it while brushing your teeth!",
      "Spend 10 minutes stretching tonight. Focus on areas that feel tight and breathe into each stretch.",
      "Complete this circuit 3 times: 10 squats, 10 push-ups, 10 lunges per leg, 30-second plank."
    ],
    affirmation: [
      "I am strong, capable, and worthy of achieving my health goals. My body is amazing and I treat it with love.",
      "My body is an incredible machine that carries me through life. I honor it with movement and nourishment.",
      "I celebrate small victories and learn from challenges. Every day I grow stronger in body and mind.",
      "I choose to move my body because it feels good, not as punishment. Movement is my celebration of life.",
      "Every step I take, every rep I complete, brings me closer to my goals. I am making progress.",
      "I am resilient. I bounce back from setbacks and keep moving forward with determination and grace.",
      "Today I choose to thrive. I will move with intention, eat with purpose, and rest with gratitude."
    ],
    reflection: [
      "What movements made you feel strongest this week? How can you incorporate more of what works for you?",
      "Notice how your body feels today compared to last week. What positive changes can you identify?",
      "Take a moment to check in with your energy levels. What activities energize you versus drain you?",
      "List three things your body did for you today that you're grateful for. Celebrate your body's capabilities.",
      "Review your progress this week. What worked well? What would you like to adjust moving forward?",
      "How is your energy throughout the day? Are you fueling and resting adequately to support your movement goals?",
      "What movement goals excite you for the coming week? Set one specific, achievable intention."
    ]
  };

  return messages[type][index % messages[type].length];
}

function getCategory(type) {
  const categories = {
    quote: "motivation",
    tip: "wellness",
    challenge: "fitness",
    affirmation: "mindfulness",
    reflection: "growth"
  };

  return categories[type] || "general";
}

async function run() {
  console.log('🚀 Creating Daily Content for Intentional Movement\n');
  console.log('=' .repeat(60));

  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ Cannot proceed without admin authentication');
    return;
  }

  await createDailyContent();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Daily content creation completed!');
  console.log('\n📱 You can now test the daily content feature in the mobile app');
}

run().catch(console.error);
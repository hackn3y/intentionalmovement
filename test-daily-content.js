/**
 * Test script for Daily Content functionality
 * Tests backend API endpoints for daily content
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test user credentials (using a test user)
const TEST_USER = {
  email: 'hackn3y@gmail.com',
  password: 'password123'  // You may need to update this
};

let authToken = '';

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testGetTodayContent() {
  console.log('\n📅 Testing: Get Today\'s Content');
  try {
    const response = await axios.get(`${API_URL}/daily-content/today`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Today\'s content:', response.data);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testGetContentCalendar() {
  console.log('\n📊 Testing: Get Content Calendar (30 days)');
  try {
    const response = await axios.get(`${API_URL}/daily-content/calendar?days=30`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${response.data.contents?.length || 0} content items`);
    if (response.data.contents?.length > 0) {
      console.log('   First item:', {
        date: response.data.contents[0].date,
        type: response.data.contents[0].contentType,
        title: response.data.contents[0].title
      });
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testGetContentByDate() {
  const testDate = new Date().toISOString().split('T')[0];
  console.log(`\n📆 Testing: Get Content by Date (${testDate})`);
  try {
    const response = await axios.get(`${API_URL}/daily-content/date/${testDate}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Content for date:', response.data);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testGetStreak() {
  console.log('\n🔥 Testing: Get User Streak');
  try {
    const response = await axios.get(`${API_URL}/daily-content/streak`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Streak data:', response.data);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testCheckIn() {
  console.log('\n✓ Testing: Daily Check-in');
  try {
    const response = await axios.post(
      `${API_URL}/daily-content/check-in`,
      {
        notes: 'Test check-in from automated script',
        completed: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Check-in successful:', response.data);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testGetContentStats() {
  console.log('\n📈 Testing: Get Content Stats (Admin)');
  try {
    const response = await axios.get(`${API_URL}/daily-content/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Stats:', response.data);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
  }
}

async function testCreateContent() {
  console.log('\n➕ Testing: Create Daily Content (Admin)');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  try {
    const response = await axios.post(
      `${API_URL}/daily-content/admin/create`,
      {
        date: tomorrowDate,
        contentType: 'quote',
        title: 'Test Quote',
        message: 'This is a test quote created by the automated test script.',
        category: 'test',
        isActive: true
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Content created:', response.data);
    return response.data.content?.id;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.error || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Daily Content API Tests\n');
  console.log('=' .repeat(60));

  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  await testGetTodayContent();
  await testGetContentCalendar();
  await testGetContentByDate();
  await testGetStreak();
  await testCheckIn();
  await testGetContentStats();
  await testCreateContent();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests completed!');
}

runTests().catch(console.error);

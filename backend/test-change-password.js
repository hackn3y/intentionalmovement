require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testChangePassword() {
  try {
    console.log('=== TESTING PASSWORD CHANGE ===\n');

    // First, login to get a token
    console.log('Step 1: Logging in with current password...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });

    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    console.log('Token received:', token.substring(0, 20) + '...\n');

    // Now change the password
    console.log('Step 2: Changing password...');
    const changeResponse = await axios.put(
      `${API_URL}/users/change-password`,
      {
        currentPassword: 'Password1',
        newPassword: 'TestPassword123'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Password change response:', changeResponse.data);
    console.log('');

    // Wait a moment for database to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to login with the NEW password
    console.log('Step 3: Attempting login with NEW password (TestPassword123)...');
    try {
      const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'hackn3y@gmail.com',
        password: 'TestPassword123'
      });
      console.log('✅ Login with new password SUCCESSFUL!');
      console.log('Response:', newLoginResponse.data);
    } catch (loginError) {
      console.log('❌ Login with new password FAILED');
      console.log('Error:', loginError.response?.data || loginError.message);
    }

    // Try to login with the OLD password (should fail)
    console.log('\nStep 4: Attempting login with OLD password (Password1) - should fail...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'hackn3y@gmail.com',
        password: 'Password1'
      });
      console.log('⚠️ Login with old password still works (unexpected)');
    } catch (oldLoginError) {
      console.log('✅ Login with old password correctly failed');
    }

  } catch (error) {
    console.error('❌ Error during test:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testChangePassword();

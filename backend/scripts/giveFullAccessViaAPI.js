require('dotenv').config();
const axios = require('axios');

async function giveFullAccess() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';
    const EMAIL = 'hackn3y@gmail.com';

    console.log('1. Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: EMAIL,
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful');
    console.log('User ID:', userId);
    console.log('Current user data:', JSON.stringify(loginResponse.data.data.user, null, 2));

    // Check backend logs to see if subscription middleware is working
    console.log('\n2. Testing message sending (should work with bypass)...\n');

    // Find another user to send a message to
    console.log('First, let\'s search for users...');
    const searchResponse = await axios.get(`${API_URL}/api/users/search?q=test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Found users:', searchResponse.data.users.length);

    if (searchResponse.data.users.length > 0) {
      const targetUser = searchResponse.data.users[0];
      console.log(`Trying to send message to: ${targetUser.displayName} (${targetUser.id})`);

      try {
        const messageResponse = await axios.post(`${API_URL}/api/messages`, {
          receiverId: targetUser.id,
          content: 'Test message - checking if messaging works'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Message sent successfully!');
        console.log('Response:', messageResponse.data);
      } catch (msgError) {
        console.log('❌ Message send failed:');
        console.log('Status:', msgError.response?.status);
        console.log('Error:', msgError.response?.data);
      }
    }

    console.log('\n3. Testing follow (to see if that 500 error persists)...\n');
    if (searchResponse.data.users.length > 0) {
      const targetUser = searchResponse.data.users[0];

      try {
        const followResponse = await axios.post(`${API_URL}/api/users/${targetUser.id}/follow`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Follow successful!');
        console.log('Response:', followResponse.data);
      } catch (followError) {
        console.log('❌ Follow failed:');
        console.log('Status:', followError.response?.status);
        console.log('Error:', followError.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

giveFullAccess();

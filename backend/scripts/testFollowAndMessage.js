require('dotenv').config();
const axios = require('axios');

async function testAPIs() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';
    const EMAIL = 'hackn3y@gmail.com';

    console.log('1. Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: EMAIL,
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Test follow
    console.log('2. Testing follow (with full error details)...\n');
    try {
      const followResponse = await axios.post(
        `${API_URL}/api/users/aecf452b-abe7-4b2d-b879-e9502ebcb5cd/follow`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Follow successful!');
      console.log(followResponse.data);
    } catch (error) {
      console.log('❌ Follow error:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data?.error);
      console.log('Full response:', JSON.stringify(error.response?.data, null, 2));
    }

    // Test message
    console.log('\n3. Testing message send (with full error details)...\n');
    try {
      const messageResponse = await axios.post(
        `${API_URL}/api/messages`,
        {
          receiverId: 'aecf452b-abe7-4b2d-b879-e9502ebcb5cd',
          content: 'Test message'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Message sent!');
      console.log(messageResponse.data);
    } catch (error) {
      console.log('❌ Message error:');
      console.log('Status:', error.response?.status);
      console.log('Error message:', error.response?.data?.error);
      console.log('Full response:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAPIs();

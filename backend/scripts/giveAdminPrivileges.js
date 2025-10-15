require('dotenv').config();
const axios = require('axios');

async function giveAdminPrivileges() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';
    const EMAIL = 'hackn3y@gmail.com';

    console.log('1. Logging in as admin...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: EMAIL,
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful');
    console.log('User ID:', userId);

    console.log('\n2. Getting current user info...\n');
    const userResponse = await axios.get(`${API_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Current user status:');
    console.log('- Email:', userResponse.data.user.email);
    console.log('- Role:', userResponse.data.user.role);
    console.log('- Subscription Status:', userResponse.data.user.subscriptionStatus);
    console.log('- Subscription Tier:', userResponse.data.user.subscriptionTier);

    console.log('\n3. Updating user to admin with active subscription...\n');

    // Update via admin endpoint if available, otherwise use user update
    try {
      const updateResponse = await axios.put(`${API_URL}/api/admin/users/${userId}`, {
        role: 'admin',
        subscriptionStatus: 'active',
        subscriptionTier: 'premium'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ User updated via admin endpoint!');
    } catch (adminError) {
      if (adminError.response?.status === 404) {
        console.log('Admin endpoint not available, trying direct database update...');

        // If admin endpoint doesn't exist, we need to update the database directly
        console.log('Note: You may need to update the database directly or create an admin endpoint');
      } else {
        throw adminError;
      }
    }

    console.log('\n4. Verifying update...\n');
    const verifyResponse = await axios.get(`${API_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Updated user status:');
    console.log('- Email:', verifyResponse.data.user.email);
    console.log('- Role:', verifyResponse.data.user.role);
    console.log('- Subscription Status:', verifyResponse.data.user.subscriptionStatus);
    console.log('- Subscription Tier:', verifyResponse.data.user.subscriptionTier);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

giveAdminPrivileges();

const axios = require('axios');

const API_URL = 'https://intentionalmovement-production.up.railway.app/api';

async function createPurchaseForUser() {
  try {
    console.log('🔐 Logging in as admin...');

    // First, login as admin to get JWT token
    // You'll need to provide your admin password when running this script
    const adminPassword = process.argv[2];

    if (!adminPassword) {
      console.log('❌ Usage: node check-production-purchase.js <admin-password>');
      process.exit(1);
    }

    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: adminPassword
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Create purchase for hackn3y
    console.log('\n📦 Creating purchase for Own Your Sale...');
    const purchaseResponse = await axios.post(
      `${API_URL}/admin/purchases/create`,
      {
        userEmail: 'hackn3y@gmail.com',
        programSlug: 'own-your-sale',
        amount: 777
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Purchase created successfully!');
    console.log(JSON.stringify(purchaseResponse.data, null, 2));

    // Verify by fetching my programs
    console.log('\n🔍 Verifying - Fetching My Programs...');
    const myProgramsResponse = await axios.get(
      `${API_URL}/programs/my/purchased`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ My Programs:');
    console.log(JSON.stringify(myProgramsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 400 && error.response?.data?.error === 'Purchase already exists') {
      console.log('\n✅ Purchase already exists! Checking My Programs...');

      // If purchase exists, just verify it shows up
      try {
        const adminPassword = process.argv[2];
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'hackn3y@gmail.com',
          password: adminPassword
        });

        const myProgramsResponse = await axios.get(
          `${API_URL}/programs/my/purchased`,
          {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.token}`
            }
          }
        );

        console.log('My Programs:');
        console.log(JSON.stringify(myProgramsResponse.data, null, 2));
      } catch (verifyError) {
        console.error('Error verifying:', verifyError.response?.data || verifyError.message);
      }
    }
  }
}

createPurchaseForUser();

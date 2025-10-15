require('dotenv').config();
const axios = require('axios');

async function testAPI() {
  try {
    const API_URL = process.env.RAILWAY_PUBLIC_URL || 'https://intentionalmovement-production.up.railway.app';

    console.log('Testing API:', API_URL);
    console.log('\n=== Test 1: Login to get token ===\n');

    // First login to get a token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    }).catch(err => {
      console.error('Login failed:', err.response?.data || err.message);
      return null;
    });

    if (!loginResponse) {
      console.log('\n⚠️  Update the password in the script and run again');
      process.exit(1);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n=== Test 2: Fetch programs with token ===\n');

    // Test programs endpoint
    const programsResponse = await axios.get(`${API_URL}/api/programs?offset=0&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status:', programsResponse.status);
    console.log('Response structure:', Object.keys(programsResponse.data));
    console.log('\nPrograms found:', programsResponse.data.programs?.length || 0);

    if (programsResponse.data.programs && programsResponse.data.programs.length > 0) {
      console.log('\nPrograms:');
      programsResponse.data.programs.forEach(p => {
        console.log('  - ', p.title, `(${p.category})`);
      });
    } else {
      console.log('\n❌ No programs returned from API');
      console.log('Full response:', JSON.stringify(programsResponse.data, null, 2));
    }

    console.log('\n=== Test 3: Fetch with category filter ===\n');

    const realEstateResponse = await axios.get(`${API_URL}/api/programs?offset=0&limit=20&category=real-estate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Real Estate programs found:', realEstateResponse.data.programs?.length || 0);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();

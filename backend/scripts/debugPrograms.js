require('dotenv').config();
const axios = require('axios');

async function debug() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';

    console.log('Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;

    console.log('Testing different API calls:\n');

    // Test 1: Get specific program by ID
    console.log('1. Get program by ID:');
    try {
      const byIdResponse = await axios.get(`${API_URL}/api/programs/711b0e9c-43f7-4dc4-a83f-ffe5ca1dae39`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Found program:', byIdResponse.data.program.title);
      console.log('   - Published:', byIdResponse.data.program.isPublished);
      console.log('   - Featured:', byIdResponse.data.program.isFeatured);
    } catch (err) {
      console.log('   ❌ Error:', err.response?.data || err.message);
    }

    // Test 2: Get program by slug
    console.log('\n2. Get program by slug:');
    try {
      const bySlugResponse = await axios.get(`${API_URL}/api/programs/own-your-sale`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✅ Found program:', bySlugResponse.data.program.title);
    } catch (err) {
      console.log('   ❌ Error:', err.response?.data || err.message);
    }

    // Test 3: Get all programs
    console.log('\n3. Get all programs (no filter):');
    const allResponse = await axios.get(`${API_URL}/api/programs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Programs found:', allResponse.data.programs.length);
    console.log('   Pagination:', allResponse.data.pagination);

    // Test 4: Get with offset/limit explicitly
    console.log('\n4. Get with offset=0 limit=20:');
    const withParamsResponse = await axios.get(`${API_URL}/api/programs?offset=0&limit=20`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Programs found:', withParamsResponse.data.programs.length);

    // Test 5: Get real-estate category
    console.log('\n5. Get real-estate category:');
    const categoryResponse = await axios.get(`${API_URL}/api/programs?category=real-estate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Programs found:', categoryResponse.data.programs.length);

    // Test 6: Get featured programs
    console.log('\n6. Get featured programs:');
    const featuredResponse = await axios.get(`${API_URL}/api/programs?featured=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Programs found:', featuredResponse.data.programs.length);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debug();

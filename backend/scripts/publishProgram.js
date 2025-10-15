require('dotenv').config();
const axios = require('axios');

async function publishProgram() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';
    const PROGRAM_ID = '711b0e9c-43f7-4dc4-a83f-ffe5ca1dae39';

    console.log('1. Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    console.log('2. Publishing program...\n');

    const response = await axios.put(`${API_URL}/api/programs/${PROGRAM_ID}`, {
      isPublished: true,
      isFeatured: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Program updated!');
    console.log('- Published:', response.data.program.isPublished);
    console.log('- Featured:', response.data.program.isFeatured);

    console.log('\n3. Verifying program is now visible...\n');

    const verifyResponse = await axios.get(`${API_URL}/api/programs?offset=0&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Found ${verifyResponse.data.programs.length} program(s)`);
    if (verifyResponse.data.programs.length > 0) {
      verifyResponse.data.programs.forEach(p => {
        console.log(`  - ${p.title} (${p.category}) - Published: ${p.isPublished}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

publishProgram();

require('dotenv').config();
const axios = require('axios');

async function updateCoverImage() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';
    const PROGRAM_ID = '711b0e9c-43f7-4dc4-a83f-ffe5ca1dae39';

    // The S3 URL from your upload
    const coverImageUrl = 'https://intentionalmovement-uploads.s3.us-east-2.amazonaws.com/programs/owny-your-sale-cover.jpg';

    console.log('1. Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    console.log('2. Updating program cover image...\n');
    console.log('New image URL:', coverImageUrl);

    const response = await axios.put(`${API_URL}/api/programs/${PROGRAM_ID}`, {
      coverImage: coverImageUrl
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Program cover image updated successfully!');
    console.log('Program:', response.data.program.title);
    console.log('Cover Image:', response.data.program.coverImage);

    console.log('\n3. Verifying the program...\n');

    const verifyResponse = await axios.get(`${API_URL}/api/programs/${PROGRAM_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Program verified:');
    console.log('- Title:', verifyResponse.data.program.title);
    console.log('- Cover Image:', verifyResponse.data.program.coverImage);
    console.log('- Published:', verifyResponse.data.program.isPublished);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateCoverImage();

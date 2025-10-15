require('dotenv').config();
const axios = require('axios');

async function seedProgram() {
  try {
    const API_URL = 'https://intentionalmovement-production.up.railway.app';

    console.log('1. Logging in...\n');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'hackn3y@gmail.com',
      password: 'Password1'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    console.log('2. Creating program via API...\n');

    const programData = {
      title: 'Own Your Sale',
      slug: 'own-your-sale',
      description: 'This new program is especially designed for the ambitious homeowner who is making a move and desires to avoid seller\'s agent costs while having a step-by-step guide all in one place.',
      longDescription: `Unlock the ultimate home-selling guide with our comprehensive program! Get state-specific documentation, expert net sheets, and essential resource links. Master unique sales strategies tailored by industry experts, explore various sale types that match your unique situation, and follow a step-by-step timeline of events. Learn the art of negotiating offers and pricing, navigate the title, tax, and insurance process with ease, and smoothly transition through the final steps— handing over keys, moving, and more. Everything you need for a successful sale, all in one place!

Save $333 and get the discounted rate while videos and materials are progressively being inputed into the program. Once purchase is made you will receive each new material (videos, links, articles, etc.) as it is added in the coming weeks. Price will increase once fully complete.`,
      instructorName: 'Intentional Movement',
      category: 'real-estate',
      price: 666.00,
      discountPrice: 333.00,
      currency: 'USD',
      duration: 90,
      coverImage: 'https://intentionalmovement-uploads.s3.us-east-2.amazonaws.com/programs/own-your-sale-cover.jpg',
      tags: ['real-estate', 'home-selling', 'fsbo', 'for-sale-by-owner', 'property'],
      features: [
        'State-specific documentation',
        'Expert net sheets',
        'Essential resource links',
        'Unique sales strategies',
        'Step-by-step timeline',
        'Offer negotiation tactics',
        'Pricing strategies',
        'Title, tax, and insurance guidance',
        'Moving and transition support',
        'Progressive content updates'
      ],
      outcomes: [
        'Successfully sell your home without agent fees',
        'Understand the complete selling process',
        'Navigate legal and financial requirements',
        'Master negotiation techniques',
        'Save thousands in commission fees',
        'Complete all necessary documentation correctly'
      ],
      requirements: [
        'Must be a homeowner planning to sell',
        'Basic computer skills',
        'Willingness to learn and follow the process'
      ],
      isPublished: true,
      isFeatured: true
    };

    const response = await axios.post(`${API_URL}/api/programs`, programData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Program created successfully!');
    console.log('\nProgram Details:');
    console.log('- ID:', response.data.program.id);
    console.log('- Title:', response.data.program.title);
    console.log('- Category:', response.data.program.category);
    console.log('- Price: $', response.data.program.price);
    console.log('- Published:', response.data.program.isPublished);

    console.log('\n3. Verifying program is accessible...\n');

    const verifyResponse = await axios.get(`${API_URL}/api/programs?offset=0&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Found ${verifyResponse.data.programs.length} program(s) in total`);
    if (verifyResponse.data.programs.length > 0) {
      console.log('\nPrograms:');
      verifyResponse.data.programs.forEach(p => {
        console.log(`  - ${p.title} (${p.category})`);
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

seedProgram();

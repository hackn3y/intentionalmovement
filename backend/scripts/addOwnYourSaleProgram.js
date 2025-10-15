require('dotenv').config();
const { sequelize, Program } = require('../src/models');

async function addProgram() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const programData = {
      title: 'Own Your Sale',
      slug: 'own-your-sale',
      description: 'This new program is especially designed for the ambitious homeowner who is making a move and desires to avoid seller\'s agent costs while having a step-by-step guide all in one place.',
      longDescription: `Unlock the ultimate home-selling guide with our comprehensive program! Get state-specific documentation, expert net sheets, and essential resource links. Master unique sales strategies tailored by industry experts, explore various sale types that match your unique situation, and follow a step-by-step timeline of events. Learn the art of negotiating offers and pricing, navigate the title, tax, and insurance process with ease, and smoothly transition through the final steps— handing over keys, moving, and more. Everything you need for a successful sale, all in one place!

Save $333 and get the discounted rate while videos and materials are progressively being inputed into the program. Once purchase is made you will receive each new material (videos, links, articles, etc.) as it is added in the coming weeks. Price will increase once fully complete.`,
      instructorName: 'Intentional Movement',
      category: 'real-estate',
      price: 666.00, // Regular price
      discountPrice: 333.00, // Early bird discount
      currency: 'USD',
      duration: 90, // 90 days access
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
      isFeatured: true,
      rating: 0,
      reviewCount: 0,
      enrollmentCount: 0
    };

    // Check if program already exists
    const existingProgram = await Program.findOne({ where: { slug: 'own-your-sale' } });

    if (existingProgram) {
      console.log('Program "Own Your Sale" already exists. Updating...');
      await existingProgram.update(programData);
      console.log('Program updated successfully!');
      console.log('Program ID:', existingProgram.id);
    } else {
      const program = await Program.create(programData);
      console.log('Program "Own Your Sale" created successfully!');
      console.log('Program ID:', program.id);
      console.log('Title:', program.title);
      console.log('Price: $', program.price);
      console.log('Discount Price: $', program.discountPrice);
      console.log('Category:', program.category);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding program:', error);
    process.exit(1);
  }
}

addProgram();

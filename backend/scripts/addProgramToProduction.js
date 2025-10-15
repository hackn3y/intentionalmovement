// This script connects directly to Railway PostgreSQL database
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Connect directly to Railway PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  logging: false
});

// Define Program model
const Program = sequelize.define('Program', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  longDescription: { type: DataTypes.TEXT },
  instructorName: { type: DataTypes.STRING, defaultValue: 'Intentional Movement' },
  category: {
    type: DataTypes.ENUM('insurance', 'real-estate', 'personal-development', 'all-levels'),
    defaultValue: 'all-levels'
  },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discountPrice: { type: DataTypes.DECIMAL(10, 2) },
  currency: { type: DataTypes.STRING, defaultValue: 'USD' },
  duration: { type: DataTypes.INTEGER },
  coverImage: { type: DataTypes.STRING },
  previewVideoUrl: { type: DataTypes.STRING },
  tags: { type: DataTypes.TEXT, defaultValue: '' },
  features: { type: DataTypes.TEXT, defaultValue: '' },
  outcomes: { type: DataTypes.TEXT, defaultValue: '' },
  lessons: { type: DataTypes.TEXT, defaultValue: null },
  resources: { type: DataTypes.TEXT, defaultValue: null },
  requirements: { type: DataTypes.TEXT, defaultValue: '' },
  stripePriceId: { type: DataTypes.STRING },
  stripeProductId: { type: DataTypes.STRING },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  enrollmentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  metadata: { type: DataTypes.TEXT }
}, {
  timestamps: true,
  tableName: 'Programs'
});

async function addProgram() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Railway PostgreSQL database\n');

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
      tags: 'real-estate,home-selling,fsbo,for-sale-by-owner,property',
      features: 'State-specific documentation,Expert net sheets,Essential resource links,Unique sales strategies,Step-by-step timeline,Offer negotiation tactics,Pricing strategies,Title\\, tax\\, and insurance guidance,Moving and transition support,Progressive content updates',
      outcomes: 'Successfully sell your home without agent fees,Understand the complete selling process,Navigate legal and financial requirements,Master negotiation techniques,Save thousands in commission fees,Complete all necessary documentation correctly',
      requirements: 'Must be a homeowner planning to sell,Basic computer skills,Willingness to learn and follow the process',
      isPublished: true,
      isFeatured: true,
      rating: 0,
      reviewCount: 0,
      enrollmentCount: 0
    };

    // Check if already exists
    const existing = await Program.findOne({ where: { slug: 'own-your-sale' } });

    if (existing) {
      console.log('⚠️  Program already exists. Updating...\n');
      await existing.update(programData);
      console.log('✅ Program updated successfully!');
    } else {
      const program = await Program.create(programData);
      console.log('✅ Program created successfully!');
      console.log('Program ID:', program.id);
    }

    console.log('\nProgram Details:');
    console.log('- Title:', programData.title);
    console.log('- Slug:', programData.slug);
    console.log('- Category:', programData.category);
    console.log('- Price: $', programData.price);
    console.log('- Discount: $', programData.discountPrice);
    console.log('- Published:', programData.isPublished);
    console.log('- Featured:', programData.isFeatured);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('SQL Error:', error.original.message);
    }
    process.exit(1);
  }
}

addProgram();

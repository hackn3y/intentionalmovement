/**
 * Seed Test Data Script
 *
 * Adds sample programs and daily content for testing
 */

const { Sequelize } = require('sequelize');

async function seedTestData() {
  console.log('=== SEED TEST DATA ===\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('✗ DATABASE_URL not set');
    process.exit(1);
  }

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    // 1. Add sample programs
    console.log('1. Adding sample programs...\n');

    const programs = [
      {
        title: 'Own Your Sale',
        slug: 'own-your-sale',
        description: 'This new program is especially designed for the ambitious homeowner who is making a move and desires to avoid seller\'s agent costs while having a step-by-step guide all in one place.',
        longDescription: 'Unlock the ultimate home-selling guide with our comprehensive program! Get state-specific documentation, expert net sheets, and essential resource links. Master unique sales strategies tailored by industry experts, explore various sale types that match your unique situation, and follow a step-by-step timeline of events. Learn the art of negotiating offers and pricing, navigate the title, tax, and insurance process with ease, and smoothly transition through the final steps— handing over keys, moving, and more. Everything you need for a successful sale, all in one place!\n\nSave $333 and get the discounted rate while videos and materials are progressively being inputed into the program. Once purchase is made you will receive each new material (videos, links, articles, etc.) as it is added in the coming weeks. Price will increase once fully complete.',
        instructorName: 'Intentional Movement',
        category: 'real-estate',
        price: 666.00,
        discountPrice: 333.00,
        currency: 'USD',
        duration: 90,
        coverImage: 'https://intentionalmovement-uploads.s3.us-east-2.amazonaws.com/programs/own-your-sale-cover.jpg',
        previewVideoUrl: null,
        tags: 'real-estate,home-selling,fsbo,for-sale-by-owner,property',
        features: 'State-specific documentation,Expert net sheets,Essential resource links,Unique sales strategies,Step-by-step timeline,Offer negotiation tactics,Pricing strategies,Title, tax, and insurance guidance,Moving and transition support,Progressive content updates',
        outcomes: 'Successfully sell your home without agent fees,Understand the complete selling process,Navigate legal and financial requirements,Master negotiation techniques,Save thousands in commission fees,Complete all necessary documentation correctly',
        requirements: 'Must be a homeowner planning to sell,Basic computer skills,Willingness to learn and follow the process',
        lessons: JSON.stringify([
          { title: 'Introduction: For Sale By Owner Overview', duration: '15 min', videoUrl: null },
          { title: 'Module 1: Preparing Your Home for Sale', duration: '45 min', videoUrl: null },
          { title: 'Module 2: Pricing Your Property', duration: '40 min', videoUrl: null },
          { title: 'Module 3: Marketing Your Home', duration: '50 min', videoUrl: null },
          { title: 'Module 4: Legal Documentation & Disclosures', duration: '60 min', videoUrl: null },
          { title: 'Module 5: Showing Your Home', duration: '35 min', videoUrl: null },
          { title: 'Module 6: Negotiating Offers', duration: '55 min', videoUrl: null },
          { title: 'Module 7: Title, Tax, and Insurance Process', duration: '50 min', videoUrl: null },
          { title: 'Module 8: Closing and Moving', duration: '40 min', videoUrl: null }
        ]),
        resources: JSON.stringify([
          { title: 'State-Specific Forms Library', type: 'pdf', url: null },
          { title: 'Net Sheet Calculator', type: 'xlsx', url: null },
          { title: 'Marketing Checklist', type: 'pdf', url: null },
          { title: 'Disclosure Templates', type: 'pdf', url: null }
        ]),
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0
      },
      {
        title: 'Insurance Sales Accelerator',
        slug: 'insurance-sales-accelerator',
        description: 'Master insurance sales with proven prospecting strategies and closing techniques that generate consistent commissions.',
        longDescription: 'Learn the exact system top insurance agents use to build a pipeline of qualified prospects and close policies consistently. This program covers prospecting, presentation skills, objection handling, and client retention strategies specific to the insurance industry.',
        instructorName: 'Intentional Movement Team',
        category: 'insurance',
        price: 247.00,
        discountPrice: 147.00,
        currency: 'USD',
        duration: 45,
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        previewVideoUrl: null,
        tags: 'insurance,sales,prospecting,commissions',
        features: '6 core modules,Role-play sessions,Cold calling scripts,Objection handling guide,Sales tracker tools',
        outcomes: 'Triple your appointments,Close 40% more policies,Build residual income,Master cold calling,Create referral systems',
        requirements: 'Insurance license,Phone or computer,Commitment to daily action',
        lessons: JSON.stringify([
          { title: 'Module 1: Prospecting Strategies', duration: '50 min', videoUrl: null },
          { title: 'Module 2: The Perfect Pitch', duration: '45 min', videoUrl: null },
          { title: 'Module 3: Needs Analysis', duration: '40 min', videoUrl: null },
          { title: 'Module 4: Overcoming Price Objections', duration: '55 min', videoUrl: null },
          { title: 'Module 5: Closing Techniques', duration: '60 min', videoUrl: null },
          { title: 'Module 6: Client Retention', duration: '35 min', videoUrl: null }
        ]),
        resources: JSON.stringify([
          { title: 'Cold Calling Scripts', type: 'pdf', url: null },
          { title: 'Needs Analysis Template', type: 'pdf', url: null },
          { title: 'Commission Tracker', type: 'xlsx', url: null }
        ]),
        isPublished: true,
        isFeatured: false,
        enrollmentCount: 89,
        rating: 4.6,
        reviewCount: 31
      },
      {
        title: 'Intentional Living: Mind & Body Mastery',
        slug: 'intentional-living-mind-body-mastery',
        description: 'Cultivate a planted mind and moving body with daily practices for holistic wellness and intentional living.',
        longDescription: 'This transformative program guides you through creating sustainable habits for mental clarity, physical vitality, and emotional balance. Learn meditation, movement practices, and mindset strategies to elevate your lifestyle.',
        instructorName: 'Intentional Movement Team',
        category: 'personal-development',
        price: 197.00,
        discountPrice: 97.00,
        currency: 'USD',
        duration: 90,
        coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        previewVideoUrl: null,
        tags: 'wellness,mindfulness,movement,lifestyle',
        features: 'Daily guided practices,Meditation library,Movement routines,Habit tracker,Community support',
        outcomes: 'Reduce stress & anxiety,Build sustainable habits,Increase energy levels,Improve focus,Create work-life balance',
        requirements: 'Open mind,15 minutes daily,Quiet space for practice',
        lessons: JSON.stringify([
          { title: 'Week 1: Foundation of Mindfulness', duration: '30 min', videoUrl: null },
          { title: 'Week 2: Morning Movement Rituals', duration: '35 min', videoUrl: null },
          { title: 'Week 3: Breathwork Basics', duration: '25 min', videoUrl: null },
          { title: 'Week 4: Evening Wind-Down Practices', duration: '30 min', videoUrl: null },
          { title: 'Week 5: Stress Management Tools', duration: '40 min', videoUrl: null },
          { title: 'Week 6: Building Your Routine', duration: '35 min', videoUrl: null }
        ]),
        resources: JSON.stringify([
          { title: 'Meditation Audio Library', type: 'audio', url: null },
          { title: 'Movement Video Series', type: 'video', url: null },
          { title: 'Habit Tracking Journal', type: 'pdf', url: null }
        ]),
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 215,
        rating: 4.9,
        reviewCount: 87
      }
    ];

    for (const program of programs) {
      try {
        const [result] = await sequelize.query(`
          INSERT INTO "Programs" (
            id, title, slug, description, "longDescription", "instructorName",
            category, price, "discountPrice", currency, duration,
            "coverImage", "previewVideoUrl", tags, features, outcomes,
            requirements, lessons, resources, "stripePriceId", "stripeProductId",
            "isPublished", "isFeatured", "enrollmentCount", rating, "reviewCount",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, NOW(), NOW()
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            "discountPrice" = EXCLUDED."discountPrice",
            "updatedAt" = NOW()
          RETURNING id, title, slug
        `, {
          bind: [
            program.title, program.slug, program.description, program.longDescription,
            program.instructorName, program.category, program.price, program.discountPrice,
            program.currency, program.duration, program.coverImage, program.previewVideoUrl,
            program.tags, program.features, program.outcomes, program.requirements,
            program.lessons, program.resources, null, null, program.isPublished,
            program.isFeatured, program.enrollmentCount, program.rating, program.reviewCount
          ]
        });
        console.log(`  ✓ ${program.title} (${program.slug})`);
      } catch (error) {
        console.log(`  ✗ ${program.title}: ${error.message}`);
      }
    }

    // 2. Add daily content
    console.log('\n2. Adding daily content...\n');

    const today = new Date();
    const dailyContents = [];

    // Generate content for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const contents = [
        {
          date: dateStr,
          contentType: 'quote',
          title: 'Daily Inspiration',
          message: '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
          category: 'motivation',
          isActive: true
        },
        {
          date: dateStr,
          contentType: 'tip',
          title: 'Movement Tip',
          message: 'Start your day with 10 minutes of stretching or light movement. Your body will thank you!',
          category: 'movement',
          isActive: true
        },
        {
          date: dateStr,
          contentType: 'affirmation',
          title: 'Daily Affirmation',
          message: 'I am capable of achieving my goals. I move forward with confidence and purpose.',
          category: 'mindfulness',
          isActive: true
        },
        {
          date: dateStr,
          contentType: 'challenge',
          title: 'Daily Challenge',
          message: 'Take a 15-minute walk today and practice mindful breathing. Notice three things you\'re grateful for.',
          category: 'wellness',
          isActive: true
        },
        {
          date: dateStr,
          contentType: 'reflection',
          title: 'Evening Reflection',
          message: 'What was one thing you learned today? How will you apply it tomorrow?',
          category: 'growth',
          isActive: true
        }
      ];

      dailyContents.push(...contents);
    }

    for (const content of dailyContents) {
      try {
        await sequelize.query(`
          INSERT INTO "daily_contents" (
            date, "contentType", title, message, "mediaUrl", category,
            "isActive", "notificationSent", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
          )
          ON CONFLICT (date) DO NOTHING
        `, {
          bind: [
            content.date, content.contentType, content.title, content.message,
            null, content.category, content.isActive, false
          ]
        });
        console.log(`  ✓ ${content.date} - ${content.title}`);
      } catch (error) {
        console.log(`  ✗ ${content.date}: ${error.message}`);
      }
    }

    console.log('\n=== SEED COMPLETE ===');
    console.log(`✓ Added ${programs.length} programs`);
    console.log(`✓ Added ${dailyContents.length} daily content items`);
    console.log('\nYou can now:');
    console.log('1. View programs in the admin dashboard');
    console.log('2. See daily content for the next 7 days');
    console.log('3. Test the mobile app with real data\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Seed failed:', error.message);
    console.error('Stack:', error.stack);
    await sequelize.close();
    process.exit(1);
  }
}

seedTestData();

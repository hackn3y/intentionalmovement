require('dotenv').config();
const { sequelize, Program, DailyContent } = require('./src/models');
const logger = require('./src/utils/logger');

const seedOwnYourSaleAndDailyContent = async () => {
  try {
    logger.info('Starting Own Your Sale program and daily content seeding...');

    await sequelize.authenticate();
    logger.info('Database connection established');

    // Create "Own Your Sale" Program
    const ownYourSaleProgram = await Program.findOrCreate({
      where: { slug: 'own-your-sale' },
      defaults: {
        title: 'Own Your Sale',
        slug: 'own-your-sale',
        description: 'Master the art of sales with this comprehensive program designed for insurance and real estate professionals.',
        longDescription: `Own Your Sale is a transformative program that equips you with the mindset, strategies, and tools to excel in sales. Whether you're in insurance, real estate, or any sales-driven field, this program will help you:

• Build unshakeable confidence in your selling abilities
• Develop a systematic approach to prospecting and closing
• Master objection handling and negotiation techniques
• Create a personal brand that attracts ideal clients
• Implement proven follow-up systems that convert
• Cultivate the planted mind needed for consistent success

This isn't just about techniques - it's about owning your role as a sales professional and creating a business you're proud of.`,
        instructorName: 'Intentional Movement',
        category: 'insurance', // Can also be 'real-estate' or 'personal-development'
        price: 777.00,
        discountPrice: null,
        currency: 'USD',
        duration: 90, // 90-day program
        coverImage: 'https://via.placeholder.com/800x600/ec4899/ffffff?text=Own+Your+Sale',
        previewVideoUrl: null,
        tags: ['sales', 'insurance', 'real-estate', 'business', 'mindset', 'confidence'],
        features: [
          '12 comprehensive modules covering all aspects of sales',
          'Weekly live Q&A sessions with sales experts',
          'Private community access for networking and support',
          'Proven scripts and templates for prospecting and closing',
          'Monthly accountability check-ins',
          'Bonus: Personal branding masterclass',
          'Lifetime access to all course materials'
        ],
        outcomes: [
          'Increased confidence in sales conversations',
          'Systematic approach to generating and closing leads',
          'Higher conversion rates and income',
          'Sustainable business practices for long-term success',
          'Strong personal brand that attracts clients',
          'Resilient mindset that handles rejection with grace'
        ],
        lessons: [
          {
            id: 1,
            title: 'Module 1: The Sales Mindset',
            description: 'Develop the planted mind required for sales success',
            duration: 45,
            order: 1,
            videoUrl: null,
            isPreview: true
          },
          {
            id: 2,
            title: 'Module 2: Know Your Value',
            description: 'Understanding and communicating your unique value proposition',
            duration: 60,
            order: 2,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 3,
            title: 'Module 3: Prospecting Systems',
            description: 'Build a consistent pipeline of qualified leads',
            duration: 75,
            order: 3,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 4,
            title: 'Module 4: The Consultation Process',
            description: 'Master the art of discovery and needs assessment',
            duration: 60,
            order: 4,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 5,
            title: 'Module 5: Presenting Solutions',
            description: 'Present your products/services with confidence and clarity',
            duration: 55,
            order: 5,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 6,
            title: 'Module 6: Objection Handling',
            description: 'Turn objections into opportunities for deeper connection',
            duration: 70,
            order: 6,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 7,
            title: 'Module 7: Closing with Integrity',
            description: 'Close deals while building long-term relationships',
            duration: 65,
            order: 7,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 8,
            title: 'Module 8: Follow-Up Mastery',
            description: 'Implement systems that nurture relationships and drive sales',
            duration: 50,
            order: 8,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 9,
            title: 'Module 9: Building Your Brand',
            description: 'Create a personal brand that attracts your ideal clients',
            duration: 80,
            order: 9,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 10,
            title: 'Module 10: Referral Systems',
            description: 'Build a business that grows through client advocacy',
            duration: 55,
            order: 10,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 11,
            title: 'Module 11: Resilience & Rejection',
            description: 'Develop mental toughness and bounce back from setbacks',
            duration: 60,
            order: 11,
            videoUrl: null,
            isPreview: false
          },
          {
            id: 12,
            title: 'Module 12: Scaling Your Success',
            description: 'Systemize and scale your sales business',
            duration: 70,
            order: 12,
            videoUrl: null,
            isPreview: false
          }
        ],
        resources: [
          {
            title: 'Prospecting Scripts Library',
            type: 'pdf',
            url: null
          },
          {
            title: 'Objection Handling Cheat Sheet',
            type: 'pdf',
            url: null
          },
          {
            title: 'Follow-Up Email Templates',
            type: 'pdf',
            url: null
          },
          {
            title: 'Personal Branding Workbook',
            type: 'pdf',
            url: null
          },
          {
            title: 'Sales Tracker Spreadsheet',
            type: 'spreadsheet',
            url: null
          }
        ],
        requirements: [
          'Commitment to implement what you learn',
          'Willingness to step out of your comfort zone',
          'Notebook or digital device for taking notes',
          'Active sales role or business (insurance, real estate, or related field recommended)'
        ],
        isPublished: true,
        isFeatured: true,
        enrollmentCount: 47,
        rating: 4.85,
        reviewCount: 23
      }
    });

    if (ownYourSaleProgram[1]) {
      logger.info('✅ Created "Own Your Sale" program ($777)');
    } else {
      logger.info('ℹ️  "Own Your Sale" program already exists');
    }

    // Create Daily Content for the next 30 days
    const today = new Date();
    const dailyContentItems = [];

    // Sample daily content covering various types and themes
    const contentTemplates = [
      // Quotes (Days 1, 6, 11, 16, 21, 26)
      {
        contentType: 'quote',
        category: 'motivation',
        title: 'Your Daily Inspiration',
        message: '"The only way to do great work is to love what you do." - Steve Jobs\n\nToday, find joy in your journey. Your work is an extension of your intentional movement toward your goals.'
      },
      {
        contentType: 'quote',
        category: 'mindfulness',
        title: 'Planted Mind Wisdom',
        message: '"In the midst of movement and chaos, keep stillness inside of you." - Deepak Chopra\n\nYour planted mind is your anchor. Even in the busiest moments, return to your center.'
      },
      {
        contentType: 'quote',
        category: 'success',
        title: 'Success Mindset',
        message: '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill\n\nYour elevated lifestyle is built one intentional decision at a time.'
      },
      {
        contentType: 'quote',
        category: 'growth',
        title: 'Growth Philosophy',
        message: '"The only impossible journey is the one you never begin." - Tony Robbins\n\nToday is the perfect day to take that first step. What will you begin?'
      },
      {
        contentType: 'quote',
        category: 'motivation',
        title: 'Morning Inspiration',
        message: '"Believe you can and you\'re halfway there." - Theodore Roosevelt\n\nYour belief in yourself is the foundation of every achievement. Own your power today.'
      },
      {
        contentType: 'quote',
        category: 'mindfulness',
        title: 'Present Moment Awareness',
        message: '"Be where you are; otherwise you will miss your life." - Buddha\n\nThis moment is all we truly have. Be fully present in it.'
      },

      // Tips (Days 2, 7, 12, 17, 22, 27)
      {
        contentType: 'tip',
        category: 'movement',
        title: 'Movement Tip: Morning Stretch',
        message: '🌅 Start Your Day Right\n\nBefore checking your phone, take 5 minutes to stretch:\n• Reach your arms overhead and take 3 deep breaths\n• Roll your shoulders back 10 times\n• Gentle neck rolls in each direction\n• Touch your toes or reach for them\n\nThis simple practice wakes up your body and sets an intentional tone for the day.'
      },
      {
        contentType: 'tip',
        category: 'mindfulness',
        title: 'Mindfulness Tip: Breath Awareness',
        message: '🧘 Quick Mindfulness Reset\n\nFeeling stressed? Try the 4-7-8 breathing technique:\n1. Inhale through your nose for 4 counts\n2. Hold for 7 counts\n3. Exhale through your mouth for 8 counts\n4. Repeat 4 times\n\nThis activates your parasympathetic nervous system and brings you back to center.'
      },
      {
        contentType: 'tip',
        category: 'productivity',
        title: 'Productivity Tip: Time Blocking',
        message: '⏰ Master Your Time\n\nTry time blocking today:\n• Block 90-minute focus sessions for deep work\n• Schedule 15-minute breaks between blocks\n• Protect your calendar from distractions\n• Turn off notifications during focus time\n\nIntentional time management creates space for your best work.'
      },
      {
        contentType: 'tip',
        category: 'wellness',
        title: 'Wellness Tip: Hydration',
        message: '💧 Hydration Check\n\nAre you drinking enough water?\n• Start your day with 16oz of water\n• Keep a water bottle visible on your desk\n• Set hourly reminders to drink\n• Aim for half your body weight in ounces daily\n\nProper hydration boosts energy, focus, and overall well-being.'
      },
      {
        contentType: 'tip',
        category: 'movement',
        title: 'Movement Tip: Desk Breaks',
        message: '🪑 Combat Sitting Fatigue\n\nSet a timer to stand and move every hour:\n• 10 desk push-ups or wall push-ups\n• 20 bodyweight squats\n• 30-second plank hold\n• Walk around your space for 2 minutes\n\nYour body craves movement. Give it what it needs!'
      },
      {
        contentType: 'tip',
        category: 'mindfulness',
        title: 'Evening Wind-Down',
        message: '🌙 Better Sleep Starts Now\n\nCreate an evening wind-down routine:\n• No screens 1 hour before bed\n• Gentle stretching or yoga\n• Gratitude journaling (3 things)\n• Deep breathing or meditation\n\nQuality sleep is foundational to your elevated lifestyle.'
      },

      // Challenges (Days 3, 8, 13, 18, 23, 28)
      {
        contentType: 'challenge',
        category: 'movement',
        title: 'Today\'s Challenge: 10,000 Steps',
        message: '👟 Step Challenge\n\nYour challenge today: Hit 10,000 steps!\n\n• Take walking meetings\n• Park farther away\n• Take the stairs\n• Walk during phone calls\n• Evening neighborhood stroll\n\nMovement is meditation in motion. Make it happen!'
      },
      {
        contentType: 'challenge',
        category: 'mindfulness',
        title: 'Today\'s Challenge: Digital Detox Hour',
        message: '📱 Disconnect to Reconnect\n\nYour challenge: 1 full hour without screens.\n\n• No phone, computer, or TV\n• Read a book\n• Meditate or journal\n• Have a face-to-face conversation\n• Be with your thoughts\n\nReclaim your attention and presence.'
      },
      {
        contentType: 'challenge',
        category: 'gratitude',
        title: 'Today\'s Challenge: Gratitude Letters',
        message: '💌 Spread Gratitude\n\nYour challenge: Write 3 gratitude messages today.\n\n• Text a friend who made you smile\n• Email a mentor who impacted you\n• Leave a kind note for a colleague\n\nGratitude multiplies when shared. Start spreading it!'
      },
      {
        contentType: 'challenge',
        category: 'movement',
        title: 'Today\'s Challenge: Morning Mobility',
        message: '🌄 Start Strong\n\nYour challenge: 10-minute morning mobility routine.\n\n• Hip circles (10 each direction)\n• Arm circles and shoulder rolls\n• Cat-cow stretches (10 reps)\n• Deep squat hold (1 minute)\n\nMobility is freedom. Move with intention!'
      },
      {
        contentType: 'challenge',
        category: 'personal-growth',
        title: 'Today\'s Challenge: Learn Something New',
        message: '📚 Growth Mindset Challenge\n\nYour challenge: Spend 30 minutes learning something new.\n\n• Watch an educational video\n• Read an article outside your field\n• Practice a new skill\n• Listen to a podcast episode\n\nContinuous learning creates an elevated life.'
      },
      {
        contentType: 'challenge',
        category: 'connection',
        title: 'Today\'s Challenge: Deep Conversation',
        message: '💬 Connection Challenge\n\nYour challenge: Have one meaningful conversation today.\n\n• Ask open-ended questions\n• Listen without planning your response\n• Be fully present\n• Share something vulnerable\n\nDeep connections elevate everything.'
      },

      // Affirmations (Days 4, 9, 14, 19, 24, 29)
      {
        contentType: 'affirmation',
        category: 'confidence',
        title: 'Your Daily Affirmation',
        message: '✨ Today\'s Affirmation ✨\n\n"I am capable of achieving extraordinary things. My planted mind and moving body create the life I desire. I trust in my journey and embrace each step with confidence."\n\nRepeat this 3 times with conviction. Feel it in your body. Believe it in your soul.'
      },
      {
        contentType: 'affirmation',
        category: 'abundance',
        title: 'Abundance Affirmation',
        message: '✨ Abundance Mindset ✨\n\n"I am a magnet for success and prosperity. Opportunities flow to me with ease. I am worthy of all the good that comes my way."\n\nSpeak this over your life today. Abundance is your birthright.'
      },
      {
        contentType: 'affirmation',
        category: 'strength',
        title: 'Strength Affirmation',
        message: '✨ Inner Strength ✨\n\n"I am stronger than any challenge I face. My resilience is unshakeable. I rise above obstacles with grace and determination."\n\nYou are more powerful than you know. Own that power today.'
      },
      {
        contentType: 'affirmation',
        category: 'peace',
        title: 'Peace Affirmation',
        message: '✨ Inner Peace ✨\n\n"I release what I cannot control. I am calm, centered, and at peace. My planted mind creates serenity in all situations."\n\nBreathe this in. Let peace fill every cell of your being.'
      },
      {
        contentType: 'affirmation',
        category: 'success',
        title: 'Success Affirmation',
        message: '✨ Success Declaration ✨\n\n"I am successful in all that I do. My actions are aligned with my highest purpose. I create value and impact everywhere I go."\n\nStep into your success today. It\'s already yours.'
      },
      {
        contentType: 'affirmation',
        category: 'love',
        title: 'Self-Love Affirmation',
        message: '✨ Self-Love Declaration ✨\n\n"I love and accept myself exactly as I am. I am worthy of love, respect, and joy. I treat myself with kindness and compassion."\n\nYou are enough. You always have been. You always will be.'
      },

      // Reflections (Days 5, 10, 15, 20, 25, 30)
      {
        contentType: 'reflection',
        category: 'growth',
        title: 'Reflection: Weekly Wins',
        message: '🤔 Reflection Prompt\n\nTake 5 minutes to reflect:\n\n• What were your 3 biggest wins this week?\n• What did you learn about yourself?\n• What would you do differently?\n• How did you show up for yourself?\n\nGrowth requires awareness. Celebrate your progress.'
      },
      {
        contentType: 'reflection',
        category: 'purpose',
        title: 'Reflection: Your Why',
        message: '🤔 Purpose Reflection\n\nJournal on these questions:\n\n• Why do you do what you do?\n• What impact do you want to create?\n• Who benefits from your work?\n• What legacy are you building?\n\nYour why fuels your how. Connect with it deeply.'
      },
      {
        contentType: 'reflection',
        category: 'balance',
        title: 'Reflection: Life Balance',
        message: '🤔 Balance Check\n\nReflect on your current balance:\n\n• Work vs. Personal time\n• Movement vs. Rest\n• Giving vs. Receiving\n• Planning vs. Being present\n\nWhere do you need more balance? What one adjustment would help?'
      },
      {
        contentType: 'reflection',
        category: 'relationships',
        title: 'Reflection: Connection Quality',
        message: '🤔 Relationship Reflection\n\nConsider your connections:\n\n• Who energizes you?\n• Who drains you?\n• Where can you deepen connections?\n• What boundaries do you need?\n\nYou become like the 5 people you spend most time with. Choose wisely.'
      },
      {
        contentType: 'reflection',
        category: 'goals',
        title: 'Reflection: Progress Check',
        message: '🤔 Goal Reflection\n\nAssess your progress:\n\n• What goals did you set for this month?\n• What progress have you made?\n• What obstacles arose?\n• What adjustments are needed?\n\nReflection without action is just thinking. What will you do next?'
      },
      {
        contentType: 'reflection',
        category: 'gratitude',
        title: 'Reflection: Gratitude Practice',
        message: '🤔 Gratitude Reflection\n\nReflect with gratitude:\n\n• 3 things you\'re grateful for today\n• 1 person who made a difference\n• 1 lesson you learned\n• 1 way you showed up for yourself\n\nGratitude transforms everything. What are you thankful for?'
      }
    ];

    // Create 30 days of content
    for (let i = 0; i < 30; i++) {
      const contentDate = new Date(today);
      contentDate.setDate(today.getDate() + i);

      // Cycle through content templates
      const template = contentTemplates[i % contentTemplates.length];

      dailyContentItems.push({
        date: contentDate.toISOString().split('T')[0],
        contentType: template.contentType,
        title: template.title,
        message: template.message,
        mediaUrl: null,
        category: template.category,
        isActive: true,
        notificationSent: false
      });
    }

    // Bulk create daily content
    const createdContent = await DailyContent.bulkCreate(dailyContentItems, {
      ignoreDuplicates: true // Skip if date already exists
    });

    logger.info(`✅ Created ${createdContent.length} days of daily content`);

    logger.info('\n📊 Seeding Summary:');
    logger.info('✅ Own Your Sale program ($777) - Ready for purchase');
    logger.info(`✅ ${createdContent.length} days of daily content - Scheduled and active`);
    logger.info('\n🎉 Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    console.error(error);
    process.exit(1);
  }
};

seedOwnYourSaleAndDailyContent();

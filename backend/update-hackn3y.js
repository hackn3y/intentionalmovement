const { User, Program, Purchase, Subscription } = require('./src/models');

async function updateHackn3y() {
  try {
    console.log('Starting database update for hackn3y@gmail.com...');

    // 1. Find the user
    const user = await User.findOne({ where: { email: 'hackn3y@gmail.com' } });
    if (!user) {
      console.error('User hackn3y@gmail.com not found!');
      process.exit(1);
    }
    console.log('✓ Found user:', user.email);

    // 2. Update user to admin with max subscription
    await user.update({
      role: 'admin',
      subscriptionTier: 'premium' // Assuming 'premium' is the max tier
    });
    console.log('✓ Updated user role to admin and subscription to premium');

    // 3. Find or create subscription
    let subscription = await Subscription.findOne({ where: { userId: user.id } });
    const now = new Date();
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    if (subscription) {
      await subscription.update({
        tier: 'elite', // Using 'elite' as the highest tier
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: oneYearFromNow
      });
      console.log('✓ Updated existing subscription to elite (active for 1 year)');
    } else {
      subscription = await Subscription.create({
        userId: user.id,
        tier: 'elite', // Using 'elite' as the highest tier
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: oneYearFromNow
      });
      console.log('✓ Created new elite subscription (active for 1 year)');
    }

    // 4. Find the "Own Your Sale" program
    const program = await Program.findOne({
      where: {
        title: 'Own Your Sale'
      }
    });

    if (!program) {
      console.error('⚠ Program "Own Your Sale" not found!');
      console.log('Available programs:');
      const allPrograms = await Program.findAll({ attributes: ['id', 'title', 'slug'] });
      allPrograms.forEach(p => console.log(`  - ${p.title} (slug: ${p.slug})`));
    } else {
      console.log('✓ Found program:', program.title);

      // 5. Check if purchase already exists
      const existingPurchase = await Purchase.findOne({
        where: {
          userId: user.id,
          programId: program.id
        }
      });

      if (existingPurchase) {
        console.log('✓ Purchase already exists for this program');
      } else {
        // Create purchase
        await Purchase.create({
          userId: user.id,
          programId: program.id,
          amount: program.price || 0,
          status: 'completed',
          purchaseDate: new Date()
        });
        console.log('✓ Created purchase for "Own Your Sale" program');
      }
    }

    console.log('\n✅ Database update completed successfully!');
    console.log('\nSummary:');
    console.log(`  - User: ${user.email}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Subscription: ${user.subscriptionTier || 'N/A'}`);
    if (program) {
      console.log(`  - Purchased: ${program.title}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

updateHackn3y();

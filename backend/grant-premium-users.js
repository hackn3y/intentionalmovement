require('dotenv').config();
const { sequelize, User, Subscription, Purchase, Program } = require('./src/models');
const logger = require('./src/utils/logger');

const grantPremiumAccess = async () => {
  try {
    logger.info('Starting premium access grant for hackn3y@gmail.com and briellemceowen@gmail.com...');

    await sequelize.authenticate();
    logger.info('Database connection established');

    // Find users
    const user1 = await User.findOne({ where: { email: 'hackn3y@gmail.com' } });
    const user2 = await User.findOne({ where: { email: 'briellemceowen@gmail.com' } });

    if (!user1) {
      logger.error('User hackn3y@gmail.com not found');
      process.exit(1);
    }

    logger.info(`Found user 1: ${user1.email} (ID: ${user1.id})`);

    const users = [user1];

    if (user2) {
      logger.info(`Found user 2: ${user2.email} (ID: ${user2.id})`);
      users.push(user2);
    } else {
      logger.warn('User briellemceowen@gmail.com not found - will only update hackn3y@gmail.com');
    }

    // Find Own Your Sale program
    const program = await Program.findOne({ where: { slug: 'own-your-sale' } });

    if (!program) {
      logger.error('Own Your Sale program not found');
      process.exit(1);
    }

    logger.info(`Found program: ${program.title} (ID: ${program.id})`);

    const currentTime = new Date();
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1); // 1 year from now

    // Grant subscription and purchase for each user
    for (const user of users) {
      // Grant subscription
      const [subscription, created] = await Subscription.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          tier: 'premium',
          status: 'active',
          currentPeriodStart: currentTime,
          currentPeriodEnd: periodEnd,
        }
      });

      if (!created) {
        await subscription.update({
          tier: 'premium',
          status: 'active',
          currentPeriodEnd: periodEnd,
        });
        logger.info(`Updated subscription for ${user.email} to premium`);
      } else {
        logger.info(`Created premium subscription for ${user.email}`);
      }

      // Grant program purchase
      const [purchase, purchaseCreated] = await Purchase.findOrCreate({
        where: {
          userId: user.id,
          programId: program.id,
        },
        defaults: {
          userId: user.id,
          programId: program.id,
          amount: program.price,
          currency: 'USD',
          status: 'completed',
        }
      });

      if (purchaseCreated) {
        logger.info(`Created purchase of ${program.title} for ${user.email}`);
      } else {
        logger.info(`${user.email} already owns ${program.title}`);
      }
    }

    // Verify the changes
    logger.info('\n=== Verification ===');

    for (const user of users) {
      const subscription = await Subscription.findOne({ where: { userId: user.id } });
      const purchaseCount = await Purchase.count({
        where: { userId: user.id, status: 'completed' }
      });

      logger.info(`\nUser: ${user.email}`);
      logger.info(`Subscription: ${subscription?.tier || 'none'} (${subscription?.status || 'N/A'})`);
      logger.info(`Subscription expires: ${subscription?.currentPeriodEnd?.toLocaleDateString() || 'N/A'}`);
      logger.info(`Programs owned: ${purchaseCount}`);
    }

    logger.info('\n✅ Successfully granted premium access to both users!');
    process.exit(0);
  } catch (error) {
    logger.error('Error granting premium access:', error);
    process.exit(1);
  }
};

grantPremiumAccess();

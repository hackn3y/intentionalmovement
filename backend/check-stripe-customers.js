/**
 * Check Stripe customer IDs in database
 */

require('dotenv').config();
const { User } = require('./src/models');

async function checkStripeCustomers() {
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set (using DATABASE_URL)' : 'Not set (using individual vars)');

    const usersWithStripe = await User.findAll({
      where: {
        stripeCustomerId: {
          [require('sequelize').Op.not]: null
        }
      },
      attributes: ['id', 'email', 'stripeCustomerId']
    });

    console.log(`\nFound ${usersWithStripe.length} users with Stripe customer IDs:`);
    usersWithStripe.forEach(user => {
      console.log(`- User ${user.id} (${user.email}): ${user.stripeCustomerId}`);
    });

    const totalUsers = await User.count();
    console.log(`\nTotal users in database: ${totalUsers}`);

    process.exit(0);
  } catch (error) {
    console.error('Error checking Stripe customers:', error);
    process.exit(1);
  }
}

checkStripeCustomers();

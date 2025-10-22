/**
 * Find who has the old Stripe customer ID
 */

require('dotenv').config();
const { User } = require('./src/models');

async function findCustomerId() {
  try {
    console.log('Searching for old customer ID: cus_THP3dwsTY2s0yr');
    console.log('Database:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual DB vars');

    const users = await User.findAll({
      where: {
        stripeCustomerId: 'cus_THP3dwsTY2s0yr'
      }
    });

    if (users.length === 0) {
      console.log('No users found with that customer ID');

      // Let's find the new one too
      const newUsers = await User.findAll({
        where: {
          stripeCustomerId: 'cus_THRI7mR84dGLJg'
        }
      });

      if (newUsers.length > 0) {
        console.log('\nFound users with NEW customer ID (cus_THRI7mR84dGLJg):');
        newUsers.forEach(user => {
          console.log(`- ${user.username} (${user.email}) - ID: ${user.id}`);
        });
      }
    } else {
      console.log(`\nFound ${users.length} user(s) with OLD customer ID:`);
      users.forEach(user => {
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Stripe Customer ID: ${user.stripeCustomerId}`);
        console.log('---');
      });

      // Clear it
      console.log('\nClearing this old customer ID...');
      for (const user of users) {
        await user.update({ stripeCustomerId: null });
        console.log(`✓ Cleared customer ID for ${user.username}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findCustomerId();
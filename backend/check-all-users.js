/**
 * Check all users and their Stripe-related fields
 */

require('dotenv').config();
const { User } = require('./src/models');

async function checkAllUsers() {
  try {
    console.log('Connecting to database...');

    const users = await User.findAll({
      attributes: ['id', 'email', 'username', 'stripeCustomerId', 'subscriptionTier', 'subscriptionStatus', 'stripeSubscriptionId']
    });

    console.log(`\nTotal users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username})`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Stripe Customer ID: ${user.stripeCustomerId || 'NULL'}`);
      console.log(`   - Stripe Subscription ID: ${user.stripeSubscriptionId || 'NULL'}`);
      console.log(`   - Subscription Tier: ${user.subscriptionTier || 'NULL'}`);
      console.log(`   - Subscription Status: ${user.subscriptionStatus || 'NULL'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllUsers();

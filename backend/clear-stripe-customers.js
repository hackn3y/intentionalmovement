/**
 * Clear old Stripe customer IDs from database
 * Run this when switching Stripe accounts to prevent "No such customer" errors
 */

require('dotenv').config();
const { User } = require('./src/models');

async function clearStripeCustomers() {
  try {
    console.log('Connecting to database...');

    const result = await User.update(
      { stripeCustomerId: null },
      { where: { stripeCustomerId: { [require('sequelize').Op.not]: null } } }
    );

    console.log(`✓ Cleared ${result[0]} Stripe customer IDs`);
    console.log('Users will get new Stripe customer IDs created on next subscription attempt');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing Stripe customers:', error);
    process.exit(1);
  }
}

clearStripeCustomers();

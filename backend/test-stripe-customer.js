/**
 * Test Stripe customer creation for a specific user
 * This helps debug the 500 error on production
 */

require('dotenv').config();
const { User } = require('./src/models');
const stripeService = require('./src/services/stripeService');

async function testStripeCustomer(userEmail) {
  try {
    console.log('Testing Stripe customer for:', userEmail);
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set');

    // Find the user
    const user = await User.findOne({ where: { email: userEmail } });

    if (!user) {
      console.log('User not found with email:', userEmail);
      process.exit(1);
    }

    console.log('\nUser found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- Stripe Customer ID:', user.stripeCustomerId || 'NULL');
    console.log('- Subscription Tier:', user.subscriptionTier || 'NULL');

    // Try to get or create customer
    console.log('\nAttempting to get or create Stripe customer...');

    try {
      const customerId = await stripeService.getOrCreateCustomer(user);
      console.log('✓ Success! Stripe Customer ID:', customerId);

      // Check if user was updated
      await user.reload();
      console.log('User now has Stripe Customer ID:', user.stripeCustomerId);

    } catch (stripeError) {
      console.error('✗ Stripe error:', stripeError.message);
      console.error('Full error:', stripeError);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node test-stripe-customer.js <user-email>');
  process.exit(1);
}

testStripeCustomer(email);
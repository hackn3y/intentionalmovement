/**
 * Test controller for debugging Stripe integration
 * This is temporary and should be removed after fixing the issue
 */

const stripeService = require('../services/stripeService');

// Test Stripe configuration
exports.testStripeConfig = async (req, res) => {
  try {
    const config = {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasPriceIds: {
        basicMonthly: !!process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
        basicYearly: !!process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
        premiumMonthly: !!process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        premiumYearly: !!process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
      },
      nodeEnv: process.env.NODE_ENV,
      priceIdValues: {
        basicMonthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID?.substring(0, 10) + '...',
        basicYearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID?.substring(0, 10) + '...',
        premiumMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.substring(0, 10) + '...',
        premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID?.substring(0, 10) + '...'
      }
    };

    // Test if we can create a checkout session
    let testResult = 'Not tested';
    try {
      // Try to create a test checkout session (will fail but shows the error)
      const testSession = await stripeService.createSubscriptionCheckoutSession({
        customerId: 'cus_test',
        priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
        userId: 'test',
        tier: 'basic',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel'
      });
      testResult = 'Success';
    } catch (error) {
      testResult = `Error: ${error.message}`;
    }

    res.json({
      success: true,
      config,
      stripeTest: testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
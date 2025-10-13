const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription price IDs (these should be created in Stripe Dashboard)
const SUBSCRIPTION_PRICES = {
  basic: process.env.STRIPE_BASIC_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  elite: process.env.STRIPE_ELITE_PRICE_ID
};

// Get or create Stripe customer
exports.getOrCreateCustomer = async (user) => {
  try {
    // If user already has a Stripe customer ID, return it
    if (user.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!customer.deleted) {
        return customer.id;
      }
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.displayName,
      metadata: {
        userId: user.id,
        username: user.username
      }
    });

    // Update user with customer ID
    await user.update({ stripeCustomerId: customer.id });

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create payment intent for one-time purchase
exports.createPaymentIntent = async ({ amount, currency, customerId, metadata }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency || 'usd',
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Retrieve payment intent
exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Create refund
exports.createRefund = async (paymentIntentId) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

// Attach payment method to customer
exports.attachPaymentMethod = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    return paymentMethod;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
};

// Set default payment method
exports.setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    return customer;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

// Create subscription
exports.createSubscription = async ({ customerId, tier, paymentMethodId }) => {
  try {
    const priceId = SUBSCRIPTION_PRICES[tier];

    if (!priceId) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        tier
      }
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Update subscription
exports.updateSubscription = async (subscriptionId, newTier) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const newPriceId = SUBSCRIPTION_PRICES[newTier];

    if (!newPriceId) {
      throw new Error(`Invalid subscription tier: ${newTier}`);
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId
        }
      ],
      metadata: {
        tier: newTier
      }
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Cancel subscription
exports.cancelSubscription = async (subscriptionId, immediately = false) => {
  try {
    if (immediately) {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } else {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      return subscription;
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Reactivate subscription
exports.reactivateSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    return subscription;
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
};

// Retrieve subscription
exports.retrieveSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

// Construct webhook event
exports.constructWebhookEvent = (payload, signature) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
};

// Create checkout session (alternative to payment intent)
exports.createCheckoutSession = async ({ customerId, lineItems, successUrl, cancelUrl, metadata }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Get customer payment methods
exports.getPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    throw error;
  }
};

// Detach payment method
exports.detachPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw error;
  }
};

module.exports = exports;

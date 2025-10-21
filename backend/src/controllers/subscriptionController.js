const { Op } = require('sequelize');
const { Subscription, User } = require('../models');
const stripeService = require('../services/stripeService');

// Get subscription tiers/plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'basic_monthly',
        tier: 'basic',
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        priceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
        features: [
          'Create unlimited posts',
          'Purchase up to 3 programs',
          'Basic achievements',
          'Ad-free experience',
          'Community access'
        ]
      },
      {
        id: 'basic_yearly',
        tier: 'basic',
        name: 'Basic',
        price: 99,
        currency: 'USD',
        interval: 'year',
        priceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
        savings: 20,
        features: [
          'Create unlimited posts',
          'Purchase up to 3 programs',
          'Basic achievements',
          'Ad-free experience',
          'Community access',
          'Save $20 per year'
        ]
      },
      {
        id: 'premium_monthly',
        tier: 'premium',
        name: 'Premium',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        features: [
          'Unlimited program purchases',
          'Unlimited messaging',
          'All achievements & challenges',
          'Exclusive content',
          'Priority support',
          'Early access to features',
          'Creator tools'
        ]
      },
      {
        id: 'premium_yearly',
        tier: 'premium',
        name: 'Premium',
        price: 299,
        currency: 'USD',
        interval: 'year',
        priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
        savings: 60,
        features: [
          'Unlimited program purchases',
          'Unlimited messaging',
          'All achievements & challenges',
          'Exclusive content',
          'Priority support',
          'Early access to features',
          'Creator tools',
          'Save $60 per year'
        ]
      }
    ];

    res.json({
      success: true,
      plans,
      trialDays: 14
    });
  } catch (error) {
    next(error);
  }
};

// Create checkout session for subscription (mobile payment sheet)
exports.createCheckout = async (req, res, next) => {
  try {
    const { priceId, tier } = req.body;
    const userId = req.user.id;

    if (!priceId || !tier) {
      return res.status(400).json({ error: 'Price ID and tier are required' });
    }

    if (!['basic', 'premium'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Get or create Stripe customer
    const user = await User.findByPk(userId);
    const customerId = await stripeService.getOrCreateCustomer(user);

    // Create subscription checkout
    const checkout = await stripeService.createSubscriptionCheckout({
      customerId,
      priceId,
      userId,
      tier
    });

    res.json({
      success: true,
      clientSecret: checkout.clientSecret,
      subscriptionId: checkout.subscriptionId,
      customerId: checkout.customerId
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    next(error);
  }
};

// Create checkout session for subscription (web redirect flow)
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { priceId, tier, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    if (!priceId || !tier) {
      return res.status(400).json({ error: 'Price ID and tier are required' });
    }

    if (!['basic', 'premium'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Success and cancel URLs are required' });
    }

    // Get or create Stripe customer
    const user = await User.findByPk(userId);
    const customerId = await stripeService.getOrCreateCustomer(user);

    // Create subscription checkout session
    const session = await stripeService.createSubscriptionCheckoutSession({
      customerId,
      priceId,
      userId,
      tier,
      successUrl,
      cancelUrl
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    next(error);
  }
};

// Get user's subscription
exports.getMySubscription = async (req, res, next) => {
  try {
    const user = req.user;

    const subscriptionStatus = {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      isActive: user.isSubscriptionActive(),
      isOnTrial: user.isOnTrial(),
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      trialEndsAt: user.trialEndsAt,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      stripeSubscriptionId: user.stripeSubscriptionId,
      features: {
        canCreatePosts: user.canCreatePosts(),
        canSendMessages: user.canSendMessages(),
        canPurchasePrograms: user.canPurchasePrograms()
      }
    };

    res.json({
      success: true,
      subscription: subscriptionStatus
    });
  } catch (error) {
    next(error);
  }
};

// Create subscription
exports.createSubscription = async (req, res, next) => {
  try {
    const { tier, paymentMethodId } = req.body;
    const userId = req.user.id;

    if (!tier || !paymentMethodId) {
      return res.status(400).json({ error: 'Tier and payment method are required' });
    }

    if (!['basic', 'premium', 'elite'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        status: { [Op.in]: ['active', 'past_due'] }
      }
    });

    if (existingSubscription) {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    // Get or create Stripe customer
    const user = await User.findByPk(userId);
    const customerId = await stripeService.getOrCreateCustomer(user);

    // Attach payment method to customer
    await stripeService.attachPaymentMethod(paymentMethodId, customerId);

    // Set as default payment method
    await stripeService.setDefaultPaymentMethod(customerId, paymentMethodId);

    // Create Stripe subscription
    const stripeSubscription = await stripeService.createSubscription({
      customerId,
      tier,
      paymentMethodId
    });

    // Create subscription record
    const subscription = await Subscription.create({
      userId,
      tier,
      status: stripeSubscription.status === 'active' ? 'active' : 'past_due',
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// Update subscription
exports.updateSubscription = async (req, res, next) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;

    if (!tier || !['basic', 'premium', 'elite'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: { [Op.in]: ['active', 'past_due'] }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    if (subscription.tier === tier) {
      return res.status(400).json({ error: 'Already subscribed to this tier' });
    }

    // Update Stripe subscription
    const stripeSubscription = await stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      tier
    );

    // Update local subscription record
    await subscription.update({
      tier,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });

    res.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { immediately = false } = req.body;

    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription
    const canceledSubscription = await stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
      immediately
    );

    if (immediately) {
      await subscription.update({
        status: 'cancelled',
        canceledAt: new Date()
      });
    } else {
      await subscription.update({
        cancelAt: new Date(canceledSubscription.cancel_at * 1000),
        canceledAt: new Date()
      });
    }

    res.json({
      message: immediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// Reactivate cancelled subscription
exports.reactivateSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active',
        cancelAt: { [Op.not]: null }
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No cancelled subscription found to reactivate' });
    }

    // Reactivate Stripe subscription
    await stripeService.reactivateSubscription(subscription.stripeSubscriptionId);

    await subscription.update({
      cancelAt: null,
      canceledAt: null
    });

    res.json({
      message: 'Subscription reactivated successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Stripe subscription events
exports.handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripeService.constructWebhookEvent(req.body, sig);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled subscription event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in checkout session metadata');
    return;
  }

  // Get the subscription from the session
  const subscriptionId = session.subscription;
  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  try {
    // Retrieve the full subscription details
    const stripeSubscription = await require('stripe')(process.env.STRIPE_SECRET_KEY)
      .subscriptions.retrieve(subscriptionId);

    // Update user subscription status
    await handleSubscriptionUpdated(stripeSubscription);

    console.log(`Checkout session completed for user ${userId}: ${tier}`);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription) {
  const userId = stripeSubscription.metadata?.userId;
  const tier = stripeSubscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing userId or tier in subscription metadata');
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    console.error('User not found:', userId);
    return;
  }

  const status = stripeSubscription.status === 'trialing' ? 'trialing' :
                 stripeSubscription.status === 'active' ? 'active' :
                 stripeSubscription.status;

  // Update user subscription fields
  await user.update({
    subscriptionTier: tier,
    subscriptionStatus: status,
    stripeSubscriptionId: stripeSubscription.id,
    subscriptionStartDate: new Date(stripeSubscription.current_period_start * 1000),
    subscriptionEndDate: new Date(stripeSubscription.current_period_end * 1000),
    trialEndsAt: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false
  });

  // Also update Subscription model for history
  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: stripeSubscription.id }
  });

  if (subscription) {
    await subscription.update({
      tier,
      status: status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });
  }

  console.log(`Subscription updated for user ${userId}: ${tier} (${status})`);
}

// Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription) {
  const userId = stripeSubscription.metadata?.userId;

  if (userId) {
    const user = await User.findByPk(userId);
    if (user) {
      await user.update({
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
        stripeSubscriptionId: null,
        subscriptionEndDate: new Date(),
        cancelAtPeriodEnd: false
      });
      console.log(`Subscription canceled for user ${userId} - reverted to free tier`);
    }
  }

  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: stripeSubscription.id }
  });

  if (subscription) {
    await subscription.update({
      status: 'cancelled',
      canceledAt: new Date()
    });
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription && subscription.status !== 'active') {
      await subscription.update({ status: 'active' });
    }
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    const stripeSubscription = await require('stripe')(process.env.STRIPE_SECRET_KEY)
      .subscriptions.retrieve(invoice.subscription);

    const userId = stripeSubscription.metadata?.userId;

    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          subscriptionStatus: 'past_due'
        });
        console.log(`Payment failed for user ${userId} - status: past_due`);
        // TODO: Send payment failed email
      }
    }

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription) {
      await subscription.update({ status: 'past_due' });
    }
  }
}

// Get subscription history (admin)
exports.getSubscriptionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const subscriptions = await Subscription.findAll({
      where: { userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Subscription.count({ where: { userId } });

    res.json({
      subscriptions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + subscriptions.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

const { Op } = require('sequelize');
const { Subscription, User } = require('../models');
const stripeService = require('../services/stripeService');

// Get subscription tiers/plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        tier: 'basic',
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Access to community feed',
          'Basic movement programs',
          'Achievement tracking',
          'Direct messaging'
        ]
      },
      {
        tier: 'premium',
        name: 'Premium',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Basic features',
          'Access to premium programs',
          'Ad-free experience',
          'Priority support',
          'Exclusive challenges'
        ]
      },
      {
        tier: 'elite',
        name: 'Elite',
        price: 49.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'All Premium features',
          'One-on-one coaching sessions',
          'Custom program creation',
          'Early access to new features',
          'Elite community access'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    next(error);
  }
};

// Get user's subscription
exports.getMySubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      where: {
        userId,
        status: { [Op.in]: ['active', 'past_due'] }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.json({ subscription: null });
    }

    res.json({ subscription });
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

// Handle subscription updated
async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: stripeSubscription.id }
  });

  if (subscription) {
    await subscription.update({
      status: stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription) {
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
    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (subscription) {
      await subscription.update({ status: 'past_due' });
      // TODO: Send notification to user
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

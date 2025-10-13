const { Op } = require('sequelize');
const { Purchase, Program, User } = require('../models');
const stripeService = require('../services/stripeService');
const AchievementService = require('../services/achievementService');

// Get user's purchase history
exports.getPurchases = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;

    let whereClause = { userId };

    if (status) {
      whereClause.status = status;
    }

    const purchases = await Purchase.findAll({
      where: whereClause,
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'title', 'slug', 'coverImage', 'description']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const totalCount = await Purchase.count({ where: whereClause });

    res.json({
      purchases,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + purchases.length < totalCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single purchase
exports.getPurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findOne({
      where: {
        id,
        userId
      },
      include: [
        {
          model: Program,
          as: 'program'
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ purchase });
  } catch (error) {
    next(error);
  }
};

// Create payment intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { programId } = req.body;
    const userId = req.user.id;

    if (!programId) {
      return res.status(400).json({ error: 'Program ID is required' });
    }

    const program = await Program.findByPk(programId);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (!program.isPublished) {
      return res.status(400).json({ error: 'Program is not available for purchase' });
    }

    // Check if user already purchased this program
    const existingPurchase = await Purchase.findOne({
      where: {
        userId,
        programId,
        status: 'completed'
      }
    });

    if (existingPurchase) {
      return res.status(400).json({ error: 'You have already purchased this program' });
    }

    // Get or create Stripe customer
    const user = await User.findByPk(userId);
    const customerId = await stripeService.getOrCreateCustomer(user);

    // Calculate amount (use discount price if available)
    const amount = program.discountPrice || program.price;

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: parseFloat(amount) * 100, // Convert to cents
      currency: program.currency.toLowerCase(),
      customerId,
      metadata: {
        userId,
        programId,
        programTitle: program.title
      }
    });

    // Create pending purchase record
    const purchase = await Purchase.create({
      userId,
      programId,
      amount,
      currency: program.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      purchaseId: purchase.id
    });
  } catch (error) {
    next(error);
  }
};

// Confirm purchase (called after successful payment)
exports.confirmPurchase = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const purchase = await Purchase.findOne({
      where: {
        stripePaymentIntentId: paymentIntentId
      },
      include: [
        {
          model: Program,
          as: 'program'
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await purchase.update({
        status: 'completed'
      });

      // Increment enrollment count
      await purchase.program.increment('enrollmentCount');

      // Check for purchase-related achievements
      AchievementService.checkPurchaseAchievements(purchase.userId).catch(err => {
        console.error('Achievement check error:', err);
      });

      res.json({
        message: 'Purchase confirmed successfully',
        purchase
      });
    } else {
      res.status(400).json({
        error: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripeService.constructWebhookEvent(req.body, sig);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  const purchase = await Purchase.findOne({
    where: {
      stripePaymentIntentId: paymentIntent.id
    },
    include: [
      {
        model: Program,
        as: 'program'
      }
    ]
  });

  if (purchase && purchase.status === 'pending') {
    await purchase.update({
      status: 'completed'
    });

    // Increment enrollment count
    if (purchase.program) {
      await purchase.program.increment('enrollmentCount');
    }

    // Check for purchase-related achievements
    AchievementService.checkPurchaseAchievements(purchase.userId).catch(err => {
      console.error('Achievement check error:', err);
    });

    // TODO: Send confirmation email
    // TODO: Send push notification
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  const purchase = await Purchase.findOne({
    where: {
      stripePaymentIntentId: paymentIntent.id
    }
  });

  if (purchase) {
    await purchase.update({
      status: 'failed'
    });

    // TODO: Send failure notification
  }
}

// Request refund
exports.requestRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const purchase = await Purchase.findOne({
      where: {
        id,
        userId,
        status: 'completed'
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found or not eligible for refund' });
    }

    // Check if purchase is within refund period (e.g., 30 days)
    const refundPeriodDays = 30;
    const purchaseDate = new Date(purchase.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));

    if (daysSincePurchase > refundPeriodDays) {
      return res.status(400).json({
        error: `Refund period expired. Refunds are only available within ${refundPeriodDays} days of purchase.`
      });
    }

    // Process refund with Stripe
    const refund = await stripeService.createRefund(purchase.stripePaymentIntentId);

    await purchase.update({
      status: 'refunded',
      refundedAt: new Date()
    });

    res.json({
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    next(error);
  }
};

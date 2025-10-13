const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// User routes (require authentication)
router.use(verifyToken);

router.get('/my', subscriptionController.getMySubscription);
router.get('/history', subscriptionController.getSubscriptionHistory);
router.post('/', subscriptionController.createSubscription);
router.put('/', subscriptionController.updateSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/reactivate', subscriptionController.reactivateSubscription);

module.exports = router;

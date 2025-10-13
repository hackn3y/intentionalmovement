const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/auth');

// Stripe webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), purchaseController.handleWebhook);

// User routes (require authentication)
router.use(verifyToken);

router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchase);
router.post('/payment-intent', purchaseController.createPaymentIntent);
router.post('/confirm', purchaseController.confirmPurchase);
router.post('/:id/refund', purchaseController.requestRefund);

module.exports = router;

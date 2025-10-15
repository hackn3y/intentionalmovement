const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/auth');
const { canPurchasePrograms } = require('../middleware/subscriptionMiddleware');

// Webhook is handled in server.js before JSON middleware
// User routes (require authentication)
router.use(verifyToken);

router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchase);
router.post('/payment-intent', canPurchasePrograms, purchaseController.createPaymentIntent); // Basic+ only
router.post('/confirm', canPurchasePrograms, purchaseController.confirmPurchase); // Basic+ only
router.post('/:id/refund', purchaseController.requestRefund);

module.exports = router;

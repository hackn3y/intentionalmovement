/**
 * Test routes for debugging
 * TEMPORARY - Remove after fixing Stripe issues
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test Stripe configuration
router.get('/stripe-config', testController.testStripeConfig);

module.exports = router;
/**
 * Test routes for debugging
 * TEMPORARY - Remove after fixing Stripe issues
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test Stripe configuration
router.get('/stripe-config', testController.testStripeConfig);

// Fix hackn3y user specifically
router.get('/fix-hackn3y', testController.fixHackn3yUser);

module.exports = router;
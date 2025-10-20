const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const postRoutes = require('./posts');
const messageRoutes = require('./messages');
const programRoutes = require('./programs');
const purchaseRoutes = require('./purchases');
const achievementRoutes = require('./achievements');
const challengeRoutes = require('./challenges');
const subscriptionRoutes = require('./subscriptions');
const adminRoutes = require('./admin');
const dailyContentRoutes = require('./dailyContent');
const adminSetupRoutes = require('./admin-setup');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/messages', messageRoutes);
router.use('/programs', programRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/achievements', achievementRoutes);
router.use('/challenges', challengeRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/daily-content', dailyContentRoutes);
router.use('/admin-setup', adminSetupRoutes);

module.exports = router;

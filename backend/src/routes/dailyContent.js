const express = require('express');
const router = express.Router();
const dailyContentController = require('../controllers/dailyContentController');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Public/User routes
router.get('/today', dailyContentController.getTodayContent);
router.get('/date/:date', dailyContentController.getContentByDate);
router.get('/calendar', authenticate, dailyContentController.getContentCalendar);

// Authenticated user routes
router.post('/check-in', authenticate, dailyContentController.checkIn);
router.get('/streak', authenticate, dailyContentController.getStreak);
router.get('/history', authenticate, dailyContentController.getCheckInHistory);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, dailyContentController.getAllDailyContent);
router.post('/admin/create', authenticate, isAdmin, dailyContentController.createDailyContent);
router.put('/admin/:id', authenticate, isAdmin, dailyContentController.updateDailyContent);
router.delete('/admin/:id', authenticate, isAdmin, dailyContentController.deleteDailyContent);
router.get('/admin/stats', authenticate, isAdmin, dailyContentController.getContentStats);

module.exports = router;

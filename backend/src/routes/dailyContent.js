const express = require('express');
const router = express.Router();
const dailyContentController = require('../controllers/dailyContentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public/User routes (require authentication)
router.get('/today', verifyToken, dailyContentController.getTodayContent);
router.get('/date/:date', verifyToken, dailyContentController.getContentByDate);
router.get('/calendar', verifyToken, dailyContentController.getContentCalendar);

// Authenticated user routes
router.post('/check-in', verifyToken, dailyContentController.checkIn);
router.get('/streak', verifyToken, dailyContentController.getStreak);
router.get('/history', verifyToken, dailyContentController.getCheckInHistory);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, dailyContentController.getAllDailyContent);
router.post('/admin/create', verifyToken, isAdmin, dailyContentController.createDailyContent);
router.put('/admin/:id', verifyToken, isAdmin, dailyContentController.updateDailyContent);
router.delete('/admin/:id', verifyToken, isAdmin, dailyContentController.deleteDailyContent);
router.get('/admin/stats', verifyToken, isAdmin, dailyContentController.getContentStats);

module.exports = router;

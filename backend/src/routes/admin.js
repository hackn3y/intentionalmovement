const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin, isModerator } = require('../middleware/auth');

// All admin routes require authentication and admin/moderator role
router.use(verifyToken);

// Dashboard routes
router.get('/dashboard/stats', isAdmin, adminController.getDashboardStats);

// Admin-only routes
router.get('/stats', isAdmin, adminController.getDashboardStats);
router.get('/analytics', isAdmin, adminController.getAnalytics);
router.post('/bulk-action', isAdmin, adminController.bulkAction);

// User management
router.get('/users', isAdmin, adminController.getUsers);
router.get('/users/:id', isAdmin, adminController.getUser);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.post('/users/:id/ban', isAdmin, adminController.banUser);
router.post('/users/:id/unban', isAdmin, adminController.unbanUser);

// Program management
const programController = require('../controllers/programController');
router.get('/programs', isAdmin, adminController.getPrograms); // Admin version shows all programs
router.get('/programs/:id', isAdmin, programController.getProgram);
router.post('/programs', isAdmin, programController.createProgram);
router.put('/programs/:id', isAdmin, programController.updateProgram);
router.delete('/programs/:id', isAdmin, programController.deleteProgram);

// Posts management (temporarily using public routes)
const postController = require('../controllers/postController');
router.get('/posts', isAdmin, postController.getFeed);
router.delete('/posts/:id', isAdmin, postController.deletePost);

// Report management (admin and moderators)
router.get('/reports', isModerator, adminController.getReports);
router.get('/reports/:id', isModerator, adminController.getReport);
router.put('/reports/:id', isModerator, adminController.updateReport);
router.get('/moderation-queue', isModerator, adminController.getModerationQueue);

// Purchase management (admin only)
router.post('/purchases/create', isAdmin, adminController.createPurchaseForUser);

module.exports = router;

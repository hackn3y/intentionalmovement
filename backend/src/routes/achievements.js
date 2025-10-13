const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.use(verifyToken);

router.get('/', achievementController.getAchievements);
router.get('/leaderboard', achievementController.getLeaderboard);
router.get('/:id', achievementController.getAchievement);
router.get('/user/:userId', achievementController.getUserAchievements);

// Admin routes
router.post('/', isAdmin, achievementController.createAchievement);
router.post('/award', isAdmin, achievementController.awardAchievement);
router.put('/:id', isAdmin, achievementController.updateAchievement);
router.delete('/:id', isAdmin, achievementController.deleteAchievement);

module.exports = router;

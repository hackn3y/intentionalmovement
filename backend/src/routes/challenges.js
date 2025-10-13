const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.use(verifyToken);

router.get('/', challengeController.getChallenges);
router.get('/my', challengeController.getMyChallenges);
router.get('/:id', challengeController.getChallenge);
router.post('/:id/join', challengeController.joinChallenge);
router.delete('/:id/leave', challengeController.leaveChallenge);
router.put('/:id/progress', challengeController.updateProgress);
router.get('/:id/leaderboard', challengeController.getLeaderboard);

// Admin routes
router.post('/', isAdmin, challengeController.createChallenge);
router.put('/:id', isAdmin, challengeController.updateChallenge);
router.delete('/:id', isAdmin, challengeController.deleteChallenge);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// All user routes require authentication
router.use(verifyToken);

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserProfile);
router.put('/:id', userController.updateUserProfile);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);
router.get('/:id/stats', userController.getUserStats);

module.exports = router;

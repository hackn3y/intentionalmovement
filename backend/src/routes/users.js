const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { uploadImage } = require('../config/upload');

// All user routes require authentication
router.use(verifyToken);

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserProfile);
router.put('/:id', userController.updateUserProfile);
// Upload routes temporarily disabled - will enable after verification
// router.post('/:id/upload-profile-image', uploadImage.single('image'), userController.uploadProfileImage);
// router.post('/:id/upload-cover-image', uploadImage.single('image'), userController.uploadCoverImage);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);
router.get('/:id/stats', userController.getUserStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/auth');
const { uploadImage } = require('../config/upload');
const {
  validateCreatePost,
  validateCreateComment,
  validateUuidParam,
  validatePagination
} = require('../middleware/validation');
const { writeRateLimit, readRateLimit } = require('../middleware/userRateLimit');

// All post routes require authentication
router.use(verifyToken);

// Read endpoints with lenient rate limiting
router.get('/', validatePagination, readRateLimit, postController.getFeed);
router.get('/:id', validateUuidParam('id'), readRateLimit, postController.getPost);
router.get('/:id/comments', validateUuidParam('id'), validatePagination, readRateLimit, postController.getComments);
router.get('/:id/share', validateUuidParam('id'), readRateLimit, postController.sharePost);

// Write endpoints with stricter rate limiting
router.post('/', uploadImage.single('image'), validateCreatePost, writeRateLimit, postController.createPost);
router.put('/:id', validateUuidParam('id'), validateCreatePost, writeRateLimit, postController.updatePost);
router.delete('/:id', validateUuidParam('id'), writeRateLimit, postController.deletePost);
router.post('/:id/like', validateUuidParam('id'), writeRateLimit, postController.likePost);
router.delete('/:id/like', validateUuidParam('id'), writeRateLimit, postController.unlikePost);
router.post('/:id/comments', validateUuidParam('id'), validateCreateComment, writeRateLimit, postController.addComment);
router.post('/:id/repost', validateUuidParam('id'), writeRateLimit, postController.repost);
router.post('/:id/report', validateUuidParam('id'), writeRateLimit, postController.reportPost);

module.exports = router;

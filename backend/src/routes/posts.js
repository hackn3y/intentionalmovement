const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/auth');
const {
  validateCreatePost,
  validateCreateComment,
  validateUuidParam,
  validatePagination
} = require('../middleware/validation');

// All post routes require authentication
router.use(verifyToken);

router.get('/', validatePagination, postController.getFeed);
router.post('/', validateCreatePost, postController.createPost);
router.get('/:id', validateUuidParam('id'), postController.getPost);
router.put('/:id', validateUuidParam('id'), validateCreatePost, postController.updatePost);
router.delete('/:id', validateUuidParam('id'), postController.deletePost);
router.post('/:id/like', validateUuidParam('id'), postController.likePost);
router.delete('/:id/like', validateUuidParam('id'), postController.unlikePost);
router.post('/:id/comments', validateUuidParam('id'), validateCreateComment, postController.addComment);
router.get('/:id/comments', validateUuidParam('id'), validatePagination, postController.getComments);
router.post('/:id/repost', validateUuidParam('id'), postController.repost);

module.exports = router;

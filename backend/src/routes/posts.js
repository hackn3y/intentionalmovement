const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken } = require('../middleware/auth');

// All post routes require authentication
router.use(verifyToken);

router.get('/', postController.getFeed);
router.post('/', postController.createPost);
router.get('/:id', postController.getPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.likePost);
router.delete('/:id/like', postController.unlikePost);
router.post('/:id/comments', postController.addComment);
router.get('/:id/comments', postController.getComments);
router.post('/:id/repost', postController.repost);

module.exports = router;

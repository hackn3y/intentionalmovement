const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');
const { canSendMessages } = require('../middleware/subscriptionMiddleware');

// All message routes require authentication
router.use(verifyToken);

// Free users can view messages but not send new ones
router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:userId', messageController.getMessages);
router.post('/', canSendMessages, messageController.sendMessage); // Premium only
router.put('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;

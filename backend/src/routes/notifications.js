const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', verifyToken, getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', verifyToken, getUnreadCount);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', verifyToken, markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read', verifyToken, deleteAllRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark specific notification as read
 * @access  Private
 */
router.put('/:id/read', verifyToken, markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete specific notification
 * @access  Private
 */
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;

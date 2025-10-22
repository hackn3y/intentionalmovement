const { Notification, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get user's notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    const where = { userId };

    // Filter for unread notifications only if requested
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'username', 'displayName', 'profileImage'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Get total count
    const totalCount = await Notification.count({ where });

    // Get unread count
    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + notifications.length < totalCount,
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    if (!notification.isRead) {
      await notification.update({
        isRead: true,
        readAt: new Date(),
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: {
          userId,
          isRead: false,
        },
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 */
exports.deleteAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Notification.destroy({
      where: {
        userId,
        isRead: true,
      },
    });

    res.json({
      success: true,
      message: `Deleted ${result} read notifications`,
      count: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create notification (helper function for other controllers)
 * This is exported for use in other parts of the app
 */
exports.createNotification = async ({
  userId,
  type,
  title,
  message,
  data = null,
  fromUserId = null,
  actionUrl = null,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      fromUserId,
      actionUrl,
    });

    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

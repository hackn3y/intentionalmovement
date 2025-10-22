import api from './api';

/**
 * Notification service
 * Handles all notification-related API calls
 */

/**
 * Get user's notifications
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of notifications to fetch (default: 50)
 * @param {number} params.offset - Offset for pagination (default: 0)
 * @param {boolean} params.unreadOnly - Only fetch unread notifications (default: false)
 * @returns {Promise<Object>} Notifications data with pagination info
 */
export const getNotifications = async ({ limit = 50, offset = 0, unreadOnly = false } = {}) => {
  try {
    const response = await api.get('/notifications', {
      params: { limit, offset, unreadOnly: unreadOnly ? 'true' : 'false' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success message
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Success message
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all read notifications
 * @returns {Promise<Object>} Success message with count
 */
export const deleteAllRead = async () => {
  try {
    const response = await api.delete('/notifications/read');
    return response.data;
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
};

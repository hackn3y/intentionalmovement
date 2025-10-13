import api from './api';

/**
 * Message service
 */
export const messageService = {
  /**
   * Get all conversations
   */
  getConversations: () => {
    return api.get('/messages/conversations');
  },

  /**
   * Get messages in a conversation
   * @param {string} userId - User ID (partner in conversation)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getMessages: (userId, page = 1, limit = 50) => {
    return api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @param {string} messageData.conversationId - Conversation ID (optional if receiverId provided)
   * @param {string} messageData.receiverId - Receiver user ID (optional if conversationId provided)
   * @param {string} messageData.content - Message content/text
   * @param {string} messageData.text - Message text (alternative to content)
   * @param {string} messageData.mediaUrl - Media URL (optional)
   * @param {string} messageData.mediaType - Media type (image, video, file)
   */
  sendMessage: (messageData) => {
    return api.post('/messages', messageData);
  },

  /**
   * Create or get conversation with user
   * @param {string} userId - User ID to chat with
   */
  createConversation: (userId) => {
    return api.post('/messages/conversations', { userId });
  },

  /**
   * Mark conversation as read
   * @param {string} conversationId - Conversation ID
   */
  markAsRead: (conversationId) => {
    return api.put(`/messages/${conversationId}/read`);
  },

  /**
   * Delete a message
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID
   */
  deleteMessage: (conversationId, messageId) => {
    return api.delete(`/messages/${conversationId}/${messageId}`);
  },

  /**
   * Delete entire conversation
   * @param {string} conversationId - Conversation ID
   */
  deleteConversation: (conversationId) => {
    return api.delete(`/messages/conversations/${conversationId}`);
  },

  /**
   * Upload message media
   * @param {FormData} formData - Form data with media file
   */
  uploadMedia: (formData) => {
    return api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get unread message count
   */
  getUnreadCount: () => {
    return api.get('/messages/unread-count');
  },

  /**
   * Search messages
   * @param {string} query - Search query
   */
  searchMessages: (query) => {
    return api.get(`/messages/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Mute conversation
   * @param {string} conversationId - Conversation ID
   */
  muteConversation: (conversationId) => {
    return api.put(`/messages/conversations/${conversationId}/mute`);
  },

  /**
   * Unmute conversation
   * @param {string} conversationId - Conversation ID
   */
  unmuteConversation: (conversationId) => {
    return api.put(`/messages/conversations/${conversationId}/unmute`);
  },
};

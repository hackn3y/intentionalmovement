import api from './api';

/**
 * User service
 */
export const userService = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   */
  getUserProfile: (userId) => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Follow a user
   * @param {string} userId - User ID to follow
   */
  followUser: (userId) => {
    return api.post(`/users/${userId}/follow`);
  },

  /**
   * Unfollow a user
   * @param {string} userId - User ID to unfollow
   */
  unfollowUser: (userId) => {
    return api.delete(`/users/${userId}/follow`);
  },

  /**
   * Get user's followers
   * @param {string} userId - User ID
   */
  getFollowers: (userId) => {
    return api.get(`/users/${userId}/followers`);
  },

  /**
   * Get user's following
   * @param {string} userId - User ID
   */
  getFollowing: (userId) => {
    return api.get(`/users/${userId}/following`);
  },

  /**
   * Get user stats
   * @param {string} userId - User ID
   */
  getUserStats: (userId) => {
    return api.get(`/users/${userId}/stats`);
  },

  /**
   * Search users
   * @param {string} query - Search query
   */
  searchUsers: (query) => {
    return api.get(`/users/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   */
  updateUser: (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },

  /**
   * Upload profile picture
   * @param {FormData} formData - Form data with image
   */
  uploadProfilePicture: (formData) => {
    return api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get user activity feed
   * @param {string} userId - User ID
   */
  getUserActivity: (userId) => {
    return api.get(`/users/${userId}/activity`);
  },

  /**
   * Block a user
   * @param {string} userId - User ID to block
   */
  blockUser: (userId) => {
    return api.post(`/users/${userId}/block`);
  },

  /**
   * Unblock a user
   * @param {string} userId - User ID to unblock
   */
  unblockUser: (userId) => {
    return api.post(`/users/${userId}/unblock`);
  },

  /**
   * Report a user
   * @param {string} userId - User ID to report
   * @param {Object} reportData - Report details
   */
  reportUser: (userId, reportData) => {
    return api.post(`/users/${userId}/report`, reportData);
  },
};

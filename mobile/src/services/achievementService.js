import api from './api';

/**
 * Achievement service
 */
export const achievementService = {
  /**
   * Get user achievements
   * @param {string} userId - User ID (optional, defaults to current user)
   */
  getAchievements: (userId) => {
    const url = userId ? `/achievements/user/${userId}` : '/achievements';
    return api.get(url);
  },

  /**
   * Get all available achievement definitions
   */
  getAllAchievements: () => {
    return api.get('/achievements/all');
  },

  /**
   * Get leaderboard
   * @param {string} type - Leaderboard type (weekly, monthly, allTime)
   * @param {number} limit - Number of entries
   */
  getLeaderboard: (type = 'weekly', limit = 50) => {
    return api.get(`/achievements/leaderboard/${type}?limit=${limit}`);
  },

  /**
   * Claim an achievement
   * @param {string} achievementId - Achievement ID
   */
  claimAchievement: (achievementId) => {
    return api.post(`/achievements/${achievementId}/claim`);
  },

  /**
   * Get user rank and stats
   */
  getUserRank: () => {
    return api.get('/achievements/rank');
  },

  /**
   * Track achievement progress
   * @param {Object} progressData - Progress data
   * @param {string} progressData.type - Progress type (workout, post, challenge, etc.)
   * @param {number} progressData.value - Progress value
   * @param {Object} progressData.metadata - Additional metadata
   */
  trackProgress: (progressData) => {
    return api.post('/achievements/track', progressData);
  },

  /**
   * Get achievement by ID
   * @param {string} achievementId - Achievement ID
   */
  getAchievement: (achievementId) => {
    return api.get(`/achievements/${achievementId}`);
  },

  /**
   * Get user's achievement history
   */
  getAchievementHistory: () => {
    return api.get('/achievements/history');
  },

  /**
   * Get achievement categories
   */
  getCategories: () => {
    return api.get('/achievements/categories');
  },

  /**
   * Compare achievements with another user
   * @param {string} userId - User ID to compare with
   */
  compareAchievements: (userId) => {
    return api.get(`/achievements/compare/${userId}`);
  },
};

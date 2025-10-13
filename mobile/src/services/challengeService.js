import api from './api';

/**
 * Challenge service
 */
export const challengeService = {
  /**
   * Get all challenges with filters
   * @param {Object} params - Filter params
   * @param {string} params.category - Challenge category
   * @param {string} params.status - Challenge status (active, upcoming, completed)
   */
  getChallenges: ({ category, status = 'active' } = {}) => {
    let url = `/challenges?status=${status}`;
    if (category) url += `&category=${category}`;
    return api.get(url);
  },

  /**
   * Get single challenge by ID
   * @param {string} challengeId - Challenge ID
   */
  getChallengeById: (challengeId) => {
    return api.get(`/challenges/${challengeId}`);
  },

  /**
   * Get user's participating challenges
   */
  getMyChallenges: () => {
    return api.get('/challenges/my-challenges');
  },

  /**
   * Join a challenge
   * @param {string} challengeId - Challenge ID
   */
  joinChallenge: (challengeId) => {
    return api.post(`/challenges/${challengeId}/join`);
  },

  /**
   * Leave a challenge
   * @param {string} challengeId - Challenge ID
   */
  leaveChallenge: (challengeId) => {
    return api.post(`/challenges/${challengeId}/leave`);
  },

  /**
   * Update challenge progress
   * @param {Object} progressData - Progress data
   * @param {string} progressData.challengeId - Challenge ID
   * @param {number} progressData.value - Progress value
   * @param {string} progressData.type - Progress type (workout, distance, duration, reps, etc.)
   * @param {Object} progressData.metadata - Additional metadata
   */
  updateProgress: (progressData) => {
    return api.post(`/challenges/${progressData.challengeId}/progress`, progressData);
  },

  /**
   * Get challenge leaderboard
   * @param {string} challengeId - Challenge ID
   */
  getLeaderboard: (challengeId) => {
    return api.get(`/challenges/${challengeId}/leaderboard`);
  },

  /**
   * Get challenge feed/activity
   * @param {string} challengeId - Challenge ID
   */
  getChallengeFeed: (challengeId) => {
    return api.get(`/challenges/${challengeId}/feed`);
  },

  /**
   * Create a new challenge
   * @param {Object} challengeData - Challenge creation data
   * @param {string} challengeData.title - Challenge title
   * @param {string} challengeData.description - Challenge description
   * @param {string} challengeData.type - Challenge type (individual, team)
   * @param {string} challengeData.category - Challenge category
   * @param {Date} challengeData.startDate - Start date
   * @param {Date} challengeData.endDate - End date
   * @param {Object} challengeData.goal - Challenge goal
   */
  createChallenge: (challengeData) => {
    return api.post('/challenges', challengeData);
  },

  /**
   * Update challenge
   * @param {string} challengeId - Challenge ID
   * @param {Object} challengeData - Updated challenge data
   */
  updateChallenge: (challengeId, challengeData) => {
    return api.put(`/challenges/${challengeId}`, challengeData);
  },

  /**
   * Delete challenge
   * @param {string} challengeId - Challenge ID
   */
  deleteChallenge: (challengeId) => {
    return api.delete(`/challenges/${challengeId}`);
  },

  /**
   * Get challenge participants
   * @param {string} challengeId - Challenge ID
   */
  getParticipants: (challengeId) => {
    return api.get(`/challenges/${challengeId}/participants`);
  },

  /**
   * Invite users to challenge
   * @param {string} challengeId - Challenge ID
   * @param {Array<string>} userIds - Array of user IDs to invite
   */
  inviteUsers: (challengeId, userIds) => {
    return api.post(`/challenges/${challengeId}/invite`, { userIds });
  },

  /**
   * Get featured challenges
   */
  getFeaturedChallenges: () => {
    return api.get('/challenges/featured');
  },

  /**
   * Get challenge categories
   */
  getCategories: () => {
    return api.get('/challenges/categories');
  },
};

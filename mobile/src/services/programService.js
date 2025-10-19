import api from './api';

/**
 * Program service
 */
export const programService = {
  /**
   * Get all programs with filters
   * @param {Object} params - Filter params
   * @param {string} params.category - Program category
   * @param {string} params.search - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  getPrograms: ({ category, search, page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    let url = `/programs?offset=${offset}&limit=${limit}&_t=${Date.now()}`;
    if (category && category !== 'all') url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return api.get(url);
  },

  /**
   * Get single program by ID
   * @param {string} programId - Program ID
   */
  getProgramById: (programId) => {
    return api.get(`/programs/${programId}?_t=${Date.now()}`);
  },

  /**
   * Get user's purchased programs
   */
  getMyPrograms: () => {
    return api.get('/programs/my/purchased');
  },

  /**
   * Purchase a program
   * @param {Object} purchaseData - Purchase data
   * @param {string} purchaseData.programId - Program ID
   * @param {string} purchaseData.paymentMethodId - Stripe payment method ID
   */
  purchaseProgram: (purchaseData) => {
    return api.post('/programs/purchase', purchaseData);
  },

  /**
   * Get program progress
   * @param {string} programId - Program ID
   */
  getProgramProgress: (programId) => {
    return api.get(`/programs/${programId}/progress`);
  },

  /**
   * Update lesson progress
   * @param {Object} progressData - Progress data
   * @param {string} progressData.programId - Program ID
   * @param {string} progressData.lessonId - Lesson ID
   * @param {number} progressData.progress - Progress percentage (0-100)
   * @param {boolean} progressData.completed - Whether lesson is completed
   * @param {number} progressData.watchTime - Time watched in seconds
   */
  updateLessonProgress: (progressData) => {
    return api.post(`/programs/${progressData.programId}/progress`, progressData);
  },

  /**
   * Rate a program
   * @param {Object} ratingData - Rating data
   * @param {string} ratingData.programId - Program ID
   * @param {number} ratingData.rating - Rating (1-5)
   * @param {string} ratingData.review - Review text
   */
  rateProgram: (ratingData) => {
    return api.post(`/programs/${ratingData.programId}/rate`, ratingData);
  },

  /**
   * Get featured programs
   */
  getFeaturedPrograms: () => {
    return api.get('/programs/featured');
  },

  /**
   * Get program categories
   */
  getCategories: () => {
    return api.get('/programs/categories');
  },

  /**
   * Get program lessons
   * @param {string} programId - Program ID
   */
  getLessons: (programId) => {
    return api.get(`/programs/${programId}/lessons`);
  },

  /**
   * Get lesson by ID
   * @param {string} programId - Program ID
   * @param {string} lessonId - Lesson ID
   */
  getLesson: (programId, lessonId) => {
    return api.get(`/programs/${programId}/lessons/${lessonId}`);
  },

  /**
   * Download program for offline viewing
   * @param {string} programId - Program ID
   */
  downloadProgram: (programId) => {
    return api.post(`/programs/${programId}/download`);
  },

  /**
   * Get recommended programs
   */
  getRecommendedPrograms: () => {
    return api.get('/programs/recommended');
  },

  /**
   * Get program reviews
   * @param {string} programId - Program ID
   */
  getReviews: (programId) => {
    return api.get(`/programs/${programId}/reviews`);
  },
};

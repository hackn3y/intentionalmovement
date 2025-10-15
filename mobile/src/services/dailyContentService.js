import api from './api';

/**
 * Daily Content Service
 * Handles daily motivational content and check-ins
 */
const dailyContentService = {
  // Get today's daily content
  getTodayContent: async () => {
    try {
      const response = await api.get('/daily-content/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get content for a specific date
  getContentByDate: async (date) => {
    try {
      const response = await api.get(`/daily-content/date/${date}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get content calendar (past 30 days)
  getContentCalendar: async (days = 30) => {
    try {
      const response = await api.get('/daily-content/calendar', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check in for today's content
  checkIn: async (notes = '', completed = false) => {
    try {
      const response = await api.post('/daily-content/check-in', {
        notes,
        completed
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's streak information
  getStreak: async () => {
    try {
      const response = await api.get('/daily-content/streak');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get check-in history
  getCheckInHistory: async (limit = 30, offset = 0) => {
    try {
      const response = await api.get('/daily-content/history', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default dailyContentService;

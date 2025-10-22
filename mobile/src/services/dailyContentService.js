import api from './api';

/**
 * Daily Content Service
 * Handles daily motivational content and check-ins
 */
const dailyContentService = {
  // Get today's daily content
  getTodayContent: async () => {
    const response = await api.get('/daily-content/today');
    return response.data;
  },

  // Get content for a specific date
  getContentByDate: async (date) => {
    const response = await api.get(`/daily-content/date/${date}`);
    return response.data;
  },

  // Get content calendar (past 30 days)
  getContentCalendar: async (days = 30) => {
    const response = await api.get('/daily-content/calendar', {
      params: { days }
    });
    return response.data;
  },

  // Check in for today's content
  checkIn: async (notes = '', completed = false) => {
    const response = await api.post('/daily-content/check-in', {
      notes,
      completed
    });
    return response.data;
  },

  // Get user's streak information
  getStreak: async () => {
    const response = await api.get('/daily-content/streak');
    return response.data;
  },

  // Get check-in history
  getCheckInHistory: async (limit = 30, offset = 0) => {
    const response = await api.get('/daily-content/history', {
      params: { limit, offset }
    });
    return response.data;
  }
};

export default dailyContentService;

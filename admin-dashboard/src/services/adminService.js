import api from './api';

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRevenueChart: async (days = 30) => {
    const response = await api.get(`/admin/dashboard/revenue?days=${days}`);
    return response.data;
  },

  getUserGrowthChart: async (days = 30) => {
    const response = await api.get(`/admin/dashboard/user-growth?days=${days}`);
    return response.data;
  },

  getTopPrograms: async (limit = 5) => {
    const response = await api.get(`/admin/dashboard/top-programs?limit=${limit}`);
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/admin/dashboard/activity?limit=${limit}`);
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  banUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  verifyUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/verify`);
    return response.data;
  },

  changeUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Program Management
  getPrograms: async (params = {}) => {
    const response = await api.get('/admin/programs', { params });
    return response.data;
  },

  getProgram: async (programId) => {
    const response = await api.get(`/admin/programs/${programId}`);
    return response.data;
  },

  createProgram: async (data) => {
    const response = await api.post('/admin/programs', data);
    return response.data;
  },

  updateProgram: async (programId, data) => {
    const response = await api.put(`/admin/programs/${programId}`, data);
    return response.data;
  },

  deleteProgram: async (programId) => {
    const response = await api.delete(`/admin/programs/${programId}`);
    return response.data;
  },

  publishProgram: async (programId) => {
    const response = await api.post(`/admin/programs/${programId}/publish`);
    return response.data;
  },

  unpublishProgram: async (programId) => {
    const response = await api.post(`/admin/programs/${programId}/unpublish`);
    return response.data;
  },

  uploadProgramImage: async (programId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/admin/programs/${programId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Post Management
  getPosts: async (params = {}) => {
    const response = await api.get('/admin/posts', { params });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  // Content Moderation
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  getReport: async (reportId) => {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  updateReport: async (reportId, data) => {
    const response = await api.put(`/admin/reports/${reportId}`, data);
    return response.data;
  },

  dismissReport: async (reportId, reason) => {
    const response = await api.post(`/admin/reports/${reportId}/dismiss`, { reason });
    return response.data;
  },

  hideContent: async (reportId, reason) => {
    const response = await api.post(`/admin/reports/${reportId}/hide`, { reason });
    return response.data;
  },

  banUserFromReport: async (reportId, reason) => {
    const response = await api.post(`/admin/reports/${reportId}/ban-user`, { reason });
    return response.data;
  },

  // Analytics
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getRevenueMetrics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics/revenue', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getUserMetrics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics/users', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getEngagementMetrics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics/engagement', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getProgramMetrics: async (startDate, endDate) => {
    const response = await api.get('/admin/analytics/programs', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (categoryId, data) => {
    const response = await api.put(`/admin/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },
};

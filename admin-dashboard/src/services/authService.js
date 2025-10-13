import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('adminToken');
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get('/admin/verify');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/admin/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

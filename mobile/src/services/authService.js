import api from './api';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.username - Username
   */
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  /**
   * Login with Firebase (Google/Apple Sign In)
   * @param {Object} firebaseData - Firebase auth data
   * @param {string} firebaseData.idToken - Firebase ID token
   * @param {string} firebaseData.provider - Auth provider (google, apple)
   */
  loginWithFirebase: (firebaseData) => {
    return api.post('/auth/firebase-auth', firebaseData);
  },

  /**
   * Logout user
   */
  logout: () => {
    return api.post('/auth/logout');
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   */
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  /**
   * Request password reset
   * @param {string} email - User email
   */
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param {Object} data - Reset data
   * @param {string} data.token - Reset token
   * @param {string} data.password - New password
   */
  resetPassword: (data) => {
    return api.post('/auth/reset-password', data);
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  updateProfile: (userData) => {
    return api.put('/auth/profile', userData);
  },

  /**
   * Change password
   * @param {Object} passwords - Password data
   * @param {string} passwords.currentPassword - Current password
   * @param {string} passwords.newPassword - New password
   */
  changePassword: (passwords) => {
    return api.post('/auth/change-password', passwords);
  },

  /**
   * Verify email
   * @param {string} token - Verification token
   */
  verifyEmail: (token) => {
    return api.post('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerification: () => {
    return api.post('/auth/resend-verification');
  },
};

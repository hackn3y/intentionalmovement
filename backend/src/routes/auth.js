const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUpdateProfile,
  validateEmail
} = require('../middleware/validation');
const { authRateLimit } = require('../middleware/userRateLimit');

// Apply strict rate limiting to authentication endpoints
router.post('/register', authRateLimit, validateUserRegistration, authController.register);
router.post('/login', authRateLimit, validateUserLogin, authController.login);
router.post('/firebase-auth', authRateLimit, authController.firebaseAuth);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authRateLimit, authController.refreshToken);
router.post('/forgot-password', authRateLimit, validateEmail, authController.forgotPassword);
router.post('/reset-password', authRateLimit, authController.resetPassword);
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/profile', verifyToken, validateUpdateProfile, authController.updateProfile);

module.exports = router;

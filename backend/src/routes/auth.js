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

router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateUserLogin, authController.login);
router.post('/firebase-auth', authController.firebaseAuth);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validateEmail, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/profile', verifyToken, validateUpdateProfile, authController.updateProfile);

module.exports = router;

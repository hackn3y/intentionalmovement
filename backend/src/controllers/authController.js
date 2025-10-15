const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const admin = require('firebase-admin');
const response = require('../utils/response');
const mixpanel = require('../services/mixpanelService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, username, displayName, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return response.conflict(res, 'Email or username already exists');
    }

    // Create user - Sequelize will only insert non-null values
    const user = await User.build({
      email,
      username,
      displayName,
      password
    });

    // Save without default values for missing columns
    await user.save({ fields: ['email', 'username', 'displayName', 'password'] });

    const token = generateToken(user.id);

    // Track signup event
    mixpanel.trackSignup({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.displayName,
      signupMethod: 'email',
      createdAt: user.createdAt,
    });

    return response.created(res, { user, token }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// Login user (with email OR username)
exports.login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = email || username;

    console.log('Login attempt:', { identifier: loginIdentifier, passwordProvided: !!password });

    // Find user by email OR username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: loginIdentifier },
          { username: loginIdentifier }
        ]
      }
    });

    console.log('User found:', !!user, 'Has password:', user ? !!user.password : false);

    if (!user || !user.password) {
      console.log('Rejected: User not found or no password');
      return response.unauthorized(res, 'Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Rejected: Invalid password');
      return response.unauthorized(res, 'Invalid credentials');
    }

    if (!user.isActive) {
      return response.forbidden(res, 'Account is disabled');
    }

    await user.update({ lastActiveAt: new Date() });

    const token = generateToken(user.id);

    // Track login event
    mixpanel.trackLogin({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return response.success(res, { user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// Firebase authentication
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ where: { firebaseUid: uid } });

    if (!user) {
      // Create new user from Firebase data
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);

      user = await User.build({
        firebaseUid: uid,
        email,
        username,
        displayName: name || username,
        profileImage: picture,
        isVerified: true
      });

      await user.save({ fields: ['firebaseUid', 'email', 'username', 'displayName', 'profileImage', 'isVerified'] });
    }

    await user.update({ lastActiveAt: new Date() });

    const token = generateToken(user.id);

    return response.success(res, { user, token }, 'Authentication successful');
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    // Clear FCM token if provided
    if (req.body.fcmToken) {
      await req.user.update({ fcmToken: null });
    }

    return response.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return response.unauthorized(res, 'Invalid token');
    }

    const newToken = generateToken(user.id);

    return response.success(res, { token: newToken }, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return response.success(res, null, 'If the email exists, a reset link has been sent');
    }

    // TODO: Implement email sending with reset token
    // For now, just return success
    return response.success(res, null, 'If the email exists, a reset link has been sent');
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Verify reset token and update password
    return response.success(res, null, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    return response.success(res, { user: req.user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      displayName,
      username,
      bio,
      profileImage,
      coverImage,
      movementGoals,
      location,
      website
    } = req.body;

    // Check if username is being changed and if it's already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return response.badRequest(res, 'Username already taken');
      }
    }

    const updateData = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (movementGoals !== undefined) updateData.movementGoals = movementGoals;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;

    await req.user.update(updateData);

    return response.success(res, { user: req.user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};


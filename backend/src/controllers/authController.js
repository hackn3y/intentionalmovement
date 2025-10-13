const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const admin = require('firebase-admin');

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
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const user = await User.create({
      email,
      username,
      displayName,
      password
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    await user.update({ lastActiveAt: new Date() });

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user,
      token
    });
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

      user = await User.create({
        firebaseUid: uid,
        email,
        username,
        displayName: name || username,
        profileImage: picture,
        isVerified: true
      });
    }

    await user.update({ lastActiveAt: new Date() });

    const token = generateToken(user.id);

    res.json({
      message: 'Authentication successful',
      user,
      token
    });
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

    res.json({ message: 'Logged out successfully' });
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
      return res.status(401).json({ error: 'Invalid token' });
    }

    const newToken = generateToken(user.id);

    res.json({ token: newToken });
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
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // TODO: Implement email sending with reset token
    // For now, just return success
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Verify reset token and update password
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({ user: req.user });
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
        return res.status(400).json({ error: 'Username already taken' });
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

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

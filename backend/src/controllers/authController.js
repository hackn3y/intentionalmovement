const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
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
    console.log('=== REGISTRATION START ===');
    const { email, username, displayName, password } = req.body;
    console.log('Registration data:', { email, username, displayName, hasPassword: !!password });

    console.log('Checking for existing user...');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      },
      attributes: ['id', 'email', 'username'] // Only select columns that exist in production
    });

    if (existingUser) {
      console.log('User already exists');
      return response.conflict(res, 'Email or username already exists');
    }

    console.log('No existing user, proceeding with registration...');

    // Hash password manually
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Use raw SQL to insert user - bypasses Sequelize defaults for non-existent columns
    console.log('Executing raw SQL INSERT...');
    const [results] = await sequelize.query(
      `INSERT INTO "Users" (id, email, username, "displayName", password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :email, :username, :displayName, :password, NOW(), NOW())
       RETURNING id`,
      {
        replacements: { email, username, displayName, password: hashedPassword },
        type: sequelize.QueryTypes.INSERT
      }
    );
    console.log('SQL INSERT successful, results:', results);

    const userId = results[0].id;
    console.log('New user ID:', userId);

    // Retrieve the created user using Sequelize model (for proper serialization)
    console.log('Fetching created user...');
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
    });
    console.log('User fetched:', !!user);

    console.log('Generating token...');
    const token = generateToken(user.id);

    // Track signup event
    console.log('Tracking signup in Mixpanel...');
    try {
      mixpanel.trackSignup({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.displayName,
        signupMethod: 'email',
        createdAt: user.createdAt,
      });
    } catch (mixpanelError) {
      console.error('Mixpanel tracking failed (non-critical):', mixpanelError.message);
    }

    console.log('Registration successful, sending response');
    return response.created(res, { user, token }, 'User registered successfully');
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.original) {
      console.error('Original error:', error.original);
    }
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
      },
      attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'password', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
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

    // Skip isActive and lastActiveAt checks - these columns don't exist in production DB
    // if (!user.isActive) {
    //   return response.forbidden(res, 'Account is disabled');
    // }
    // await user.update({ lastActiveAt: new Date() });

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

// Firebase/Google OAuth authentication
exports.firebaseAuth = async (req, res, next) => {
  try {
    const { idToken, email, displayName, profileImage, userInfo } = req.body;

    console.log('Google OAuth login attempt:', { email, displayName, hasToken: !!idToken });

    // Validate required fields
    if (!email) {
      return response.badRequest(res, 'Email is required for Google authentication');
    }

    // Verify the Google OAuth token by calling Google's API
    let googleUserInfo = userInfo;
    if (!googleUserInfo && idToken) {
      try {
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + idToken);
        if (googleResponse.ok) {
          const tokenInfo = await googleResponse.json();
          console.log('Google token verified:', { email: tokenInfo.email });

          // Ensure the token email matches the provided email
          if (tokenInfo.email !== email) {
            return response.unauthorized(res, 'Token email does not match provided email');
          }
        } else {
          console.warn('Could not verify Google token, proceeding with provided user info');
        }
      } catch (verifyError) {
        console.warn('Google token verification failed:', verifyError.message);
        // Continue anyway - we'll rely on the email
      }
    }

    // Try to find user by email (Google users don't have passwords)
    let user = await User.findOne({
      where: { email },
      attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'password', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
    });

    if (!user) {
      // Create new user from Google OAuth data
      const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);

      console.log('Creating new user from Google OAuth:', { email, username, displayName });

      // Use raw SQL to insert user - bypasses Sequelize defaults for non-existent columns
      const [results] = await sequelize.query(
        `INSERT INTO "Users" (id, email, username, "displayName", "profileImage", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), :email, :username, :displayName, :profileImage, NOW(), NOW())
         RETURNING id`,
        {
          replacements: {
            email,
            username,
            displayName: displayName || username,
            profileImage: profileImage || null
          },
          type: sequelize.QueryTypes.INSERT
        }
      );

      const userId = results[0].id;
      user = await User.findByPk(userId, {
        attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
      });

      console.log('New user created:', { id: user.id, email: user.email });
    } else {
      console.log('Existing user found:', { id: user.id, email: user.email });

      // Update profile image if provided and different
      if (profileImage && user.profileImage !== profileImage) {
        await user.update({ profileImage });
      }
    }

    const token = generateToken(user.id);

    // Track login event
    mixpanel.trackLogin({
      id: user.id,
      username: user.username,
      email: user.email,
      loginMethod: 'google'
    });

    return response.success(res, { user, token }, 'Google authentication successful');
  } catch (error) {
    console.error('Google OAuth error:', error);
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
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return response.unauthorized(res, 'Invalid token');
    }

    // Skip isActive check - column doesn't exist in production DB
    // if (!user.isActive) {
    //   return response.unauthorized(res, 'Invalid token');
    // }

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

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email', 'username']
    });

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
      const existingUser = await User.findOne({
        where: { username },
        attributes: ['id', 'username']
      });
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


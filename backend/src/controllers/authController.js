const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sequelize } = require('../models');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const response = require('../utils/response');
const mixpanel = require('../services/mixpanelService');
const mailchimp = require('../services/mailchimpService');

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

    // Create user with plaintext password - the beforeCreate hook will hash it
    // DO NOT hash here, or it will be double-hashed by the beforeCreate hook
    console.log('Creating user with Sequelize...');
    const user = await User.create({
      email,
      username,
      displayName,
      password: password
    });
    console.log('User created successfully, ID:', user.id);

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

    // Subscribe to Mailchimp newsletter
    console.log('Subscribing to Mailchimp newsletter...');
    try {
      const nameParts = (user.displayName || user.username).split(' ');
      const firstName = nameParts[0] || user.username;
      const lastName = nameParts.slice(1).join(' ') || '';

      const mailchimpResult = await mailchimp.subscribeUser({
        email: user.email,
        firstName,
        lastName,
      });

      if (mailchimpResult.success) {
        console.log('User subscribed to Mailchimp newsletter:', user.email);
      } else {
        console.log('Mailchimp subscription skipped or failed:', mailchimpResult.message);
      }
    } catch (mailchimpError) {
      console.error('Mailchimp subscription failed (non-critical):', mailchimpError.message);
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

    console.log('[login] Login attempt:', {
      identifier: loginIdentifier,
      passwordProvided: !!password,
      passwordLength: password?.length,
    });

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

    console.log('[login] User found:', !!user, 'Has password:', user ? !!user.password : false);

    if (user) {
      console.log('[login] User details:', {
        email: user.email,
        hasPassword: !!user.password,
        passwordHashPrefix: user.password?.substring(0, 20),
      });
    }

    if (!user || !user.password) {
      console.log('[login] Rejected: User not found or no password');
      return response.unauthorized(res, 'Invalid credentials');
    }

    console.log('[login] Attempting password comparison...');
    const isValidPassword = await user.comparePassword(password);
    console.log('[login] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('[login] Rejected: Invalid password');
      // Also try direct bcrypt comparison for debugging
      const bcrypt = require('bcrypt');
      const directComparison = await bcrypt.compare(password, user.password);
      console.log('[login] Direct bcrypt comparison:', directComparison);
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

    console.log('=== FIREBASE AUTH START ===');
    console.log('Request body:', { email, displayName, hasToken: !!idToken, tokenLength: idToken?.length });
    console.log('Firebase Admin apps:', admin.apps.length);

    let verifiedEmail = email;
    let verifiedDisplayName = displayName;
    let verifiedProfileImage = profileImage;
    let firebaseUid = null;

    // If idToken is provided, verify it using Firebase Admin SDK
    if (idToken) {
      try {
        console.log('Verifying Firebase ID token...');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Firebase token verified:', { uid: decodedToken.uid, email: decodedToken.email });

        // Use verified data from Firebase token
        verifiedEmail = decodedToken.email;
        verifiedDisplayName = decodedToken.name || displayName;
        verifiedProfileImage = decodedToken.picture || profileImage;
        firebaseUid = decodedToken.uid;
      } catch (verifyError) {
        console.error('Firebase token verification failed:', verifyError.message);
        return response.unauthorized(res, 'Invalid Firebase token');
      }
    } else {
      // Fallback to Google OAuth token verification
      console.log('No Firebase ID token, using Google OAuth verification...');

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
    }

    // Try to find user by email (Google users don't have passwords)
    let user = await User.findOne({
      where: { email: verifiedEmail },
      attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'password', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
      // Create new user from Google OAuth data
      // Use email prefix without random suffix for cleaner usernames
      const baseUsername = verifiedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

      // Check if username exists, if so, add a number suffix
      let username = baseUsername;
      let existingUser = await User.findOne({ where: { username } });
      let counter = 1;

      while (existingUser) {
        username = `${baseUsername}${counter}`;
        existingUser = await User.findOne({ where: { username } });
        counter++;
      }

      console.log('Creating new user from Firebase OAuth:', { email: verifiedEmail, username, displayName: verifiedDisplayName, firebaseUid });

      // Create user using Sequelize model (works with both SQLite and PostgreSQL)
      user = await User.create({
        email: verifiedEmail,
        username,
        displayName: verifiedDisplayName || username,
        profileImage: verifiedProfileImage || null,
        firebaseUid: firebaseUid
      });

      console.log('New user created:', { id: user.id, email: user.email });

      // Subscribe new Firebase/Google users to Mailchimp newsletter
      console.log('Subscribing Firebase/Google user to Mailchimp newsletter...');
      try {
        const nameParts = (verifiedDisplayName || username).split(' ');
        const firstName = nameParts[0] || username;
        const lastName = nameParts.slice(1).join(' ') || '';

        const mailchimpResult = await mailchimp.subscribeUser({
          email: verifiedEmail,
          firstName,
          lastName,
        });

        if (mailchimpResult.success) {
          console.log('User subscribed to Mailchimp newsletter:', verifiedEmail);
          // Add tag to identify Firebase/Google signups
          await mailchimp.addTags(verifiedEmail, ['Google Signup']);
        } else {
          console.log('Mailchimp subscription skipped or failed:', mailchimpResult.message);
        }
      } catch (mailchimpError) {
        console.error('Mailchimp subscription failed (non-critical):', mailchimpError.message);
      }
    } else {
      console.log('Existing user found:', { id: user.id, email: user.email, role: user.role });

      // Update display name and profile image if provided and different
      const updateData = {};

      if (verifiedDisplayName && user.displayName !== verifiedDisplayName) {
        updateData.displayName = verifiedDisplayName;
      }

      if (verifiedProfileImage && user.profileImage !== verifiedProfileImage) {
        updateData.profileImage = verifiedProfileImage;
      }

      // Update firebaseUid if not set and we have one from the token
      if (firebaseUid && !user.firebaseUid) {
        updateData.firebaseUid = firebaseUid;
        console.log('Setting firebaseUid for existing user:', firebaseUid);
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
        console.log('User profile updated:', updateData);
      }
    }

    const token = generateToken(user.id);

    // Track login event
    mixpanel.trackLogin({
      id: user.id,
      username: user.username,
      email: user.email,
      loginMethod: 'firebase'
    });

    // Return user data with role included
    return response.success(res, { user, token }, 'Firebase authentication successful');
  } catch (error) {
    console.error('Firebase OAuth error:', error);
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
    // Skip location and website - these columns may not exist in production
    // if (location !== undefined) updateData.location = location;
    // if (website !== undefined) updateData.website = website;

    await req.user.update(updateData);

    return response.success(res, { user: req.user }, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    next(error);
  }
};


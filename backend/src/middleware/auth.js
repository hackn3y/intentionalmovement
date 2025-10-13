const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { User } = require('../models');

// Initialize Firebase Admin (only if credentials are provided)
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.warn('Firebase Admin not initialized:', error.message);
  }
}

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Try JWT verification first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid token or user inactive' });
      }

      req.user = user;
      return next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token verification
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ where: { firebaseUid: decodedToken.uid } });

        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'Invalid token or user inactive' });
        }

        req.user = user;
        return next();
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is moderator or admin
const isModerator = (req, res, next) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isModerator
};

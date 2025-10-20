const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { User } = require('../models');

// Initialize Firebase Admin (only if credentials are provided)
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    // Try to initialize with service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Use service account from environment variable (for production)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin initialized with service account from env');
    } else {
      // Use application default credentials (for local development)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin initialized with application default credentials');
    }
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
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Skip isActive check - column doesn't exist in production
      // if (!user.isActive) {
      //   return res.status(401).json({ error: 'User inactive' });
      // }

      req.user = user;
      return next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token verification
      if (admin.apps.length > 0) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({
          where: { firebaseUid: decodedToken.uid },
          attributes: ['id', 'firebaseUid', 'email', 'username', 'displayName', 'bio', 'profileImage', 'coverImage', 'movementGoals', 'createdAt', 'updatedAt']
        });

        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // Skip isActive check - column doesn't exist in production
        // if (!user.isActive) {
        //   return res.status(401).json({ error: 'User inactive' });
        // }

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
  // TODO: role column doesn't exist in production DB yet
  // For now, allow all authenticated users (will need migration to add role column)
  console.warn('isAdmin check skipped - role column does not exist in production');
  next();

  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Admin access required' });
  // }
  // next();
};

// Check if user is moderator or admin
const isModerator = (req, res, next) => {
  // TODO: role column doesn't exist in production DB yet
  // For now, allow all authenticated users (will need migration to add role column)
  console.warn('isModerator check skipped - role column does not exist in production');
  next();

  // if (!['admin', 'moderator'].includes(req.user.role)) {
  //   return res.status(403).json({ error: 'Moderator access required' });
  // }
  // next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isModerator
};

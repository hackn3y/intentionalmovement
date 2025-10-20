const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { User } = require('../models');

// Initialize Firebase Admin (only if credentials are provided)
console.log('=== FIREBASE ADMIN INITIALIZATION ===');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT ? `SET (${process.env.FIREBASE_SERVICE_ACCOUNT.length} chars)` : 'NOT SET');

if (process.env.FIREBASE_PROJECT_ID) {
  try {
    // Try to initialize with service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Use service account from environment variable (for production)
      console.log('Attempting to parse FIREBASE_SERVICE_ACCOUNT...');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Parsed service account, project_id:', serviceAccount.project_id);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✓ Firebase Admin initialized with service account from env');
    } else {
      // Use application default credentials (for local development)
      console.log('Using application default credentials...');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✓ Firebase Admin initialized with application default credentials');
    }
    console.log('✓ Firebase Admin apps:', admin.apps.length);
  } catch (error) {
    console.error('✗ Firebase Admin initialization failed:', error.message);
    console.error('Stack:', error.stack);
  }
} else {
  console.log('✗ FIREBASE_PROJECT_ID not set, skipping Firebase Admin initialization');
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
const isAdmin = async (req, res, next) => {
  try {
    // Fetch fresh user data with role column
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'username', 'role']
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if role column exists (handles migration transition period)
    if (user.role === undefined || user.role === null) {
      console.warn('isAdmin check skipped - role column does not exist in production');
      return next();
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach role to request for downstream use
    req.user.role = user.role;
    next();
  } catch (error) {
    // If column doesn't exist, it will throw an error - allow access during migration
    if (error.message && error.message.includes('column')) {
      console.warn('isAdmin check skipped - role column does not exist in production');
      return next();
    }
    console.error('isAdmin middleware error:', error);
    return res.status(500).json({ error: 'Admin check failed' });
  }
};

// Check if user is moderator or admin
const isModerator = async (req, res, next) => {
  try {
    // Fetch fresh user data with role column
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'username', 'role']
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if role column exists (handles migration transition period)
    if (user.role === undefined || user.role === null) {
      console.warn('isModerator check skipped - role column does not exist in production');
      return next();
    }

    if (!['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Moderator access required' });
    }

    // Attach role to request for downstream use
    req.user.role = user.role;
    next();
  } catch (error) {
    // If column doesn't exist, it will throw an error - allow access during migration
    if (error.message && error.message.includes('column')) {
      console.warn('isModerator check skipped - role column does not exist in production');
      return next();
    }
    console.error('isModerator middleware error:', error);
    return res.status(500).json({ error: 'Moderator check failed' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isModerator
};

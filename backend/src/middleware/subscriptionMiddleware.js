/**
 * Middleware to check user subscription tier and access permissions
 */

/**
 * Require a specific subscription tier to access a route
 * @param {string} requiredTier - 'free', 'basic', or 'premium'
 * @returns {Function} Express middleware function
 * TEMPORARY: Bypass check if subscriptionTier column doesn't exist in production
 */
const requireSubscription = (requiredTier) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // TEMPORARY: If subscriptionTier doesn't exist (undefined/null), allow access
      if (user.subscriptionTier === undefined || user.subscriptionTier === null) {
        console.warn(`subscriptionTier column missing - allowing access to ${requiredTier} tier (temporary bypass)`);
        return next();
      }

      // Check if user has required tier
      if (!user.hasAccess(requiredTier)) {
        return res.status(403).json({
          success: false,
          error: 'Subscription upgrade required',
          requiredTier,
          currentTier: user.subscriptionTier,
          message: getUpgradeMessage(requiredTier, user.subscriptionTier)
        });
      }

      // Check if subscription is active
      if (!user.isSubscriptionActive() && user.subscriptionTier !== 'free') {
        return res.status(403).json({
          success: false,
          error: 'Subscription expired',
          message: 'Your subscription has expired. Please renew to continue using premium features.'
        });
      }

      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check subscription status'
      });
    }
  };
};

/**
 * Check if user can create posts (Basic+ required)
 * TEMPORARY: Bypass check if subscriptionTier column doesn't exist in production
 */
const canCreatePosts = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // TEMPORARY: If subscriptionTier doesn't exist (undefined/null/error), allow access
  // This allows operation while production database doesn't have subscription columns
  try {
    const tier = user.subscriptionTier;
    if (tier === undefined || tier === null) {
      console.warn('subscriptionTier column missing - allowing post creation (temporary bypass)');
      return next();
    }

    if (!user.canCreatePosts()) {
      return res.status(403).json({
        success: false,
        error: 'Subscription required',
        requiredTier: 'basic',
        currentTier: user.subscriptionTier,
        message: 'Upgrade to Basic or Premium to create posts and share your journey.'
      });
    }
  } catch (error) {
    // Column doesn't exist in database - bypass check
    console.warn('subscriptionTier column does not exist - allowing post creation (temporary bypass)');
    return next();
  }

  next();
};

/**
 * Check if user can send messages (Premium required)
 * TEMPORARY: Bypass check if subscriptionTier column doesn't exist in production
 */
const canSendMessages = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // TEMPORARY: If subscriptionTier doesn't exist (undefined/null/error), allow access
  try {
    const tier = user.subscriptionTier;
    if (tier === undefined || tier === null) {
      console.warn('subscriptionTier column missing - allowing messaging (temporary bypass)');
      return next();
    }

    if (!user.canSendMessages()) {
      return res.status(403).json({
        success: false,
        error: 'Premium subscription required',
        requiredTier: 'premium',
        currentTier: user.subscriptionTier,
        message: 'Upgrade to Premium to unlock direct messaging with other members.'
      });
    }
  } catch (error) {
    // Column doesn't exist in database - bypass check
    console.warn('subscriptionTier column does not exist - allowing messaging (temporary bypass)');
    return next();
  }

  next();
};

/**
 * Check if user can purchase programs (Basic+ required)
 * TEMPORARY: Bypass check if subscriptionTier column doesn't exist in production
 */
const canPurchasePrograms = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // TEMPORARY: If subscriptionTier doesn't exist (undefined/null/error), allow access
  try {
    const tier = user.subscriptionTier;
    if (tier === undefined || tier === null) {
      console.warn('subscriptionTier column missing - allowing program purchase (temporary bypass)');
      return next();
    }

    if (!user.canPurchasePrograms()) {
      return res.status(403).json({
        success: false,
        error: 'Subscription required',
        requiredTier: 'basic',
        currentTier: user.subscriptionTier,
        message: 'Upgrade to Basic or Premium to purchase wellness programs.'
      });
    }
  } catch (error) {
    // Column doesn't exist in database - bypass check
    console.warn('subscriptionTier column does not exist - allowing program purchase (temporary bypass)');
    return next();
  }

  next();
};

/**
 * Check if user has exceeded free tier limits
 * TEMPORARY: Bypass check if subscriptionTier column doesn't exist in production
 */
const checkFreeTierLimits = async (req, res, next) => {
  const user = req.user;

  // TEMPORARY: If subscriptionTier doesn't exist (undefined/null), bypass limits
  if (!user || user.subscriptionTier === undefined || user.subscriptionTier === null || user.subscriptionTier !== 'free') {
    return next(); // Not a free user, no limits
  }

  // Track usage in metadata
  const metadata = user.metadata || {};
  const today = new Date().toISOString().split('T')[0];

  // Reset daily counters if new day
  if (metadata.lastActionDate !== today) {
    metadata.likesGivenToday = 0;
    metadata.commentsGivenToday = 0;
    metadata.lastActionDate = today;
  }

  // Check action limits based on route
  const action = req.body.action || req.path.split('/').pop();

  switch (action) {
    case 'like':
      if ((metadata.likesGivenToday || 0) >= 50) {
        return res.status(429).json({
          success: false,
          error: 'Daily limit reached',
          message: 'Free users can give 50 likes per day. Upgrade to Basic for unlimited likes!'
        });
      }
      metadata.likesGivenToday = (metadata.likesGivenToday || 0) + 1;
      break;

    case 'comment':
      if ((metadata.commentsGivenToday || 0) >= 50) {
        return res.status(429).json({
          success: false,
          error: 'Daily limit reached',
          message: 'Free users can make 50 comments per day. Upgrade to Basic for unlimited engagement!'
        });
      }
      metadata.commentsGivenToday = (metadata.commentsGivenToday || 0) + 1;
      break;
  }

  // Update user metadata
  await user.update({ metadata });
  next();
};

/**
 * Get upgrade message based on tiers
 */
function getUpgradeMessage(requiredTier, currentTier) {
  if (requiredTier === 'basic' && currentTier === 'free') {
    return 'Upgrade to Basic ($9.99/month) to unlock this feature and create unlimited posts.';
  }
  if (requiredTier === 'premium' && currentTier === 'free') {
    return 'Upgrade to Premium ($29.99/month) to unlock all features including direct messaging.';
  }
  if (requiredTier === 'premium' && currentTier === 'basic') {
    return 'Upgrade to Premium ($29.99/month) to unlock this feature and get unlimited access.';
  }
  return `Upgrade to ${requiredTier} to access this feature.`;
}

module.exports = {
  requireSubscription,
  canCreatePosts,
  canSendMessages,
  canPurchasePrograms,
  checkFreeTierLimits
};

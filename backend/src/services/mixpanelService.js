const Mixpanel = require('mixpanel');
const logger = require('../utils/logger');

/**
 * Mixpanel Analytics Service
 * Tracks user events and behaviors for product analytics
 */
class MixpanelService {
  constructor() {
    this.client = null;
    this.isEnabled = false;
    this.initialize();
  }

  /**
   * Initialize Mixpanel client
   */
  initialize() {
    const token = process.env.MIXPANEL_TOKEN;

    if (!token || token === 'your_mixpanel_token') {
      logger.warn('Mixpanel token not configured. Analytics disabled.');
      return;
    }

    try {
      this.client = Mixpanel.init(token);
      this.isEnabled = true;
      logger.info('Mixpanel analytics initialized');
    } catch (error) {
      logger.error('Failed to initialize Mixpanel:', error);
    }
  }

  /**
   * Track an event
   * @param {string} userId - User ID
   * @param {string} eventName - Event name
   * @param {object} properties - Event properties
   */
  track(userId, eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      this.client.track(eventName, {
        distinct_id: userId,
        ...properties,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Mixpanel track error:', error);
    }
  }

  /**
   * Identify a user and set their properties
   * @param {string} userId - User ID
   * @param {object} properties - User properties
   */
  identify(userId, properties = {}) {
    if (!this.isEnabled) return;

    try {
      this.client.people.set(userId, {
        ...properties,
        $last_seen: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Mixpanel identify error:', error);
    }
  }

  /**
   * Increment a user property
   * @param {string} userId - User ID
   * @param {string} property - Property name
   * @param {number} value - Increment value (default: 1)
   */
  increment(userId, property, value = 1) {
    if (!this.isEnabled) return;

    try {
      this.client.people.increment(userId, property, value);
    } catch (error) {
      logger.error('Mixpanel increment error:', error);
    }
  }

  /**
   * Track user registration
   * @param {object} user - User object
   */
  trackSignup(user) {
    this.track(user.id, 'User Signup', {
      username: user.username,
      email: user.email,
      signupMethod: user.signupMethod || 'email',
    });

    this.identify(user.id, {
      $email: user.email,
      $name: user.fullName,
      username: user.username,
      signupDate: user.createdAt,
    });
  }

  /**
   * Track user login
   * @param {object} user - User object
   */
  trackLogin(user) {
    this.track(user.id, 'User Login', {
      username: user.username,
      email: user.email,
    });
  }

  /**
   * Track post creation
   * @param {object} user - User object
   * @param {object} post - Post object
   */
  trackPostCreated(user, post) {
    this.track(user.id, 'Post Created', {
      postId: post.id,
      hasMedia: post.mediaUrl ? true : false,
      contentLength: post.content?.length || 0,
    });

    this.increment(user.id, 'posts_created');
  }

  /**
   * Track program purchase
   * @param {object} user - User object
   * @param {object} program - Program object
   * @param {number} price - Purchase price
   */
  trackProgramPurchase(user, program, price) {
    this.track(user.id, 'Program Purchased', {
      programId: program.id,
      programName: program.title,
      category: program.category,
      price,
      revenue: price,
    });

    this.increment(user.id, 'programs_purchased');
    this.increment(user.id, 'lifetime_revenue', price);
  }

  /**
   * Track program progress
   * @param {object} user - User object
   * @param {object} program - Program object
   * @param {number} progress - Progress percentage
   */
  trackProgramProgress(user, program, progress) {
    this.track(user.id, 'Program Progress Updated', {
      programId: program.id,
      programName: program.title,
      progress,
    });
  }

  /**
   * Track achievement unlocked
   * @param {object} user - User object
   * @param {object} achievement - Achievement object
   */
  trackAchievementUnlocked(user, achievement) {
    this.track(user.id, 'Achievement Unlocked', {
      achievementId: achievement.id,
      achievementName: achievement.name,
      points: achievement.points,
    });

    this.increment(user.id, 'achievements_unlocked');
    this.increment(user.id, 'total_points', achievement.points);
  }

  /**
   * Track challenge participation
   * @param {object} user - User object
   * @param {object} challenge - Challenge object
   */
  trackChallengeJoined(user, challenge) {
    this.track(user.id, 'Challenge Joined', {
      challengeId: challenge.id,
      challengeName: challenge.name,
      duration: challenge.duration,
    });

    this.increment(user.id, 'challenges_joined');
  }

  /**
   * Track social engagement
   * @param {object} user - User object
   * @param {string} action - Action type (like, comment, follow)
   * @param {object} target - Target object
   */
  trackEngagement(user, action, target) {
    this.track(user.id, `User ${action}`, {
      targetType: target.type,
      targetId: target.id,
    });

    this.increment(user.id, `${action}s_count`);
  }
}

module.exports = new MixpanelService();

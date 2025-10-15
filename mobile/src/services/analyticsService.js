import { Mixpanel } from 'mixpanel-react-native';

/**
 * Analytics Service using Mixpanel
 * Tracks user events and behaviors
 */
class AnalyticsService {
  constructor() {
    this.mixpanel = null;
    this.isEnabled = false;
    this.isInitialized = false;
  }

  /**
   * Initialize Mixpanel
   */
  async initialize() {
    if (this.isInitialized) return;

    const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;

    if (!token || token === 'your_mixpanel_token') {
      if (__DEV__) {
        console.log('Mixpanel token not configured. Analytics disabled.');
      }
      return;
    }

    try {
      this.mixpanel = new Mixpanel(token);
      await this.mixpanel.init();
      this.isEnabled = true;
      this.isInitialized = true;

      if (__DEV__) {
        console.log('Mixpanel analytics initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
    }
  }

  /**
   * Track an event
   * @param {string} eventName - Event name
   * @param {object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      this.mixpanel.track(eventName, {
        ...properties,
        platform: 'mobile',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics track error:', error);
    }
  }

  /**
   * Identify a user
   * @param {string} userId - User ID
   */
  identify(userId) {
    if (!this.isEnabled) return;

    try {
      this.mixpanel.identify(userId);
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }

  /**
   * Set user properties
   * @param {object} properties - User properties
   */
  setUserProperties(properties) {
    if (!this.isEnabled) return;

    try {
      this.mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('Analytics set user properties error:', error);
    }
  }

  /**
   * Increment a user property
   * @param {string} property - Property name
   * @param {number} value - Increment value
   */
  increment(property, value = 1) {
    if (!this.isEnabled) return;

    try {
      this.mixpanel.getPeople().increment(property, value);
    } catch (error) {
      console.error('Analytics increment error:', error);
    }
  }

  /**
   * Reset analytics (on logout)
   */
  reset() {
    if (!this.isEnabled) return;

    try {
      this.mixpanel.reset();
    } catch (error) {
      console.error('Analytics reset error:', error);
    }
  }

  // Convenience methods for common events

  /**
   * Track screen view
   * @param {string} screenName - Screen name
   * @param {object} properties - Additional properties
   */
  trackScreenView(screenName, properties = {}) {
    this.track('Screen View', {
      screenName,
      ...properties,
    });
  }

  /**
   * Track user signup
   * @param {object} user - User object
   * @param {string} method - Signup method (email, google, apple)
   */
  trackSignup(user, method = 'email') {
    this.identify(user.id.toString());
    this.track('User Signup', {
      username: user.username,
      method,
    });
    this.setUserProperties({
      $email: user.email,
      $name: user.fullName,
      username: user.username,
      signupDate: new Date().toISOString(),
      signupMethod: method,
    });
  }

  /**
   * Track user login
   * @param {object} user - User object
   */
  trackLogin(user) {
    this.identify(user.id.toString());
    this.track('User Login', {
      username: user.username,
    });
  }

  /**
   * Track post creation
   * @param {object} post - Post object
   */
  trackPostCreated(post) {
    this.track('Post Created', {
      postId: post.id,
      hasMedia: post.mediaUrl ? true : false,
      contentLength: post.content?.length || 0,
    });
    this.increment('posts_created');
  }

  /**
   * Track post interaction
   * @param {string} action - Action type (like, comment, share)
   * @param {object} post - Post object
   */
  trackPostInteraction(action, post) {
    this.track(`Post ${action}`, {
      postId: post.id,
    });
    this.increment(`posts_${action}d`);
  }

  /**
   * Track program view
   * @param {object} program - Program object
   */
  trackProgramView(program) {
    this.track('Program Viewed', {
      programId: program.id,
      programName: program.title,
      category: program.category,
      price: program.price,
    });
  }

  /**
   * Track program purchase initiated
   * @param {object} program - Program object
   */
  trackPurchaseInitiated(program) {
    this.track('Purchase Initiated', {
      programId: program.id,
      programName: program.title,
      price: program.price,
    });
  }

  /**
   * Track program purchase completed
   * @param {object} program - Program object
   * @param {number} price - Purchase price
   */
  trackPurchaseCompleted(program, price) {
    this.track('Purchase Completed', {
      programId: program.id,
      programName: program.title,
      category: program.category,
      price,
      revenue: price,
    });
    this.increment('programs_purchased');
    this.increment('lifetime_revenue', price);
  }

  /**
   * Track lesson completion
   * @param {object} program - Program object
   * @param {string} lessonId - Lesson ID
   * @param {number} progress - Progress percentage
   */
  trackLessonCompleted(program, lessonId, progress) {
    this.track('Lesson Completed', {
      programId: program.id,
      programName: program.title,
      lessonId,
      progress,
    });
    this.increment('lessons_completed');
  }

  /**
   * Track achievement unlocked
   * @param {object} achievement - Achievement object
   */
  trackAchievementUnlocked(achievement) {
    this.track('Achievement Unlocked', {
      achievementId: achievement.id,
      achievementName: achievement.name,
      points: achievement.points,
    });
    this.increment('achievements_unlocked');
    this.increment('total_points', achievement.points);
  }

  /**
   * Track challenge joined
   * @param {object} challenge - Challenge object
   */
  trackChallengeJoined(challenge) {
    this.track('Challenge Joined', {
      challengeId: challenge.id,
      challengeName: challenge.name,
    });
    this.increment('challenges_joined');
  }

  /**
   * Track social action
   * @param {string} action - Action type (follow, unfollow)
   * @param {string} targetUserId - Target user ID
   */
  trackSocialAction(action, targetUserId) {
    this.track(`User ${action}`, {
      targetUserId,
    });
    this.increment(`${action}s_count`);
  }

  /**
   * Track message sent
   * @param {string} receiverId - Receiver user ID
   */
  trackMessageSent(receiverId) {
    this.track('Message Sent', {
      receiverId,
    });
    this.increment('messages_sent');
  }

  /**
   * Track search
   * @param {string} query - Search query
   * @param {string} type - Search type (users, programs, posts)
   * @param {number} resultsCount - Number of results
   */
  trackSearch(query, type, resultsCount) {
    this.track('Search', {
      query,
      type,
      resultsCount,
    });
  }
}

export default new AnalyticsService();

const admin = require('firebase-admin');
const { Op } = require('sequelize');
const { User } = require('../models');

// Check if Firebase Admin is initialized
const isFirebaseInitialized = () => {
  return admin.apps.length > 0;
};

// Send push notification to a single user
exports.sendNotificationToUser = async (userId, notification) => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase Admin not initialized. Skipping notification.');
      return null;
    }

    const user = await User.findByPk(userId);

    if (!user || !user.fcmToken) {
      console.log(`User ${userId} does not have FCM token`);
      return null;
    }

    const message = {
      token: user.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);

    // If token is invalid, clear it from the user record
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ fcmToken: null });
      }
    }

    throw error;
  }
};

// Send push notification to multiple users
exports.sendNotificationToUsers = async (userIds, notification) => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase Admin not initialized. Skipping notifications.');
      return null;
    }

    const users = await User.findAll({
      where: {
        id: userIds,
        fcmToken: { [Op.not]: null }
      },
      attributes: ['id', 'fcmToken']
    });

    if (users.length === 0) {
      console.log('No users with FCM tokens found');
      return null;
    }

    const tokens = users.map(u => u.fcmToken);

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: notification.data || {},
      tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 1
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error('Failed to send to token:', tokens[idx], resp.error);
        }
      });

      // Clear invalid tokens
      await clearInvalidTokens(failedTokens);
    }

    return response;
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

// Send notification to topic subscribers
exports.sendNotificationToTopic = async (topic, notification) => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase Admin not initialized. Skipping notification.');
      return null;
    }

    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification to topic:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    throw error;
  }
};

// Subscribe user to topic
exports.subscribeToTopic = async (userId, topic) => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase Admin not initialized. Skipping topic subscription.');
      return null;
    }

    const user = await User.findByPk(userId);

    if (!user || !user.fcmToken) {
      console.log(`User ${userId} does not have FCM token`);
      return null;
    }

    const response = await admin.messaging().subscribeToTopic([user.fcmToken], topic);
    console.log('Successfully subscribed to topic:', response);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
};

// Unsubscribe user from topic
exports.unsubscribeFromTopic = async (userId, topic) => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase Admin not initialized. Skipping topic unsubscription.');
      return null;
    }

    const user = await User.findByPk(userId);

    if (!user || !user.fcmToken) {
      console.log(`User ${userId} does not have FCM token`);
      return null;
    }

    const response = await admin.messaging().unsubscribeFromTopic([user.fcmToken], topic);
    console.log('Successfully unsubscribed from topic:', response);
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
};

// Clear invalid FCM tokens
async function clearInvalidTokens(tokens) {
  try {
    await User.update(
      { fcmToken: null },
      { where: { fcmToken: tokens } }
    );
    console.log(`Cleared ${tokens.length} invalid tokens`);
  } catch (error) {
    console.error('Error clearing invalid tokens:', error);
  }
}

// Notification templates
exports.NotificationTypes = {
  NEW_FOLLOWER: (followerName) => ({
    title: 'New Follower',
    body: `${followerName} started following you`,
    data: { type: 'new_follower' }
  }),

  NEW_LIKE: (username, postId) => ({
    title: 'New Like',
    body: `${username} liked your post`,
    data: { type: 'new_like', postId }
  }),

  NEW_COMMENT: (username, postId) => ({
    title: 'New Comment',
    body: `${username} commented on your post`,
    data: { type: 'new_comment', postId }
  }),

  NEW_MESSAGE: (senderName) => ({
    title: 'New Message',
    body: `${senderName} sent you a message`,
    data: { type: 'new_message' }
  }),

  ACHIEVEMENT_UNLOCKED: (achievementTitle) => ({
    title: 'Achievement Unlocked!',
    body: `You earned: ${achievementTitle}`,
    data: { type: 'achievement_unlocked' }
  }),

  CHALLENGE_STARTED: (challengeTitle) => ({
    title: 'Challenge Started',
    body: `${challengeTitle} has begun!`,
    data: { type: 'challenge_started' }
  }),

  CHALLENGE_REMINDER: (challengeTitle) => ({
    title: 'Challenge Reminder',
    body: `Don't forget to complete ${challengeTitle}`,
    data: { type: 'challenge_reminder' }
  }),

  PURCHASE_CONFIRMED: (programTitle) => ({
    title: 'Purchase Confirmed',
    body: `You now have access to ${programTitle}`,
    data: { type: 'purchase_confirmed' }
  }),

  SUBSCRIPTION_RENEWED: (tier) => ({
    title: 'Subscription Renewed',
    body: `Your ${tier} subscription has been renewed`,
    data: { type: 'subscription_renewed' }
  }),

  SUBSCRIPTION_EXPIRING: (daysLeft) => ({
    title: 'Subscription Expiring',
    body: `Your subscription will expire in ${daysLeft} days`,
    data: { type: 'subscription_expiring' }
  }),

  SUBSCRIPTION_PAYMENT_FAILED: () => ({
    title: 'Payment Failed',
    body: 'Your subscription payment failed. Please update your payment method.',
    data: { type: 'subscription_payment_failed' }
  })
};

module.exports = exports;

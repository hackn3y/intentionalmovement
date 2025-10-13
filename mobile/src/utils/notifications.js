import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from './storage';

/**
 * Configure notification handler
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Notification service
 */
export const notificationService = {
  /**
   * Register for push notifications
   * @returns {Promise<string|null>} Push token or null
   */
  registerForPushNotifications: async () => {
    let token = null;

    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification');
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data;

      await storage.set('pushToken', token);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  /**
   * Schedule local notification
   * @param {Object} notification - Notification data
   * @param {string} notification.title - Notification title
   * @param {string} notification.body - Notification body
   * @param {Object} notification.data - Additional data
   * @param {number} notification.seconds - Seconds from now to trigger
   */
  scheduleLocalNotification: async (notification) => {
    try {
      const { title, body, data = {}, seconds = 0 } = notification;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: seconds > 0 ? { seconds } : null,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  },

  /**
   * Cancel scheduled notification
   * @param {string} notificationId - Notification ID
   */
  cancelScheduledNotification: async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllScheduledNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  /**
   * Set notification badge count
   * @param {number} count - Badge count
   */
  setBadgeCount: async (count) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  },

  /**
   * Get badge count
   * @returns {Promise<number>} Badge count
   */
  getBadgeCount: async () => {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  },

  /**
   * Add notification received listener
   * @param {Function} callback - Callback function
   * @returns {Object} Subscription object
   */
  addNotificationReceivedListener: (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Add notification response listener (when user taps notification)
   * @param {Function} callback - Callback function
   * @returns {Object} Subscription object
   */
  addNotificationResponseReceivedListener: (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Remove notification subscription
   * @param {Object} subscription - Subscription object
   */
  removeNotificationSubscription: (subscription) => {
    if (subscription) {
      Notifications.removeNotificationSubscription(subscription);
    }
  },

  /**
   * Get last notification response
   * @returns {Promise<Object|null>} Last notification response
   */
  getLastNotificationResponse: async () => {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      return response;
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  },

  /**
   * Dismiss notification
   * @param {string} notificationId - Notification ID
   */
  dismissNotification: async (notificationId) => {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  },

  /**
   * Dismiss all notifications
   */
  dismissAllNotifications: async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  },
};

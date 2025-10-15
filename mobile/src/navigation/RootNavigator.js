import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';
import socketService from '../services/socketService';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Root navigator component
 * Handles authentication flow and deep linking
 */
const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  /**
   * Load user on mount
   */
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  /**
   * Setup socket connection when authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();

      // Register for push notifications (only on native platforms)
      if (Platform.OS !== 'web') {
        const { notificationService } = require('../utils/notifications');
        notificationService.registerForPushNotifications();
      }

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  /**
   * Handle notification responses (only on native platforms)
   */
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const { notificationService } = require('../utils/notifications');
    const subscription = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        const { notification } = response;
        const data = notification.request.content.data;

        // Handle navigation based on notification data
        console.log('Notification tapped:', data);
        // TODO: Navigate to appropriate screen based on data.type
      }
    );

    return () => {
      if (subscription) {
        notificationService.removeNotificationSubscription(subscription);
      }
    };
  }, []);

  /**
   * Show loading spinner while initializing
   */
  console.log('RootNavigator - initializing:', initializing, 'isAuthenticated:', isAuthenticated);

  if (initializing) {
    return <LoadingSpinner text="Loading..." />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;

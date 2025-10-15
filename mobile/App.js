import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import * as NavigationBar from 'expo-navigation-bar';

import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/constants';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import InstallPWA from './src/components/InstallPWA';
import analyticsService from './src/services/analyticsService';

// Only import StripeProvider on native platforms
let StripeProvider;
if (Platform.OS !== 'web') {
  StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
}

// Configure notifications only on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Component to handle navigation bar styling based on theme
function NavigationBarController() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar color based on theme
      NavigationBar.setBackgroundColorAsync(isDarkMode ? '#1a1a1a' : '#ffffff');
      NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
    }
  }, [isDarkMode]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Initialize analytics (commented out temporarily - causing issues)
    // analyticsService.initialize();

    // Only register for push notifications on native platforms
    if (Platform.OS === 'web') {
      return;
    }

    // Register for push notifications
    const registerPushNotifications = async () => {
      const { notificationService } = require('./src/utils/notifications');
      await notificationService.registerForPushNotifications();
    };

    registerPushNotifications();

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap
    });

    return () => {
      if (notificationListener?.remove) {
        notificationListener.remove();
      }
      if (responseListener?.remove) {
        responseListener.remove();
      }
    };
  }, []);

  // Configure linking for web navigation
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Welcome: 'welcome',
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        HomeTab: {
          screens: {
            Home: '',
            PostDetail: 'post/:id',
            CreatePost: 'create-post',
            Profile: 'user/:username',
          },
        },
        ProgramsTab: {
          screens: {
            Programs: 'programs',
            ProgramDetail: 'program/:id',
          },
        },
        MessagesTab: {
          screens: {
            Messages: 'messages',
            Chat: 'chat/:id',
          },
        },
        ProfileTab: {
          screens: {
            MyProfile: 'profile',
            Settings: 'settings',
            EditProfile: 'edit-profile',
          },
        },
      },
    },
  };

  // Force light theme for navigation
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff', // White background
      card: '#ffffff', // White card/header background
      border: '#fbcfe8', // Light pink borders
      text: '#111827', // Dark text
      primary: '#ec4899', // Hot pink primary color
    },
  };

  const content = (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      <NavigationBarController />
      <RootNavigator />
      <InstallPWA />
      <StatusBar style="auto" />
    </NavigationContainer>
  );

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <ThemeProvider>
            {Platform.OS === 'web' ? (
              content
            ) : (
              <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
                {content}
              </StripeProvider>
            )}
          </ThemeProvider>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

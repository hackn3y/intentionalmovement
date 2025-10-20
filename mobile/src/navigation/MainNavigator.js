import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';
import { fetchConversations, addMessageFromSocket } from '../store/slices/messagesSlice';
import socketService from '../services/socketService';
import HomeStack from './HomeStack';
import ProgramStack from './ProgramStack';
import MessageStack from './MessageStack';
import ProfileStack from './ProfileStack';
import DailyContentStack from './DailyContentStack';

const Tab = createBottomTabNavigator();

/**
 * Main tab navigator
 */
const MainNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const unreadCount = useSelector((state) => state.messages.unreadCount);

  // Set up real-time message updates and periodic refresh
  useEffect(() => {
    // Initial fetch
    dispatch(fetchConversations());

    // Note: Socket connection is managed by RootNavigator, not here
    // We just register our listener for new messages

    // Listen for new messages to update unread count
    const handleNewMessage = (message) => {
      // Refresh conversations to update unread count
      dispatch(fetchConversations());
    };

    socketService.onNewMessage(handleNewMessage);

    // Also poll every 60 seconds as fallback
    const interval = setInterval(() => {
      dispatch(fetchConversations());
    }, 60000);

    return () => {
      // Remove only this specific listener
      socketService.offNewMessage(handleNewMessage);
      clearInterval(interval);
    };
  }, [dispatch]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? colors.gray[400] : colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Intentional Movement Community',
          tabBarIcon: ({ color, size }) => (
            // Replace with actual icon component
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProgramsTab"
        component={ProgramStack}
        options={{
          tabBarLabel: 'Programs',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="DailyContentTab"
        component={DailyContentStack}
        options={{
          tabBarLabel: 'Daily',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessageStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to own profile when tapping Profile tab
            e.preventDefault();
            navigation.navigate('ProfileTab', {
              screen: 'Profile',
              params: { userId: null, _forceRefresh: Date.now() },
              initial: false,
            });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
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
import PlantedMindStack from './PlantedMindStack';
import PostStack from './PostStack';

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
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Navigate to Home screen in HomeStack
            e.preventDefault();
            navigation.navigate('HomeTab', {
              screen: 'Home',
            });
          },
        })}
      />
      <Tab.Screen
        name="CommunityTab"
        component={PostStack}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
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
        name="PlantedMindTab"
        component={PlantedMindStack}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessageStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: size, color }}>💬</Text>
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarButton: () => null, // Hide from tab bar but keep for navigation
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

import React, { useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';
import { fetchConversations, addMessageFromSocket } from '../store/slices/messagesSlice';
import { addNotification, fetchUnreadCount } from '../store/slices/notificationsSlice';
import socketService from '../services/socketService';
import HomeStack from './HomeStack';
import MessageStack from './MessageStack';
import NotificationStack from './NotificationStack';
import ProfileStack from './ProfileStack';
import PostStack from './PostStack';

const Tab = createBottomTabNavigator();

/**
 * Main tab navigator
 */
const MainNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const unreadMessagesCount = useSelector((state) => state.messages.unreadCount);
  const unreadNotificationsCount = useSelector((state) => state.notifications.unreadCount);
  const currentUser = useSelector((state) => state.auth.user);

  // Set up real-time message and notification updates
  useEffect(() => {
    // Initial fetch
    dispatch(fetchConversations());
    dispatch(fetchUnreadCount());

    // Note: Socket connection is managed by RootNavigator, not here
    // We just register our listeners for new messages and notifications

    // Listen for new messages to update unread count
    const handleNewMessage = (message) => {
      // Refresh conversations to update unread count
      dispatch(fetchConversations());
    };

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      // Add notification to Redux store
      dispatch(addNotification(notification));
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onNotification(handleNewNotification);

    // Also poll every 60 seconds as fallback
    const interval = setInterval(() => {
      dispatch(fetchConversations());
      dispatch(fetchUnreadCount());
    }, 60000);

    return () => {
      // Remove only these specific listeners
      socketService.offNewMessage(handleNewMessage);
      socketService.offNotification();
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
      {/* IMC (Home) Tab */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'IMC',
          tabBarIcon: ({ color, size, focused }) => {
            try {
              return (
                <Image
                  source={require('../../assets/imc-logo.png')}
                  style={{
                    width: size + 6,
                    height: size + 6,
                  }}
                  resizeMode="contain"
                />
              );
            } catch (error) {
              // Fallback if image fails to load
              return (
                <View
                  style={{
                    width: size,
                    height: size,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: focused ? colors.primary : colors.gray[400],
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: size / 2, fontWeight: 'bold' }}>
                    IM
                  </Text>
                </View>
              );
            }
          },
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeTab', {
              screen: 'Home',
            });
          },
        })}
      />

      {/* Messages Tab */}
      <Tab.Screen
        name="MessagesTab"
        component={MessageStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: size, color }}>💬</Text>
              {unreadMessagesCount > 0 && (
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
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* Community Tab */}
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

      {/* Alerts Tab */}
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationStack}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: size, color }}>🔔</Text>
              {unreadNotificationsCount > 0 && (
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
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: size + 4,
                height: size + 4,
                borderRadius: (size + 4) / 2,
                overflow: 'hidden',
                borderWidth: focused ? 2 : 0,
                borderColor: color,
              }}
            >
              {currentUser?.profileImage ? (
                <Image
                  source={{ uri: currentUser.profileImage }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: size / 2, color: colors.primary }}>
                    {currentUser?.displayName?.[0]?.toUpperCase() ||
                     currentUser?.username?.[0]?.toUpperCase() ||
                     '?'}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ProfileTab', {
              screen: 'Profile',
              params: { username: currentUser?.username },
            });
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

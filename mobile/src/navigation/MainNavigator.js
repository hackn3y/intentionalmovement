import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';
import HomeStack from './HomeStack';
import ProgramStack from './ProgramStack';
import MessageStack from './MessageStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

/**
 * Main tab navigator
 */
const MainNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  const unreadCount = useSelector((state) => state.messages.unreadCount);

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
          tabBarLabel: 'Home',
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
            // Get the ProfileTab navigator
            const state = navigation.getState();
            const profileTabRoute = state.routes.find(r => r.name === 'ProfileTab');

            // If we're already on ProfileTab and at the Profile screen, reset params
            if (state.index === state.routes.indexOf(profileTabRoute)) {
              e.preventDefault();
              navigation.navigate('ProfileTab', {
                screen: 'Profile',
                params: { userId: null },
                initial: false,
              });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;

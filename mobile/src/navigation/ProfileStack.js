import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

// Profile Screens
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import FollowersScreen from '../screens/Profile/FollowersScreen';
import FollowingScreen from '../screens/Profile/FollowingScreen';
import SettingsScreen from '../screens/Other/SettingsScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';

const Stack = createStackNavigator();

/**
 * Profile navigation stack
 */
const ProfileStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.dark,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId: null }}
        options={({ route }) => ({
          title: route.params?.username ? `@${route.params.username}` : 'Profile',
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Followers"
        component={FollowersScreen}
        options={{ title: 'Followers' }}
      />
      <Stack.Screen
        name="Following"
        component={FollowingScreen}
        options={{ title: 'Following' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Post' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;

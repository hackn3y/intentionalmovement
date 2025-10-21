import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardHomeScreen from '../screens/Main/DashboardHomeScreen';
import FeedScreen from '../screens/Main/FeedScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CommunityGuidelinesScreen from '../screens/Other/CommunityGuidelinesScreen';
import FreeContentScreen from '../screens/Other/FreeContentScreen';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

/**
 * Home stack navigator
 */
const HomeStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={DashboardHomeScreen}
        options={{
          title: 'Intentional Movement',
        }}
      />
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Intentional Movement Community',
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: 'Post',
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Create Post',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          title: route.params?.username || 'Profile',
        })}
      />
      <Stack.Screen
        name="CommunityGuidelines"
        component={CommunityGuidelinesScreen}
        options={{
          title: 'Community Guidelines',
        }}
      />
      <Stack.Screen
        name="FreeContent"
        component={FreeContentScreen}
        options={{
          title: 'Free Content',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;

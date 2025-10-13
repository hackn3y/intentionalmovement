import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Main/HomeScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
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
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
        },
        headerTintColor: colors.dark,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Feed',
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
    </Stack.Navigator>
  );
};

export default HomeStack;

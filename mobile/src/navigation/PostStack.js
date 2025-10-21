import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

// Post Screens
import FeedScreen from '../screens/Main/FeedScreen';
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';

const Stack = createStackNavigator();

/**
 * Post navigation stack for Community tab
 */
const PostStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'Community' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Create Post',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: 'Post',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default PostStack;

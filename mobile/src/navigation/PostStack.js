import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';

// Post Screens
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';

const Stack = createStackNavigator();

/**
 * Post navigation stack
 */
const PostStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.dark,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Post' }}
      />
    </Stack.Navigator>
  );
};

export default PostStack;

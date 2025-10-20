import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlantedMindScreen from '../screens/Main/PlantedMindScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();

/**
 * Planted Mind Moving Body stack navigator
 */
const PlantedMindStack = () => {
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
        headerBackTitleVisible: false,
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="PlantedMind"
        component={PlantedMindScreen}
        options={{
          title: 'Planted Mind Moving Body',
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
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          title: route.params?.username || 'Profile',
        })}
      />
    </Stack.Navigator>
  );
};

export default PlantedMindStack;

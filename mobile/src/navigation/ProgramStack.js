import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

// Program Screens
import ProgramsScreen from '../screens/Programs/ProgramsScreen';
import ProgramDetailScreen from '../screens/Programs/ProgramDetailScreen';
import MyProgramsScreen from '../screens/Programs/MyProgramsScreen';
import VideoPlayerScreen from '../screens/Programs/VideoPlayerScreen';
import CheckoutScreen from '../screens/Other/CheckoutScreen';

const Stack = createStackNavigator();

/**
 * Program navigation stack
 */
const ProgramStack = () => {
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
        name="ProgramsList"
        component={ProgramsScreen}
        options={{ title: 'Programs' }}
      />
      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={{ title: 'Program Details' }}
      />
      <Stack.Screen
        name="MyPrograms"
        component={MyProgramsScreen}
        options={{ title: 'My Programs' }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          title: 'Lesson',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
};

export default ProgramStack;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import DailyContentScreen from '../screens/Main/DailyContentScreen';
import ContentCalendarScreen from '../screens/Main/ContentCalendarScreen';
import ContentDetailScreen from '../screens/Main/ContentDetailScreen';

const Stack = createNativeStackNavigator();

/**
 * Daily Content stack navigator
 */
const DailyContentStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="DailyContent"
        component={DailyContentScreen}
        options={{
          title: 'Daily Content',
        }}
      />
      <Stack.Screen
        name="ContentCalendar"
        component={ContentCalendarScreen}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="ContentDetail"
        component={ContentDetailScreen}
        options={{
          title: 'Content Detail',
        }}
      />
    </Stack.Navigator>
  );
};

export default DailyContentStack;

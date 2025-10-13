import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';

// Challenge Screens
import ChallengesScreen from '../screens/Challenges/ChallengesScreen';
import ChallengeDetailScreen from '../screens/Challenges/ChallengeDetailScreen';
import AchievementsScreen from '../screens/Achievements/AchievementsScreen';

const Stack = createStackNavigator();

/**
 * Challenge navigation stack
 */
const ChallengeStack = () => {
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
        name="ChallengesList"
        component={ChallengesScreen}
        options={{ title: 'Challenges' }}
      />
      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={{ title: 'Challenge Details' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
    </Stack.Navigator>
  );
};

export default ChallengeStack;

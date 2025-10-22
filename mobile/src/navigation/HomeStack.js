import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardHomeScreen from '../screens/Main/DashboardHomeScreen';
import FeedScreen from '../screens/Main/FeedScreen';
import PostDetailScreen from '../screens/Posts/PostDetailScreen';
import CreatePostScreen from '../screens/Posts/CreatePostScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import CommunityGuidelinesScreen from '../screens/Other/CommunityGuidelinesScreen';
import FreeContentScreen from '../screens/Other/FreeContentScreen';
import PersonalGoalsScreen from '../screens/Goals/PersonalGoalsScreen';
import ProgramsScreen from '../screens/Programs/ProgramsScreen';
import DailyContentScreen from '../screens/Main/DailyContentScreen';
import PlantedMindScreen from '../screens/Main/PlantedMindScreen';

// Settings Screens
import SettingsScreen from '../screens/Other/SettingsScreen';
import ChangePasswordScreen from '../screens/Other/ChangePasswordScreen';
import PrivacySettingsScreen from '../screens/Other/PrivacySettingsScreen';
import HelpCenterScreen from '../screens/Other/HelpCenterScreen';

// Legal Screens
import TermsOfServiceScreen from '../screens/Legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';

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
        options={({ navigation }) => ({
          title: 'Intentional Movement',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
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
      <Stack.Screen
        name="PersonalGoals"
        component={PersonalGoalsScreen}
        options={{
          title: 'Personal Goals',
        }}
      />
      <Stack.Screen
        name="Programs"
        component={ProgramsScreen}
        options={{
          title: 'Programs',
        }}
      />
      <Stack.Screen
        name="DailyContent"
        component={DailyContentScreen}
        options={{
          title: 'Daily Content',
        }}
      />
      <Stack.Screen
        name="PlantedMind"
        component={PlantedMindScreen}
        options={{
          title: 'Planted Mind, Moving Body',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
        }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{
          title: 'Privacy Settings',
        }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{
          title: 'Help Center',
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          title: 'Terms of Service',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Privacy Policy',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;

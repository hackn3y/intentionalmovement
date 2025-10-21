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

// Settings Screens
import ChangePasswordScreen from '../screens/Other/ChangePasswordScreen';
import PrivacySettingsScreen from '../screens/Other/PrivacySettingsScreen';
import HelpCenterScreen from '../screens/Other/HelpCenterScreen';

// Membership Screens
import SubscriptionScreen from '../screens/Subscription/SubscriptionScreen';
import PricingScreen from '../screens/Subscription/PricingScreen';

// Program Screens
import MyProgramsScreen from '../screens/Programs/MyProgramsScreen';
import ProgramDetailScreen from '../screens/Programs/ProgramDetailScreen';

// Achievement Screens
import AchievementsScreen from '../screens/Achievements/AchievementsScreen';

// Legal Screens
import TermsOfServiceScreen from '../screens/Legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Legal/PrivacyPolicyScreen';

// Other Screens
import CommunityGuidelinesScreen from '../screens/Other/CommunityGuidelinesScreen';
import FreeContentScreen from '../screens/Other/FreeContentScreen';

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
        headerBackTitleVisible: false,
        headerShown: true,
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
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'My Membership' }}
      />
      <Stack.Screen
        name="Pricing"
        component={PricingScreen}
        options={{ title: 'Choose Your Plan' }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy Settings' }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: 'Help Center' }}
      />
      <Stack.Screen
        name="MyPrograms"
        component={MyProgramsScreen}
        options={{ title: 'My Programs' }}
      />
      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={{ title: 'Program Details' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'My Achievements' }}
      />
      <Stack.Screen
        name="CommunityGuidelines"
        component={CommunityGuidelinesScreen}
        options={{ title: 'Community Guidelines' }}
      />
      <Stack.Screen
        name="FreeContent"
        component={FreeContentScreen}
        options={{ title: 'Free Content' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;

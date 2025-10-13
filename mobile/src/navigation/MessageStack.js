import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

// Message Screens
import ConversationsScreen from '../screens/Messages/ConversationsScreen';
import ChatScreen from '../screens/Messages/ChatScreen';
import NewMessageScreen from '../screens/Messages/NewMessageScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createStackNavigator();

/**
 * Message navigation stack
 */
const MessageStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.text,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="NewMessage"
        component={NewMessageScreen}
        options={{ title: 'New Message' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route, navigation }) => ({
          title: route.params?.userName || 'Chat',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Profile', {
                  userId: route.params?.userId,
                  username: route.params?.userName,
                });
              }}
              style={{ marginRight: 16 }}
            >
              <Text style={{ fontSize: 20 }}>👤</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }) => ({
          title: route.params?.username ? `@${route.params.username}` : 'Profile',
        })}
      />
    </Stack.Navigator>
  );
};

export default MessageStack;

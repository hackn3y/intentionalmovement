import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Enable dismissal of web browser on completion
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs - these should match your Firebase config
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || Constants.expoConfig?.extra?.googleWebClientId;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || Constants.expoConfig?.extra?.googleIosClientId;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || Constants.expoConfig?.extra?.googleAndroidClientId;

/**
 * Hook to configure Google Authentication
 * @returns {Object} Google auth configuration and functions
 */
export const useGoogleAuth = () => {
  // Disable Google Auth on web for now due to configuration issues
  if (Platform.OS === 'web') {
    return {
      request: null,
      response: null,
      promptAsync: async () => {},
    };
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  return {
    request,
    response,
    promptAsync,
  };
};

/**
 * Extract user info from Google auth response
 * @param {Object} response - Google auth response
 * @returns {Object|null} User info or null
 */
export const getGoogleUserInfo = async (accessToken) => {
  if (!accessToken) return null;

  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await response.json();

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
      picture: userInfo.picture,
      verifiedEmail: userInfo.verified_email,
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    return null;
  }
};

/**
 * Get Firebase ID token from Google authentication
 * Note: This is a placeholder - actual implementation requires Firebase Auth
 * For now, we'll send the Google access token to our backend
 * @param {Object} googleAuth - Google auth response
 * @returns {Object} Auth data for backend
 */
export const getFirebaseAuthData = async (googleAuth) => {
  if (!googleAuth?.accessToken) {
    throw new Error('No Google access token available');
  }

  // Get user info from Google
  const userInfo = await getGoogleUserInfo(googleAuth.accessToken);

  if (!userInfo) {
    throw new Error('Failed to get user info from Google');
  }

  // Return auth data for our backend
  return {
    idToken: googleAuth.accessToken, // In production, this should be Firebase ID token
    provider: 'google',
    email: userInfo.email,
    displayName: userInfo.name,
    profileImage: userInfo.picture,
    userInfo,
  };
};

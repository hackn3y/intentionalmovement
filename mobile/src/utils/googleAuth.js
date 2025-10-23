import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Enable dismissal of web browser on completion
// Suppress COOP warnings in console (they're harmless and expected)
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('Cross-Origin-Opener-Policy') ||
        args[0]?.includes?.('window.close') ||
        args[0]?.includes?.('window.closed')) {
      return; // Suppress COOP warnings
    }
    originalWarn(...args);
  };
}
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs - these should match your Firebase config
// Fallback to production values for web builds
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || Constants.expoConfig?.extra?.googleWebClientId || '528044070931-06pbpg4gj40daopug4b7plumibn3g353.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || Constants.expoConfig?.extra?.googleIosClientId;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || Constants.expoConfig?.extra?.googleAndroidClientId;

/**
 * Hook to configure Google Authentication
 * @returns {Object} Google auth configuration and functions
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'], // Include 'openid' to ensure idToken is returned
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
 * @param {Object} googleAuth - Google auth response from expo-auth-session
 * @param {string} googleAuth.accessToken - Google access token
 * @param {string} googleAuth.idToken - Google ID token (optional, from OpenID Connect)
 * @returns {Object} Auth data for backend
 */
export const getFirebaseAuthData = async (googleAuth) => {
  if (!googleAuth?.accessToken && !googleAuth?.idToken) {
    throw new Error('No Google access token or ID token available');
  }

  try {
    // Get user info from Google
    const userInfo = await getGoogleUserInfo(googleAuth.accessToken);

    if (!userInfo) {
      throw new Error('Failed to get user info from Google');
    }

    // Log for debugging
    console.log('[googleAuth] Google auth data:', {
      hasAccessToken: !!googleAuth.accessToken,
      hasIdToken: !!googleAuth.idToken,
      email: userInfo.email,
    });

    // Sign in to Firebase with Google credential
    // Use the Google ID token from expo-auth-session if available,
    // otherwise use the access token
    const credential = GoogleAuthProvider.credential(
      googleAuth.idToken, // Google ID token
      googleAuth.accessToken // Google access token
    );

    console.log('[googleAuth] Signing in to Firebase...');
    const userCredential = await signInWithCredential(auth, credential);

    // Get Firebase ID token
    const firebaseIdToken = await userCredential.user.getIdToken();
    console.log('[googleAuth] Firebase ID token obtained:', !!firebaseIdToken);

    // Return auth data for our backend with Firebase ID token
    return {
      provider: 'google',
      email: userInfo.email,
      displayName: userInfo.name,
      profileImage: userInfo.picture,
      userInfo,
      idToken: firebaseIdToken, // Firebase ID token for backend to verify and extract firebaseUid
    };
  } catch (error) {
    console.error('[googleAuth] Error getting Firebase auth data:', error);
    throw new Error(`Failed to authenticate with Firebase: ${error.message}`);
  }
};

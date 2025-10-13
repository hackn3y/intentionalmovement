import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

/**
 * Check if Apple Authentication is available
 * @returns {Promise<boolean>} True if available
 */
export const isAppleAuthAvailable = async () => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.error('Error checking Apple auth availability:', error);
    return false;
  }
};

/**
 * Sign in with Apple
 * @returns {Promise<Object>} Apple authentication response
 */
export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Extract user info
    const { identityToken, email, fullName, user } = credential;

    if (!identityToken) {
      throw new Error('No identity token received from Apple');
    }

    return {
      identityToken, // This is the JWT token from Apple
      email: email || null,
      fullName: fullName ? {
        givenName: fullName.givenName,
        familyName: fullName.familyName,
        displayName: `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim(),
      } : null,
      user, // Apple user ID
    };
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Apple sign-in was canceled');
    }
    console.error('Apple sign-in error:', error);
    throw error;
  }
};

/**
 * Get Firebase auth data from Apple authentication
 * @param {Object} appleAuth - Apple authentication response
 * @returns {Object} Auth data for backend
 */
export const getFirebaseAuthDataFromApple = (appleAuth) => {
  const { identityToken, email, fullName, user } = appleAuth;

  return {
    idToken: identityToken,
    provider: 'apple',
    email: email || undefined,
    displayName: fullName?.displayName || 'Apple User',
    appleUserId: user,
    userInfo: {
      email,
      ...fullName,
    },
  };
};

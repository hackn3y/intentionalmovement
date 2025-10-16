/**
 * Suppress known development warnings that we can't fix
 * These warnings come from third-party libraries (React Navigation, Expo)
 * and are safe to ignore in our development environment
 */

const SUPPRESSED_WARNINGS = [
  // React Native Web deprecation warnings from React Navigation
  'shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
  'Image: style.resizeMode is deprecated',
  'Image: style.tintColor is deprecated',

  // Expo notifications web warning (expected behavior)
  'expo-notifications] Listening to push token changes is not yet fully supported on web',

  // React Native Web animation warning (expected fallback)
  'Animated: `useNativeDriver` is not supported',
];

const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && SUPPRESSED_WARNINGS.some(warning => message.includes(warning))) {
    return;
  }
  originalError(...args);
};

export default {
  suppress: () => {
    // Already applied above
  },
  restore: () => {
    console.warn = originalWarn;
    console.error = originalError;
  },
};

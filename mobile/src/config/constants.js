// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key';

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// App Constants
export const POSTS_PER_PAGE = 10;
export const MESSAGES_PER_PAGE = 20;
export const PROGRAMS_PER_PAGE = 10;

// Colors - White, Pink & Emerald theme
export const COLORS = {
  primary: '#ec4899',       // Hot pink - primary brand color
  primaryLight: '#f472b6',  // Lighter pink for hover states
  primaryDark: '#db2777',   // Darker pink for pressed states
  accent: '#10b981',        // Emerald green - accent color
  accentLight: '#34d399',   // Lighter emerald
  accentDark: '#059669',    // Darker emerald
  secondary: '#fbbf24',     // Golden yellow - secondary accent
  success: '#10b981',       // Green for success states
  danger: '#ef4444',        // Red for danger/delete
  warning: '#f59e0b',       // Orange for warnings
  info: '#ec4899',          // Pink for info
  light: '#fdf2f8',         // Light pink background
  dark: '#111827',          // Dark text
  white: '#ffffff',
  black: '#000000',
  // Theme-aware properties
  background: '#ffffff',    // Main background (white)
  card: '#ffffff',          // Card/surface background (white)
  text: '#111827',          // Primary text color
  border: '#fbcfe8',        // Border color (light pink)
  isDark: false,            // Light mode indicator
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// Dark mode colors
export const DARK_COLORS = {
  primary: '#ec4899',       // Hot pink - same as light mode
  primaryLight: '#f472b6',
  primaryDark: '#db2777',
  accent: '#10b981',        // Emerald green - same as light mode
  accentLight: '#34d399',
  accentDark: '#059669',
  secondary: '#fbbf24',
  success: '#34d399',
  danger: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  light: '#1f2937',        // Dark background
  dark: '#f9fafb',         // Light text in dark mode
  white: '#111827',        // Dark surface
  black: '#ffffff',        // Light text
  // Theme-aware properties
  background: '#0f172a',   // Main background (darker blue-gray)
  card: '#1e293b',         // Card/surface background (lighter than bg)
  text: '#f1f5f9',         // Primary text color (light)
  border: '#334155',       // Border color
  isDark: true,            // Dark mode indicator
  gray: {
    50: '#111827',
    100: '#1f2937',
    200: '#374151',
    300: '#4b5563',
    400: '#6b7280',
    500: '#9ca3af',
    600: '#d1d5db',
    700: '#e5e7eb',
    800: '#f3f4f6',
    900: '#f9fafb',
  }
};

// Sizes
export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
// PWA rebuild triggered at Wed, Oct 15, 2025 11:08:48 AM

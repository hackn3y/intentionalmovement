import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
// Using EXPO_PUBLIC_ prefix to make these available in web builds
// Fallback to production values for web builds where env vars may not be available
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDByO4848KZFWFq0SeH1iMPQu5u8ZJZHZg',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'intentional-movement-corp.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'intentional-movement-corp',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'intentional-movement-corp.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '528044070931',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:528044070931:web:dafa368852b5549c6947e6',
};

// Log config for debugging (will show if variables are loaded)
console.log('[Firebase Config]', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...', // Log first 10 chars for debugging
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;

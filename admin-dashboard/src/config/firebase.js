import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0TZAIuYoiTG8Q1VzK5wKb6C12K67DClo",
  authDomain: "intentional-movement-corp.firebaseapp.com",
  projectId: "intentional-movement-corp",
  storageBucket: "intentional-movement-corp.firebasestorage.app",
  messagingSenderId: "528044070931",
  appId: "1:528044070931:web:dafa368852b5549c6947e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB_IpxucBsZt3F6yFwk4f0kKtc3xedIPr4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hogaa-ad578.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hogaa-ad578',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hogaa-ad578.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '775335859712',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:775335859712:web:5e67bc2455e83488f06ae5'
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

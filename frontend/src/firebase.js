import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCbuktirWQ1UG7_5xyzJZZXB_KcpR77uBg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hogaa-ddde2.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hogaa-ddde2',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hogaa-ddde2.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '437610256103',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:437610256103:web:63da67b09913facce5f442'
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

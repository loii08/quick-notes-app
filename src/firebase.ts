import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

/**
 * Validates Firebase configuration
 * @throws Error if critical Firebase keys are missing
 */
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

  if (missingKeys.length > 0) {
    console.error(
      `Missing required Firebase configuration keys: ${missingKeys.join(', ')}. ` +
      'Please set these in your .env.local file.'
    );
  }
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Validate configuration on module load
validateFirebaseConfig();

let app;
let db;
let auth;
let googleProvider;
let analytics;

try {
  app = initializeApp(firebaseConfig);

  // Use modern API for Firestore with offline persistence
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({})
  });

  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  // Conditionally initialize Analytics to reduce offline noise.
  // It will still be active for all online sessions.
  analytics = typeof window !== 'undefined' && navigator.onLine 
    ? getAnalytics(app) 
    : null;
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { db, auth, googleProvider, analytics };

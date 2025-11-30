import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);

// Use modern API for Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Conditionally initialize Analytics to reduce offline noise.
// It will still be active for all online sessions.
const analytics = typeof window !== 'undefined' && navigator.onLine 
  ? getAnalytics(app) 
  : null;

export { db, auth, googleProvider, analytics };

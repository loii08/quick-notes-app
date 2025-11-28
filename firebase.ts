
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Safely access environment variables
// If import.meta.env is undefined, fallback to an empty object to prevent crashes.
const meta = import.meta as any;
const env = meta && meta.env ? meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
  measurementId: env.VITE_MEASUREMENT_ID
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  // Only attempt initialization if we have at least an API key
  if (firebaseConfig.apiKey) {
      // Prevent multiple initializations in dev hot-reload
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      // Try to initialize services. 
      // If the environment doesn't support the ESM build correctly, 
      // getAuth might throw.
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      
      console.log("Firebase initialized successfully");
  } else {
      console.warn("Firebase configuration not found. App running in Local Mode.");
  }
} catch (error) {
  console.warn("Firebase initialization failed. The app will run in Local Mode.", error);
  // We leave auth/db/provider as null. App.tsx must handle this.
}

export { auth, db, googleProvider };

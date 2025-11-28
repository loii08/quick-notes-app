
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || "",
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_APP_ID || "",
  measurementId: import.meta.env.VITE_MEASUREMENT_ID || ""
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  // We check if apiKey is present and not the default empty string
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      
      console.log("Firebase initialized successfully");
  } else {
      console.warn("Firebase configuration missing. Set keys in .env or firebase.ts.");
  }
} catch (error) {
  console.warn("Firebase initialization failed.", error);
}

export { auth, db, googleProvider };

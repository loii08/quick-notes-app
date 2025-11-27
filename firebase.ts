
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 1. Paste your Firebase Configuration here
const firebaseConfig = {
  apiKey: "AIzaSyCIHtWEFVZWe325j9P_YTfnVJcyFMBGn64",
  authDomain: "quick-note-app-c2282.firebaseapp.com",
  projectId: "quick-note-app-c2282",
  storageBucket: "quick-note-app-c2282.firebasestorage.app",
  messagingSenderId: "869038299798",
  appId: "1:869038299798:web:be3609407d7401f1ce00b7",
  measurementId: "G-MXWXHHM94T"
};

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  // Prevent multiple initializations in dev hot-reload
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Try to initialize services. 
  // If the environment (like specific online editors) doesn't support the ESM build correctly, 
  // getAuth might throw "Component auth has not been registered yet".
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed. The app will run in Local Mode.", error);
  // We leave auth/db/provider as null. App.tsx must handle this.
}

export { auth, db, googleProvider };

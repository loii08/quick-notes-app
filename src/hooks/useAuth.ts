import { useState, useEffect, useRef } from 'react';
import { auth, browserLocalPersistence, signOut, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { useAuthStatus } from '@features/auth/useAuthStatus';
import { getRememberMe, getRememberedEmail, saveRememberMe } from '@shared/utils/storageUtils';
import { getAuthErrorMessage, getSuccessMessage } from '@shared/utils/errorMessages';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [appLoadingMessage, setAppLoadingMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('qn_last_sync');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
  });

  const [rememberMe, setRememberMe] = useState(() => getRememberMe());
  const [authEmail, setAuthEmail] = useState(() => getRememberedEmail());
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authLoadingSource, setAuthLoadingSource] = useState<'google' | 'email' | null>(null);

  const loadingStartTime = useRef<number | null>(null);
  const prevIsOnline = useRef(true);
  const lastSignInTime = useRef<number>(0);
  const creationTime = useRef<number>(0);

  const { isOnline } = useAuthStatus();

  // Update online status with reliable check
  useEffect(() => {
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;

    if (lastSignInTime.current > fiveSecondsAgo) {
      const isNewUser = (lastSignInTime.current - creationTime.current) < 5000;
      const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

      if (isNewUser) {
        // showToast will be passed as prop
      }
    }

    if (isOnline !== prevIsOnline.current) {
      if (!isOnline) {
        // showToast will be passed as prop
      } else {
        if (lastSignInTime.current && (now - lastSignInTime.current) > 5000) {
          // showToast will be passed as prop
        }
      }
    }

    prevIsOnline.current = isOnline;
  }, [isOnline, user?.displayName, user?.email]);

  const handleSignOut = async () => {
    setAuthLoading(true);
    setAuthLoadingSource('signout');
    loadingStartTime.current = Date.now();
    try {
      await signOut(auth);
      // showToast will be passed as prop
      setUser(null);
      setUserRole('user');
    } catch (error: any) {
      // showToast will be passed as prop
    } finally {
      setAuthLoading(false);
      setAuthLoadingSource(null);
      loadingStartTime.current = null;
    }
  };

  return {
    user,
    setUser,
    userRole,
    setUserRole,
    isFirebaseReady,
    setIsFirebaseReady,
    syncStatus,
    setSyncStatus,
    isInitialDataLoading,
    setIsInitialDataLoading,
    appLoadingMessage,
    setAppLoadingMessage,
    lastSyncTime,
    setLastSyncTime,
    rememberMe,
    setRememberMe,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    isSignUp,
    setIsSignUp,
    authLoading,
    setAuthLoading,
    authLoadingSource,
    setAuthLoadingSource,
    loadingStartTime,
    prevIsOnline,
    isOnline,
    lastSignInTime,
    creationTime,
    handleSignOut
  };
};

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export const useAuthStatus = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState('user');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If there's no user, we know the role is 'user' and we're done loading.
        setUserRole('user');
        setAuthLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeRole = onSnapshot(userDocRef, (doc) => {
        setUserRole(doc.exists() && doc.data().role === 'admin' ? 'admin' : 'user');
        setAuthLoading(false); // Role is fetched, we're done loading.
      });
      return () => unsubscribeRole();
    }
    // If user is null, onAuthStateChanged handles setting loading to false.
  }, [user]);

  return { user, userRole, authLoading };
};
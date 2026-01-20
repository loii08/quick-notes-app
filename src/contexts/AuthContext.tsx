import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'user' | 'admin';
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: 'user' | 'admin') => void;
  setAuthLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged((currentUser) => {
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

  return (
    <AuthContext.Provider value={{ user, userRole, authLoading, setUser, setUserRole, setAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

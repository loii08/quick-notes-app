
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, Category, QuickAction, FilterMode, ToastMessage, ToastType } from './types';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import NoteCard from './components/NoteCard';
import ToastContainer from './components/ToastContainer';
import OnboardingModal from './components/OnboardingModal';
import SkeletonLoader from './components/SkeletonLoader';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';

import { auth, db, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';

const generateId = () => Math.random().toString(36).substr(2, 9);
const getCategoryColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

const getUserInitials = (user: User | null): string => {
  if (!user) return '?';
  if (user.displayName) {
    const nameParts = user.displayName.split(' ').filter(Boolean);
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  }
  if (user.email) return user.email[0].toUpperCase();
  return '?';
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'general', name: 'General' },
  { id: 'work', name: 'Work' },
  { id: 'ideas', name: 'Ideas' },
];

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', text: 'Meeting notes', categoryId: 'work' },
  { id: 'qa2', text: 'Grocery list', categoryId: 'general' },
];

const THEMES = {
  default: {
    primary: '#000000',
    primaryDark: '#333333',
    bgPage: '#F5F5F5',
    darkPrimary: '#FFFFFF',
    darkPrimaryDark: '#E5E5E5',
    textOnPrimary: '#FFFFFF',
    darkTextOnPrimary: '#000000'
  },
  pink: {
    primary: '#FFC0CB',
    primaryDark: '#FFB6C1',
    bgPage: '#F7F7F7',
    darkPrimary: '#ec4899',
    darkPrimaryDark: '#db2777',
    textOnPrimary: '#3A3A3A',
    darkTextOnPrimary: '#FFFFFF'
  },
  blue: {
    primary: '#BAE6FD', // Sky 200
    primaryDark: '#7DD3FC', // Sky 300
    bgPage: '#F0F9FF', // Sky 50
    darkPrimary: '#38bdf8',
    darkPrimaryDark: '#0ea5e9',
    textOnPrimary: '#1e293b',
    darkTextOnPrimary: '#FFFFFF'
  },
  green: {
    primary: '#4ade80',
    primaryDark: '#22c55e',
    bgPage: '#F0FDF4', // Green 50
    darkPrimary: '#4ade80',
    darkPrimaryDark: '#22c55e',
    textOnPrimary: '#052e16',
    darkTextOnPrimary: '#FFFFFF'
  },
  purple: {
    primary: '#E9D5FF', // Purple 200
    primaryDark: '#D8B4FE', // Purple 300
    bgPage: '#FAF5FF', // Purple 50
    darkPrimary: '#a855f7',
    darkPrimaryDark: '#9333ea',
    textOnPrimary: '#4c1d95',
    darkTextOnPrimary: '#FFFFFF'
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qn_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to load notes', e); return []; }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    try {
      const saved = localStorage.getItem('qn_cats');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) { return DEFAULT_CATEGORIES; }
  });

  const [quickActions, setQuickActions] = useState<QuickAction[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_QUICK_ACTIONS;
    try {
      const saved = localStorage.getItem('qn_qa');
      return saved ? JSON.parse(saved) : DEFAULT_QUICK_ACTIONS;
    } catch (e) { return DEFAULT_QUICK_ACTIONS; }
  });

  const [appName, setAppName] = useState(() => localStorage.getItem('app_name') || "Quick Notes");
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('app_subtitle') || "Capture ideas instantly");
  const [appTheme, setAppTheme] = useState<'default' | 'pink' | 'blue' | 'green' | 'purple'>(() => (localStorage.getItem('app_theme') as any) || 'default');
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showQAManager, setShowQAManager] = useState(false);
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  const [confirmDeleteQAId, setConfirmDeleteQAId] = useState<string | null>(null);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  
  const [editingQAId, setEditingQAId] = useState<string | null>(null);
  const [editQAText, setEditQAText] = useState('');
  const [editQACat, setEditQACat] = useState('general');

  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    const newToast: ToastMessage = { id: generateId(), message, type, isClosing: false };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === newToast.id ? { ...t, isClosing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 300);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isClosing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }

  useEffect(() => {
    if (!auth) {
      console.warn("Auth service not available (Local Mode)");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsFirebaseReady(true);
      
      if (!currentUser) {
        setIsInitialDataLoading(false);
      }

      if (currentUser) {
        const lastSignInTime = new Date(currentUser.metadata.lastSignInTime || 0).getTime();
        const creationTime = new Date(currentUser.metadata.creationTime || 0).getTime();
        const fiveSecondsAgo = Date.now() - 5000;

        if (lastSignInTime > fiveSecondsAgo) {
          const isNewUser = (lastSignInTime - creationTime) < 5000;
          const name = currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User';

          if (isNewUser) {
            setShowOnboarding(true);
          } else {
            showToast(`Welcome back, ${name}!`);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return; 

    const notesRef = collection(db, `users/${user.uid}/notes`);
    const notesUnsub = onSnapshot(notesRef, (snapshot) => {
      const cloudNotes = snapshot.docs.map(doc => doc.data() as Note);
      setNotes(cloudNotes);
      setIsInitialDataLoading(false);
    });

    const catsRef = collection(db, `users/${user.uid}/categories`);
    const catsUnsub = onSnapshot(catsRef, (snapshot) => {
      const cloudCats = snapshot.docs.map(doc => doc.data() as Category);
      if (cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    const qaRef = collection(db, `users/${user.uid}/quickActions`);
    const qaUnsub = onSnapshot(qaRef, (snapshot) => {
      const cloudQA = snapshot.docs.map(doc => doc.data() as QuickAction);
      setQuickActions(cloudQA);
    });

    const settingsRef = doc(db, `users/${user.uid}/settings/general`);
    const settingsUnsub = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.appName) setAppName(data.appName);
            if (data.appSubtitle) setAppSubtitle(data.appSubtitle);
            if (data.appTheme) setAppTheme(data.appTheme);
            if (typeof data.darkMode === 'boolean') setDarkMode(data.darkMode);
        }
    });

    return () => {
      notesUnsub();
      catsUnsub();
      qaUnsub();
      settingsUnsub();
    };
  }, [user]);

  useEffect(() => localStorage.setItem('app_name', appName), [appName]);
  useEffect(() => localStorage.setItem('app_subtitle', appSubtitle), [appSubtitle]);
  useEffect(() => localStorage.setItem('app_theme', appTheme), [appTheme]);

  useEffect(() => {
    const currentThemeKey = user ? appTheme : 'green';
    const themeConfig = THEMES[currentThemeKey] || THEMES.default;
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
      root.style.setProperty('--color-primary', themeConfig.darkPrimary || THEMES.default.darkPrimary);
      root.style.setProperty('--color-primary-dark', themeConfig.darkPrimaryDark || THEMES.default.darkPrimaryDark);
      root.style.setProperty('--color-text-on-primary', themeConfig.darkTextOnPrimary || THEMES.default.darkTextOnPrimary);
      root.style.setProperty('--color-bg-page', '#1f2937');
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
      root.style.setProperty('--color-primary', themeConfig.primary || THEMES.default.primary);
      root.style.setProperty('--color-primary-dark', themeConfig.primaryDark || THEMES.default.primaryDark);
      root.style.setProperty('--color-text-on-primary', themeConfig.textOnPrimary || THEMES.default.textOnPrimary);
      root.style.setProperty('--color-bg-page', themeConfig.bgPage || THEMES.default.bgPage);
    }
  }, [darkMode, appTheme, user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      showToast("Firebase keys missing. Check configuration.", "error");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Login failed", error);
      showToast("Google login failed.", "error");
    }
  };

  const handleEmailAuth = async () => {
    if (!auth) {
        showToast("Firebase keys missing. Check configuration.", "error");
        return;
    }
    if (!authEmail || !authPassword) {
        showToast("Please enter email and password", "error");
        return;
    }
    
    setAuthLoading(true);
    try {
        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            if (authName) {
                await updateProfile(userCredential.user, {
                    displayName: authName
                });
                setUser({ ...userCredential.user, displayName: authName });
            }
            showToast("Account created successfully!");
        } else {
            await signInWithEmailAndPassword(auth, authEmail, authPassword);
        }
        setShowLoginModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
    } catch (error: any) {
        console.error("Auth error", error);
        let msg = "Authentication failed";
        if (error.code === 'auth/email-already-in-use') msg = "Email already in use";
        if (error.code === 'auth/wrong-password') msg = "Incorrect password";
        if (error.code === 'auth/user-not-found') msg = "User not found";
        if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
        if (error.code === 'auth/invalid-api-key') msg = "Invalid API Key";
        showToast(msg, "error");
    } finally {
        setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) {
        showToast("Firebase keys missing", "error");
        return;
    }
    if (!authEmail) {
      showToast("Please enter your email first", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, authEmail);
      showToast("Password reset email sent!");
    } catch (error) {
      showToast("Failed to send reset email", "error");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      window.location.reload(); 
    } catch (error) {
      showToast("Logout failed", "error");
    }
  };

  const handleSaveSettings = async () => {
    const finalAppName = appName.trim() || "Quick Notes";
    const finalAppSubtitle = appSubtitle.trim() || "Capture ideas instantly";

    setAppName(finalAppName);
    setAppSubtitle(finalAppSubtitle);

    if (user && db) {
        setSyncStatus('syncing');
        try {
            await setDoc(doc(db, `users/${user.uid}/settings/general`), {
                appName: finalAppName,
                appSubtitle: finalAppSubtitle,
                appTheme,
                darkMode
            }, { merge: true });
            setSyncStatus('idle');
        } catch (e) {
            setSyncStatus('error');
        }
    }
    setShowSettings(false);
    showToast('Settings saved');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (user && db) {
        setDoc(doc(db, `users/${user.uid}/settings/general`), { darkMode: newMode }, { merge: true })
            .catch(() => console.error("Failed to sync theme preference"));
    }
  };

  const handleAddNote = async (content: string) => {
    if (!content.trim()) {
      showToast('Please enter some text', 'error');
      return;
    }
    
    const categoryId = currentCategory === 'all' ? 'general' : currentCategory;
    
    const newNote: Note = {
      id: generateId(),
      content,
      categoryId,
      timestamp: Date.now(),
    };

    if (user && db) {
      setSyncStatus('syncing');
      try {
        await setDoc(doc(db, `users/${user.uid}/notes`, newNote.id), newNote);
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to save to cloud', 'error');
        setSyncStatus('error');
      }
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    showToast('Note added');
    
    setInputValue('');
    if (showMobileAdd) setShowMobileAdd(false);
  };

  const handleUpdateNote = async (id: string, content: string, categoryId: string, timestamp: number, silent: boolean = false) => {
    const updatedNote = { id, content, categoryId, timestamp };
    
    if (user && db) {
      if (!silent) setSyncStatus('syncing');
      try {
        await setDoc(doc(db, `users/${user.uid}/notes`, id), updatedNote, { merge: true });
        setSyncStatus('idle');
      } catch (e) {
        if (!silent) showToast('Update failed', 'error');
        setSyncStatus('error');
      }
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, content, categoryId, timestamp } : n));
    }
    if (!silent) showToast('Note updated');
  };

  const handleDeleteNote = async () => {
    if (confirmDeleteNoteId) {
      if (user && db) {
        setSyncStatus('syncing');
        try {
          await deleteDoc(doc(db, `users/${user.uid}/notes`, confirmDeleteNoteId));
          setSyncStatus('idle');
        } catch (e) {
          showToast('Delete failed', 'error');
          setSyncStatus('error');
        }
      } else {
        setNotes(prev => prev.filter(n => n.id !== confirmDeleteNoteId));
      }
      showToast('Note deleted');
      setConfirmDeleteNoteId(null);
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const newCat = { id, name };

    if (user && db) {
      setSyncStatus('syncing');
      try {
        await setDoc(doc(db, `users/${user.uid}/categories`, id), newCat);
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to add category', 'error');
        setSyncStatus('error');
      }
    } else {
      setCategories(prev => [...prev, newCat]);
    }
    showToast('Category added');
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
  };

  const saveEditCategory = async () => {
    if (editingCatId && editCatName.trim()) {
      const updatedCat = { id: editingCatId, name: editCatName };
      if (user && db) {
        setSyncStatus('syncing');
        try {
          await setDoc(doc(db, `users/${user.uid}/categories`, editingCatId), updatedCat, { merge: true });
          setSyncStatus('idle');
        } catch (e) {
          showToast('Failed to update category', 'error');
          setSyncStatus('error');
        }
      } else {
        setCategories(prev => prev.map(c => c.id === editingCatId ? { ...c, name: editCatName } : c));
      }
      showToast('Category updated');
      setEditingCatId(null);
      setEditCatName('');
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'general') return;
    setConfirmDeleteCategoryId(id);
  };

  const confirmCategoryDeletion = async () => {
    if (!confirmDeleteCategoryId) return;
    const id = confirmDeleteCategoryId;

    if (user && db) {
      setSyncStatus('syncing');
      try {
        const batch = writeBatch(db);
        const catRef = doc(db, `users/${user.uid}/categories`, id);
        batch.delete(catRef);
        notes.forEach(async n => {
          if (n.categoryId === id) {
             await setDoc(doc(db, `users/${user.uid}/notes`, n.id), { ...n, categoryId: 'general' }, { merge: true });
          }
        });

        await batch.commit();
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to delete category', 'error');
        setSyncStatus('error');
      }
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      setNotes(prev => prev.map(n => n.categoryId === id ? { ...n, categoryId: 'general' } : n));
      setQuickActions(prev => prev.map(q => q.categoryId === id ? { ...q, categoryId: 'general' } : q));
    }
    showToast('Category deleted');

    if (currentCategory === id) setCurrentCategory('all');
    setConfirmDeleteCategoryId(null);
  };

  const handleAddQA = async (text: string, categoryId: string) => {
    if (!text.trim()) return;
    const newQA = { id: generateId(), text, categoryId };
    
    if (user && db) {
      setSyncStatus('syncing');
      try {
        await setDoc(doc(db, `users/${user.uid}/quickActions`, newQA.id), newQA);
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to add action', 'error');
        setSyncStatus('error');
      }
    } else {
      setQuickActions(prev => [...prev, newQA]);
    }
    showToast('Quick action added');
  };

  const startEditQA = (qa: QuickAction) => {
    setEditingQAId(qa.id);
    setEditQAText(qa.text);
    setEditQACat(qa.categoryId);
  };

  const saveEditQA = async () => {
    if (editingQAId && editQAText.trim()) {
      const updatedQA = { id: editingQAId, text: editQAText, categoryId: editQACat };
      if (user && db) {
        setSyncStatus('syncing');
        try {
          await setDoc(doc(db, `users/${user.uid}/quickActions`, editingQAId), updatedQA, { merge: true });
          setSyncStatus('idle');
        } catch (e) {
          showToast('Failed to update action', 'error');
          setSyncStatus('error');
        }
      } else {
        setQuickActions(prev => prev.map(q => q.id === editingQAId ? { ...q, text: editQAText, categoryId: editQACat } : q));
      }
      showToast('Quick action updated');
      setEditingQAId(null);
      setEditQAText('');
      setEditQACat('general');
    }
  };

  const handleDeleteQA = (id: string) => {
    setConfirmDeleteQAId(id);
  };

  const confirmQADeletion = async () => {
    if (!confirmDeleteQAId) return;
    if (user && db) {
      setSyncStatus('syncing');
      try {
        await deleteDoc(doc(db, `users/${user.uid}/quickActions`, confirmDeleteQAId));
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to delete action', 'error');
        setSyncStatus('error');
      }
    } else {
      setQuickActions(prev => prev.filter(q => q.id !== confirmDeleteQAId));
    }
    showToast('Quick action deleted');
    setConfirmDeleteQAId(null);
  };

  const handleExportData = () => {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      notes,
      categories,
      quickActions
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.notes) && Array.isArray(json.categories)) {
          if (confirm('This will overwrite your current data. Are you sure you want to proceed?')) {
            setNotes(json.notes);
            setCategories(json.categories);
            if (json.quickActions) setQuickActions(json.quickActions);
            showToast('Data imported successfully');
            setShowSettings(false);
          }
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (currentCategory !== 'all' && note.categoryId !== currentCategory) return false;
      const noteDate = new Date(note.timestamp);
      const today = new Date();
      const cleanDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const noteTime = cleanDate(noteDate);
      const todayTime = cleanDate(today);

      switch (filterMode) {
        case 'today': return noteTime === todayTime;
        case 'yesterday': return noteTime === todayTime - 86400000;
        case 'week':
          const day = today.getDay();
          const start = new Date(today);
          start.setDate(today.getDate() - day);
          start.setHours(0,0,0,0);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23,59,59,999);
          return note.timestamp >= start.getTime() && note.timestamp <= end.getTime();
        case 'month': return noteDate.getMonth() === today.getMonth() && noteDate.getFullYear() === today.getFullYear();
        case 'year': return noteDate.getFullYear() === today.getFullYear();
        case 'custom': return customDate ? cleanDate(noteDate) === cleanDate(new Date(customDate)) : true;
        default: return true;
      }
    });
  }, [notes, currentCategory, filterMode, customDate]);

  const formatHeaderDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const activeCategoryName = currentCategory === 'all' 
    ? (categories.find(c => c.id === 'general')?.name || 'General')
    : categories.find(c => c.id === currentCategory)?.name;

  const renderNotes = () => {
    const groups: { [key: string]: Note[] } = {};
    
    filteredNotes.forEach(note => {
      const d = new Date(note.timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(note);
    });

    const sortedDateKeys = Object.keys(groups).sort().reverse();

    if (sortedDateKeys.length === 0) {
      return (
        <div className="text-center py-20 bg-surface dark:bg-gray-800 rounded-3xl border border-borderLight dark:border-gray-700 shadow-sm">
          <p className="text-textMain dark:text-gray-400 text-lg font-medium opacity-60">No notes found for this filter ✨</p>
        </div>
      );
    }

    return sortedDateKeys.map((dateKey, groupIdx) => {
      const notesInGroup = groups[dateKey].sort((a, b) => b.timestamp - a.timestamp);
      const groupDateTimestamp = notesInGroup[0].timestamp;

      return (
        <div key={dateKey} className="mb-8 bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border border-borderLight dark:border-gray-700 overflow-hidden animate-slide-up" style={{ animationDelay: `${groupIdx * 50}ms` }}>
          <div className="bg-bgPage dark:bg-gray-900/50 px-5 py-4 border-b border-borderLight dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-textMain dark:text-gray-100 text-lg tracking-tight">
              {formatHeaderDate(groupDateTimestamp)}
            </h3>
            <span className="bg-primary/20 dark:bg-indigo-900/50 text-textMain dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              {notesInGroup.length} {notesInGroup.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
          <div className="divide-y divide-borderLight dark:divide-gray-700">
            {notesInGroup.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                categories={categories}
                categoryColor={getCategoryColor(note.categoryId)}
                onUpdate={handleUpdateNote}
                onDelete={(id) => setConfirmDeleteNoteId(id)}
                isActive={activeNoteId === note.id}
                onActivate={() => setActiveNoteId(note.id)}
                onDeactivate={() => setActiveNoteId(null)}
              />
            ))}
          </div>
        </div>
      )
    });
  };

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-bgPage dark:bg-gray-900">
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-textMain dark:text-gray-100 bg-bgPage transition-colors duration-300">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled && user ? 'bg-primary dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-primary dark:bg-gray-900 py-6'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icon.ico" alt="App Icon" className={`rounded-full transition-all duration-300 ${isScrolled && user ? 'w-8 h-8' : 'w-10 h-10'}`} />
            <div className="flex flex-col text-textOnPrimary dark:text-white">
              <h1 className={`font-extrabold tracking-tight transition-all duration-300 ${isScrolled && user ? 'text-xl' : 'text-3xl'}`}>{user ? appName : 'Quick Notes'}</h1>
              <div className={`flex items-center gap-2 transition-all duration-300 ${isScrolled && user ? 'h-0 opacity-0' : 'h-auto opacity-70'}`}>
                <span className="text-textOnPrimary dark:text-gray-400 font-light text-sm">{user ? appSubtitle : 'Capture ideas instantly'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              {user ? (
                <>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-textOnPrimary dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50 font-bold text-sm" style={{ backgroundColor: getCategoryColor(user.uid) }}>
                        {getUserInitials(user) === '?' ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg> : getUserInitials(user)}
                      </div>
                    )}
                  </button>
                  {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface dark:bg-gray-800 rounded-xl shadow-xl py-2 animate-fade-in origin-top-right overflow-hidden z-[60] border border-borderLight dark:border-gray-700">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="font-semibold text-textMain dark:text-white truncate">{user.displayName || 'User'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                      </div>
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {!isOnline ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span>Offline</span>
                          </>
                        ) : syncStatus === 'syncing' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                            <span>Syncing...</span>
                          </>
                        ) : syncStatus === 'error' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>Sync Error</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>Synced</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>Local Mode</span>
                    </div>
                  )}
                  <button onClick={toggleDarkMode} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-textMain dark:text-gray-200 flex items-center gap-2">
                    {darkMode ? (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        Dark Mode
                      </>
                    )}
                  </button>
                  {user && (
                    <>
                      <button onClick={() => { setShowSettings(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-textMain dark:text-gray-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </button>
                      <button onClick={() => { setShowOnboarding(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-textMain dark:text-gray-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Show Demo
                      </button>
                    </>
                  )}
                  <div className="border-t border-borderLight dark:border-gray-700 my-1"></div>
                  {user ? (
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  ) : (
                    <button onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-primary/20 dark:hover:bg-indigo-900/20 text-textMain dark:text-indigo-400 font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-primaryDark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign In / Sign Up
                    </button>
                  )}
                  </div>
                  )}
                </>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="px-5 py-2 bg-white/25 hover:bg-white/40 text-textOnPrimary rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {user ? (
        <main className="container mx-auto px-4 pt-32 max-w-3xl flex-1">
          {isInitialDataLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              <div className={`z-30 flex items-center mb-8 p-1.5 backdrop-blur-md rounded-full border border-borderLight/50 shadow-sm transition-all duration-500 ease-in-out origin-top sticky top-[72px] w-full
                ${isScrolled 
                  ? "bg-white/90 dark:bg-gray-800/90 shadow-lg border-white/10 dark:border-gray-700" 
                  : "bg-white/50 dark:bg-gray-800/30"
                }
              `}>
                <div className="flex items-center overflow-x-auto hide-scrollbar gap-2 max-w-full px-4 w-full">
                  <button
                    onClick={() => setCurrentCategory('all')}
                    className={`rounded-full font-semibold transition-all whitespace-nowrap px-5 py-2 text-sm
                      ${currentCategory === 'all' 
                        ? 'bg-primary text-textOnPrimary shadow-md' 
                        : `text-textMain hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-textMain'}`
                      }`}
                  >
                    All
                  </button>
                  <div className={`w-px h-6 mx-2 flex-shrink-0 transition-colors ${isScrolled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300/50'}`}></div>
                  <div className="flex gap-2 flex-1 overflow-x-auto hide-scrollbar">
                    {categories.filter(c => c.id !== 'general').map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCurrentCategory(cat.id)}
                        className={`rounded-full font-medium whitespace-nowrap transition-all px-4 py-2 text-sm
                          ${currentCategory === cat.id 
                            ? 'bg-primary text-textOnPrimary shadow-md' 
                            : `text-textMain hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-textMain'}`
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <button 
                      id="category-manager-button" onClick={() => setShowCategoryManager(true)}
                      className="ml-2 p-2 rounded-full shadow-md hover:scale-105 transition-all z-10 shrink-0 bg-white text-textMain hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              </div>

              <div className="hidden md:block bg-surface dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-borderLight dark:border-gray-700 mb-8 animate-slide-up">
                <div className="flex gap-4 mb-4">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote(inputValue)}
                  placeholder={`Add a note to ${activeCategoryName}...`}
                  className="flex-1 p-4 bg-bgPage dark:bg-transparent border-2 border-borderLight dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg text-textMain dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button 
                    onClick={() => handleAddNote(inputValue)}
                    disabled={syncStatus === 'syncing'}
                    className="px-8 bg-primary hover:bg-primaryDark text-textOnPrimary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center w-28"
                  >
                    {syncStatus === 'syncing' ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Add"}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Quick:</span>
                  <div className="flex gap-2 flex-wrap">
                    {quickActions
                      .filter(qa => currentCategory === 'all' || qa.categoryId === currentCategory || qa.categoryId === 'general')
                      .map(qa => (
                        <button 
                          key={qa.id}
                          onClick={() => setInputValue(qa.text)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-primary/20 dark:hover:bg-indigo-900/30 hover:text-textMain dark:hover:text-indigo-300 border border-transparent rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                        >
                          {qa.text}
                        </button>
                      ))
                    }
                  </div>
                  <button 
                    onClick={() => setShowQAManager(true)} 
                    className="ml-auto p-1.5 text-gray-400 hover:text-textMain hover:bg-primary/10 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                    title="Manage Quick Actions"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 w-full">
                <button
                   onClick={() => { setFilterMode('all'); setCustomDate(''); }}
                   className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${filterMode === 'all' ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}
                 >
                   All Time
                 </button>
                 
                 <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar px-1">
                    {['today', 'yesterday', 'week', 'month'].map(mode => (
                       <button
                         key={mode}
                         onClick={() => { setFilterMode(mode as FilterMode); setCustomDate(''); }}
                         className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${filterMode === mode ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}
                       >
                         {mode}
                       </button>
                    ))}
                 </div>

                 <div className="shrink-0 relative">
                    <div className={`p-1.5 rounded-full border transition-all ${filterMode === 'custom' ? 'bg-primary text-textOnPrimary border-primary shadow-sm' : 'bg-white border-borderLight text-gray-500 hover:bg-gray-50'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <input 
                      type="date" 
                      value={customDate}
                      onChange={(e) => { setCustomDate(e.target.value); setFilterMode('custom'); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </div>
              </div>

              <div className="animate-fade-in pb-10">
                {renderNotes()}
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="flex-1 pt-32 container mx-auto px-4 max-w-3xl">
          <LandingPage onLoginClick={() => setShowLoginModal(true)} />
        </main>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { 
          setShowLoginModal(false); 
          setAuthEmail(''); 
          setAuthPassword(''); 
          setAuthName('');
          setIsSignUp(false);
        }}
        onGoogleLogin={handleGoogleLogin}
        onEmailAuth={handleEmailAuth}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        onForgotPassword={handleForgotPassword}
        authLoading={authLoading}
      />

      {user && (
        <>
          <OnboardingModal 
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />

          <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="App Settings">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">App Name</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Quick Notes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-2">App Subtitle</label>
                <input 
                  type="text" 
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary text-sm bg-bgPage dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Capture ideas instantly"
                />
              </div>
              
              <div>
                 <label className="block text-sm font-semibold text-textMain dark:text-gray-300 mb-3">Theme</label>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setAppTheme('default')}
                      className={`w-10 h-10 rounded-full bg-[#FFFFFF] border border-gray-200 shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${appTheme === 'default' ? 'ring-2 ring-textMain ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                      title="Minimalist (Default)"
                    >
                       {appTheme === 'default' && <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => setAppTheme('pink')}
                      className={`w-10 h-10 rounded-full bg-[#FFC0CB] shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${appTheme === 'pink' ? 'ring-2 ring-textMain ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                      title="Pink"
                    >
                       {appTheme === 'pink' && <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => setAppTheme('blue')}
                      className={`w-10 h-10 rounded-full bg-[#BAE6FD] shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${appTheme === 'blue' ? 'ring-2 ring-textMain ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                      title="Blue"
                    >
                       {appTheme === 'blue' && <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => setAppTheme('green')}
                      className={`w-10 h-10 rounded-full bg-[#BBF7D0] shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${appTheme === 'green' ? 'ring-2 ring-textMain ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                      title="Green"
                    >
                       {appTheme === 'green' && <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => setAppTheme('purple')}
                      className={`w-10 h-10 rounded-full bg-[#E9D5FF] shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${appTheme === 'purple' ? 'ring-2 ring-textMain ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                      title="Purple"
                    >
                       {appTheme === 'purple' && <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                 </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={syncStatus === 'syncing'}
                className="w-full py-3 bg-primary text-textOnPrimary font-bold rounded-xl hover:bg-primaryDark transition-colors mt-2 flex items-center justify-center"
              >
                {syncStatus === 'syncing' ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : "Save Changes"}
              </button>
              
              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Data Backup</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={handleExportData}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export
                  </button>
                  <label className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Import
                    <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                  </label>
                </div>
              </div>
            </div>
          </Modal>

          <Modal isOpen={showCategoryManager} onClose={() => setShowCategoryManager(false)} title="Manage Categories">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input 
                  id="new-cat-input"
                  type="text" 
                  placeholder="New category name..."
                  className="flex-1 p-3 border border-borderLight dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-primary bg-bgPage dark:bg-gray-700 dark:text-white"
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          handleAddCategory((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                      }
                  }}
                />
                <button 
                  onClick={() => {
                      const input = document.getElementById('new-cat-input') as HTMLInputElement;
                      handleAddCategory(input.value);
                      input.value = '';
                  }}
                  disabled={syncStatus === 'syncing'}
                  className="px-4 bg-primary text-textOnPrimary font-bold rounded-xl hover:bg-primaryDark transition-colors w-24 flex items-center justify-center"
                >
                  {syncStatus === 'syncing' ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Add"}
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-bgPage dark:bg-gray-700/50 rounded-xl border border-borderLight dark:border-gray-700">
                    {editingCatId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input 
                                value={editCatName}
                                onChange={(e) => setEditCatName(e.target.value)}
                                className="flex-1 p-1 text-sm border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <button onClick={saveEditCategory} disabled={syncStatus === 'syncing'} className="text-xs bg-primary/20 text-textMain px-2 py-1 rounded w-16 h-6 flex items-center justify-center">
                              {syncStatus === 'syncing' ? (
                                <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : "Save"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-textMain dark:text-gray-200">{cat.name}</span>
                            {cat.id === 'general' && <span className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">Default</span>}
                        </div>
                    )}
                    {cat.id !== 'general' && (
                      <div className="flex items-center gap-1">
                         <button onClick={() => startEditCategory(cat)} className="p-1.5 text-gray-400 hover:text-textMain hover:bg-primary/20 dark:hover:bg-indigo-900/30 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         </button>
                         <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Modal>

          <Modal isOpen={showMobileAdd} onClose={() => setShowMobileAdd(false)} title="New Note" footer={
            <button 
              onClick={() => handleAddNote(inputValue)}
              disabled={syncStatus === 'syncing'}
              className="w-full py-3.5 bg-primary text-textOnPrimary font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
            >
              {syncStatus === 'syncing' ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : "Add Note"}
            </button>
          }>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Adding to <span className="font-bold text-textMain dark:text-indigo-400">{activeCategoryName}</span></p>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your note here..."
                className="w-full h-32 p-4 bg-bgPage dark:bg-gray-800 border border-borderLight dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-colors text-base text-textMain dark:text-gray-100 resize-none"
                autoFocus
              />
              <div className="flex justify-between items-end">
                 <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block">Quick Actions</span>
                 <button onClick={() => setShowQAManager(true)} className="text-xs text-textMain dark:text-indigo-400 font-semibold px-3 py-1.5 mb-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md border border-borderLight dark:border-gray-600 transition-colors">Manage</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {quickActions
                  .filter(qa => currentCategory === 'all' || qa.categoryId === currentCategory || qa.categoryId === 'general')
                  .map(qa => (
                    <button 
                      key={qa.id}
                      onClick={() => setInputValue(qa.text)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 active:bg-primary/50 dark:active:bg-indigo-900 active:text-textMain dark:active:text-indigo-300 border border-transparent rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      {qa.text}
                    </button>
                  ))
                }
              </div>
            </div>
          </Modal>

          <Modal isOpen={showQAManager} onClose={() => setShowQAManager(false)} title="Manage Quick Actions">
            <div className="flex flex-col gap-4 hide-scrollbar">
              <div className="p-4 bg-primary/10 dark:bg-indigo-900/20 rounded-xl border border-primary/20 dark:border-indigo-900/30">
                 <h4 className="text-xs font-bold text-textMain dark:text-indigo-400 uppercase tracking-wide mb-3">Create New Action</h4>
                 <div className="flex flex-col gap-2">
                    <input 
                      id="new-qa-input"
                      type="text" 
                      placeholder="Action name (e.g. Shopping List)"
                      className="w-full p-3 border border-borderLight dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex gap-2">
                        <select id="new-qa-cat" className="p-3 border border-borderLight dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 flex-1 focus:outline-none">
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                              const input = document.getElementById('new-qa-input') as HTMLInputElement;
                              const select = document.getElementById('new-qa-cat') as HTMLSelectElement;
                              handleAddQA(input.value, select.value);
                              input.value = '';
                          }}
                          disabled={syncStatus === 'syncing'}
                          className="px-6 bg-primary text-textOnPrimary font-bold rounded-lg hover:bg-primaryDark transition-colors shadow-sm w-28 flex items-center justify-center"
                        >
                          {syncStatus === 'syncing' ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : "Create"}
                        </button>
                    </div>
                 </div>
              </div>
              <div className="border-t border-borderLight dark:border-gray-700 my-1"></div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Existing Actions</h4>
                <div className="max-h-[250px] overflow-y-auto pr-1 flex flex-col gap-2">
                  {quickActions.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200">No Quick Actions</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Create one above to get started.</p>
                    </div>
                  ) : (
                    quickActions.map((qa) => (
                      <div key={qa.id} className="group flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-xl border border-borderLight dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {editingQAId === qa.id ? (
                          <div className="flex flex-col gap-2 flex-1 mr-2">
                            <input
                              value={editQAText}
                              onChange={(e) => setEditQAText(e.target.value)}
                              className="p-1 text-sm border rounded w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              placeholder="Action Name"
                            />
                            <div className="flex gap-2">
                              <select
                                value={editQACat}
                                onChange={(e) => setEditQACat(e.target.value)}
                                className="text-xs p-1 border rounded flex-1 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                                            <button onClick={saveEditQA} disabled={syncStatus === 'syncing'} className="text-xs bg-primary/20 text-textMain px-3 rounded font-medium w-16 h-6 flex items-center justify-center">
                                              {syncStatus === 'syncing' ? (
                                                <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                              ) : (
                                                "Save"
                                              )}
                                            </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="font-semibold text-textMain dark:text-gray-200 text-sm">{qa.text}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getCategoryColor(qa.categoryId) }}></span>
                                {categories.find(c => c.id === qa.categoryId)?.name || 'Unknown'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditQA(qa)} className="p-1.5 text-gray-400 hover:text-textMain hover:bg-primary/20 dark:hover:bg-indigo-900/30 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteQA(qa.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                                </div>
              </div>
            </div>
          </Modal>

          <ConfirmationModal
            isOpen={!!confirmDeleteNoteId}
            onClose={() => setConfirmDeleteNoteId(null)}
            onConfirm={handleDeleteNote}
            title="Delete Note?"
            message="This action cannot be undone. Are you sure you want to delete this note?"
            confirmText="Delete"
            isDestructive={true}
          />
          <ConfirmationModal
            isOpen={!!confirmDeleteCategoryId}
            onClose={() => setConfirmDeleteCategoryId(null)}
            onConfirm={confirmCategoryDeletion}
            title="Delete Category?"
            message="Are you sure you want to delete this category? Notes will be moved to 'General'."
            confirmText="Delete"
            isDestructive={true}
          />
          <ConfirmationModal
            isOpen={!!confirmDeleteQAId}
            onClose={() => setConfirmDeleteQAId(null)}
            onConfirm={confirmQADeletion}
            title="Delete Quick Action?"
            message="Are you sure you want to delete this quick action?"
            confirmText="Delete"
            isDestructive={true}
          />
        </>
      )}
      <footer className="bg-surface dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-6 text-center text-xs border-t border-borderLight dark:border-gray-700">
        <div className="flex justify-center gap-6 mb-3">
          <a href="https://www.linkedin.com/in/kenneth-irvin-butad-479b4b26b/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.484 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.59-11.018-3.714v-2.155z"/>
            </svg>
          </a>
          <a href="https://kenneth-eta.vercel.app/" target="_blank" rel="noopener noreferrer" title="Portfolio" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v1.5a1.5 1.5 0 01-3 0V12a2 2 0 00-2-2 2 2 0 01-2-2V8.5A1.5 1.5 0 015 7c.667 0 1.167.221 1.652.615C5.42 7.904 4.552 8 4 8c-.141 0-.277.005-.41.015l.742.012z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="mailto:kijbutad08@gmail.com" title="Email" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
            </svg>
          </a>
        </div>
        &copy; {new Date().getFullYear()} Kenneth B. All rights reserved.
      </footer>

      {user && (
        <button 
          onClick={() => setShowMobileAdd(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-textOnPrimary shadow-2xl shadow-primary/40 flex items-center justify-center rounded-full active:scale-90 transition-transform z-40"
          aria-label="Add Note"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      )}

    </div>
  );
};

export default App;

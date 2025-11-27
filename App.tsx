
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, Category, QuickAction, FilterMode, ToastMessage, ToastType } from './types';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import NoteCard from './components/NoteCard';
import ToastContainer from './components/ToastContainer';

// --- FIREBASE IMPORTS ---
import { auth, db, googleProvider } from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';

// --- UTILS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getCategoryColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
};

// --- DEFAULT DATA ---
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'general', name: 'General' },
  { id: 'work', name: 'Work' },
  { id: 'ideas', name: 'Ideas' },
];

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa1', text: 'Meeting notes', categoryId: 'work' },
  { id: 'qa2', text: 'Grocery list', categoryId: 'general' },
];

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Initialize State Lazy (Directly from LocalStorage) to prevent overwriting data on mount
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

  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('app_subtitle') || "Capture ideas instantly");
  
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // UI State
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Single Active Note State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showQAManager, setShowQAManager] = useState(false);
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Login Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Delete Confirmation States
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  const [confirmDeleteQAId, setConfirmDeleteQAId] = useState<string | null>(null);

  // Editing State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  
  const [editingQAId, setEditingQAId] = useState<string | null>(null);
  const [editQAText, setEditQAText] = useState('');
  const [editQACat, setEditQACat] = useState('general');

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);

  // --- AUTH LISTENER ---
  useEffect(() => {
    // Check if auth is available (it might be null if init failed)
    if (!auth) {
      console.warn("Auth service not available (Local Mode)");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsFirebaseReady(true);
      
      if (currentUser) {
        showToast(`Welcome back, ${currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User'}!`);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- FIRESTORE SYNC (CLOUD MODE) ---
  useEffect(() => {
    if (!user || !db) return; // Only sync if logged in and DB is ready

    // 1. Sync Notes
    const notesRef = collection(db, `users/${user.uid}/notes`);
    const notesUnsub = onSnapshot(notesRef, (snapshot) => {
      const cloudNotes = snapshot.docs.map(doc => doc.data() as Note);
      setNotes(cloudNotes);
    });

    // 2. Sync Categories
    const catsRef = collection(db, `users/${user.uid}/categories`);
    const catsUnsub = onSnapshot(catsRef, (snapshot) => {
      const cloudCats = snapshot.docs.map(doc => doc.data() as Category);
      if (cloudCats.length > 0) {
        setCategories(cloudCats);
      }
    });

    // 3. Sync Quick Actions
    const qaRef = collection(db, `users/${user.uid}/quickActions`);
    const qaUnsub = onSnapshot(qaRef, (snapshot) => {
      const cloudQA = snapshot.docs.map(doc => doc.data() as QuickAction);
      setQuickActions(cloudQA);
    });

    return () => {
      notesUnsub();
      catsUnsub();
      qaUnsub();
    };
  }, [user]);

  // --- LOCAL PERSISTENCE (LOCAL MODE ONLY) ---
  useEffect(() => {
    if (!user) localStorage.setItem('qn_notes', JSON.stringify(notes));
  }, [notes, user]);

  useEffect(() => {
    if (!user) localStorage.setItem('qn_cats', JSON.stringify(categories));
  }, [categories, user]);

  useEffect(() => {
    if (!user) localStorage.setItem('qn_qa', JSON.stringify(quickActions));
  }, [quickActions, user]);

  useEffect(() => localStorage.setItem('app_subtitle', appSubtitle), [appSubtitle]);

  // --- THEME EFFECT ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [darkMode]);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- ACTIONS ---
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- AUTH ACTIONS ---
  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      showToast("Cloud sync is unavailable", "error");
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
        showToast("Auth service unavailable", "error");
        return;
    }
    if (!authEmail || !authPassword) {
        showToast("Please enter email and password", "error");
        return;
    }
    
    setAuthLoading(true);
    try {
        if (isSignUp) {
            await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            showToast("Account created successfully!");
        } else {
            await signInWithEmailAndPassword(auth, authEmail, authPassword);
            showToast("Signed in successfully!");
        }
        setShowLoginModal(false);
        setAuthEmail('');
        setAuthPassword('');
    } catch (error: any) {
        console.error("Auth error", error);
        let msg = "Authentication failed";
        if (error.code === 'auth/email-already-in-use') msg = "Email already in use";
        if (error.code === 'auth/wrong-password') msg = "Incorrect password";
        if (error.code === 'auth/user-not-found') msg = "User not found";
        if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters";
        showToast(msg, "error");
    } finally {
        setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) return;
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

  // --- DATA OPERATIONS ---

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
        showToast('Note synced to cloud');
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to save to cloud', 'error');
        setSyncStatus('error');
      }
    } else {
      setNotes(prev => [newNote, ...prev]);
      showToast('Note added locally');
    }
    
    setInputValue('');
    if (showMobileAdd) setShowMobileAdd(false);
  };

  const handleUpdateNote = async (id: string, content: string, categoryId: string, timestamp: number, silent: boolean = false) => {
    const updatedNote = { id, content, categoryId, timestamp };
    
    if (user && db) {
      if (!silent) setSyncStatus('syncing');
      try {
        await setDoc(doc(db, `users/${user.uid}/notes`, id), updatedNote, { merge: true });
        if (!silent) showToast('Note updated in cloud');
        setSyncStatus('idle');
      } catch (e) {
        if (!silent) showToast('Update failed', 'error');
        setSyncStatus('error');
      }
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, content, categoryId, timestamp } : n));
      if (!silent) showToast('Note updated locally');
    }
  };

  const handleDeleteNote = async () => {
    if (confirmDeleteNoteId) {
      if (user && db) {
        setSyncStatus('syncing');
        try {
          await deleteDoc(doc(db, `users/${user.uid}/notes`, confirmDeleteNoteId));
          showToast('Note deleted from cloud');
          setSyncStatus('idle');
        } catch (e) {
          showToast('Delete failed', 'error');
          setSyncStatus('error');
        }
      } else {
        setNotes(prev => prev.filter(n => n.id !== confirmDeleteNoteId));
        showToast('Note deleted locally');
      }
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
        showToast('Category synced');
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to add category', 'error');
        setSyncStatus('error');
      }
    } else {
      setCategories(prev => [...prev, newCat]);
      showToast('Category added');
    }
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
          showToast('Category updated in cloud');
          setSyncStatus('idle');
        } catch (e) {
          showToast('Failed to update category', 'error');
          setSyncStatus('error');
        }
      } else {
        setCategories(prev => prev.map(c => c.id === editingCatId ? { ...c, name: editCatName } : c));
        showToast('Category updated');
      }
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
        // Note: In a real app we'd update all notes in a batch too, but for simplicity we assume client-side updates eventually consistency or cloud functions
        await deleteDoc(catRef); 
        
        // Optimistically update notes locally for immediate UI feedback while syncing might lag or require cloud functions
        notes.forEach(async n => {
          if (n.categoryId === id) {
             await setDoc(doc(db, `users/${user.uid}/notes`, n.id), { ...n, categoryId: 'general' });
          }
        });
        showToast('Category deleted from cloud');
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to delete category', 'error');
        setSyncStatus('error');
      }
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      setNotes(prev => prev.map(n => n.categoryId === id ? { ...n, categoryId: 'general' } : n));
      setQuickActions(prev => prev.map(q => q.categoryId === id ? { ...q, categoryId: 'general' } : q));
      showToast('Category deleted');
    }

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
        showToast('Action synced');
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to add action', 'error');
        setSyncStatus('error');
      }
    } else {
      setQuickActions(prev => [...prev, newQA]);
      showToast('Quick action added');
    }
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
          showToast('Action updated in cloud');
          setSyncStatus('idle');
        } catch (e) {
          showToast('Failed to update action', 'error');
          setSyncStatus('error');
        }
      } else {
        setQuickActions(prev => prev.map(q => q.id === editingQAId ? { ...q, text: editQAText, categoryId: editQACat } : q));
        showToast('Quick action updated');
      }
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
        showToast('Action deleted from cloud');
        setSyncStatus('idle');
      } catch (e) {
        showToast('Failed to delete action', 'error');
        setSyncStatus('error');
      }
    } else {
      setQuickActions(prev => prev.filter(q => q.id !== confirmDeleteQAId));
      showToast('Quick action deleted');
    }
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
        <div className="text-center py-20 bg-white/10 dark:bg-gray-800/50 rounded-3xl backdrop-blur-sm border border-white/20 dark:border-gray-700">
          <p className="text-white text-lg font-medium opacity-80">No notes found for this filter ✨</p>
        </div>
      );
    }

    return sortedDateKeys.map((dateKey, groupIdx) => {
      const notesInGroup = groups[dateKey].sort((a,b) => b.timestamp - a.timestamp);
      const groupDateTimestamp = notesInGroup[0].timestamp;
      
      return (
        <div key={dateKey} className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-up" style={{ animationDelay: `${groupIdx * 50}ms` }}>
          <div className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg tracking-tight">
              {formatHeaderDate(groupDateTimestamp)}
            </h3>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              {notesInGroup.length} {notesInGroup.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
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
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100">
      <ToastContainer toasts={toasts} />
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-indigo-600/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg py-3' : 'py-6'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex flex-col text-white">
            <h1 className={`font-extrabold tracking-tight transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-3xl'}`}>Quick Notes</h1>
            <div className={`flex items-center gap-2 transition-all duration-300 ${isScrolled ? 'h-0 opacity-0' : 'h-auto opacity-90'}`}>
              <span className="text-indigo-100 font-light text-sm">{appSubtitle}</span>
              {isFirebaseReady && user && (
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-green-400/20 border-green-400/40 text-green-100 flex items-center gap-1">
                      Cloud Sync On
                    </span>
                    {syncStatus === 'syncing' && (
                        <span className="text-[10px] text-indigo-200 animate-pulse flex items-center gap-1">
                           <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Syncing...
                        </span>
                    )}
                    {syncStatus === 'error' && (
                        <span className="text-[10px] text-red-300 flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           Sync Error
                        </span>
                    )}
                     {syncStatus === 'idle' && (
                        <span className="text-[10px] text-indigo-200 opacity-60">Synced</span>
                    )}
                 </div>
              )}
              {isFirebaseReady && !user && (
                 <span className="text-[10px] px-1.5 py-0.5 rounded border bg-white/10 border-white/20 text-indigo-100">
                  Local Mode
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
                 {user?.photoURL ? (
                   <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/50" />
                 ) : (
                   <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
                 )}
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 animate-fade-in origin-top-right overflow-hidden z-[60] border border-gray-100 dark:border-gray-700">
                  {user && <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 truncate">Signed in as {user.email}</div>}
                  <button onClick={() => { setShowSettings(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  {user ? (
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  ) : (
                    <button onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                      Cloud Sync (Sign In)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-32 max-w-3xl flex-1">
        <div className={`z-30 flex items-center mb-8 p-1.5 backdrop-blur-md rounded-full border border-white/20 shadow-sm transition-all duration-500 ease-in-out origin-top sticky top-[60px] w-full
          ${isScrolled 
            ? "bg-white/90 dark:bg-gray-800/90 shadow-lg border-white/10 dark:border-gray-700" 
            : "bg-glassBorder dark:bg-gray-800/30"
          }
        `}>
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-2 max-w-full px-4 w-full">
            <button 
              onClick={() => setCurrentCategory('all')}
              className={`rounded-full font-semibold transition-all whitespace-nowrap px-5 py-2 text-sm
                ${currentCategory === 'all' 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-md' 
                  : (isScrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5' : 'text-white hover:bg-white/10')
                }`}
            >
              All
            </button>
            <div className={`w-px h-6 mx-2 flex-shrink-0 transition-colors ${isScrolled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-white/30'}`}></div>
            <div className="flex gap-2 flex-1 overflow-x-auto hide-scrollbar">
              {categories.filter(c => c.id !== 'general').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(cat.id)}
                  className={`rounded-full font-medium whitespace-nowrap transition-all px-4 py-2 text-sm
                    ${currentCategory === cat.id 
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-md' 
                      : (isScrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5' : 'text-white hover:bg-white/10')
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button 
                onClick={() => setShowCategoryManager(true)}
                className={`ml-2 p-2 rounded-full shadow-md hover:scale-105 transition-all z-10 shrink-0
                   ${isScrolled ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-300' : 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300'}
                `}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8 animate-slide-up border border-transparent dark:border-gray-700">
          <div className="flex gap-4 mb-4">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote(inputValue)}
              placeholder={`Add a note to ${activeCategoryName}...`}
              className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg text-gray-800 dark:text-white placeholder-gray-400"
            />
            <button 
              onClick={() => handleAddNote(inputValue)}
              className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
            >
              Add
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
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 border border-transparent rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    {qa.text}
                  </button>
                ))
              }
            </div>
            <button onClick={() => setShowQAManager(true)} className="ml-auto text-gray-300 hover:text-indigo-500 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 w-full">
          <button
             onClick={() => { setFilterMode('all'); setCustomDate(''); }}
             className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${filterMode === 'all' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-white dark:border-gray-600 shadow-sm' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
           >
             All Time
           </button>
           
           <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar px-1">
              {['today', 'yesterday', 'week', 'month'].map(mode => (
                 <button
                   key={mode}
                   onClick={() => { setFilterMode(mode as FilterMode); setCustomDate(''); }}
                   className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all whitespace-nowrap ${filterMode === mode ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-white dark:border-gray-600 shadow-sm' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                 >
                   {mode}
                 </button>
              ))}
           </div>

           <div className="shrink-0 relative">
              <div className={`p-1.5 rounded-full border transition-all ${filterMode === 'custom' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border-white dark:border-gray-600 shadow-sm' : 'bg-white/10 text-white border-white/20'}`}>
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
      </main>

      <footer className="mt-auto bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 py-6 text-center text-xs border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-center gap-4 mb-2">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Privacy</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Terms</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Support</a>
        </div>
        &copy; {new Date().getFullYear()} Quick Notes. All rights reserved.
      </footer>

      <button 
        onClick={() => setShowMobileAdd(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center rounded-full active:scale-90 transition-transform z-40"
        aria-label="Add Note"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>

      <Modal isOpen={showLoginModal} onClose={() => { setShowLoginModal(false); setAuthEmail(''); setAuthPassword(''); }} title="Enable Cloud Sync">
        <div className="flex flex-col gap-4 py-2">
          
          {/* Email/Password Form */}
          <div className="flex flex-col gap-3">
             <div className="relative">
                <input 
                   type="email" 
                   value={authEmail}
                   onChange={e => setAuthEmail(e.target.value)}
                   className="peer w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 placeholder-transparent text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                   placeholder="Email"
                />
                <label className="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-1 text-xs text-indigo-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">Email</label>
             </div>
             <div className="relative">
                <input 
                   type="password" 
                   value={authPassword}
                   onChange={e => setAuthPassword(e.target.value)}
                   className="peer w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 placeholder-transparent text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                   placeholder="Password"
                   onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                />
                <label className="absolute left-3 -top-2.5 bg-white dark:bg-gray-800 px-1 text-xs text-indigo-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">Password</label>
             </div>
             
             <button 
                onClick={handleEmailAuth}
                disabled={authLoading}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex justify-center items-center"
             >
                {authLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    isSignUp ? "Sign Up" : "Sign In"
                )}
             </button>
             
             <div className="flex justify-between items-center text-sm">
                <button 
                  onClick={handleForgotPassword}
                  className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs"
                >
                  Forgot Password?
                </button>
                <div className="flex">
                  <span className="text-gray-500 dark:text-gray-400 mr-1">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 my-2">
             <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
             <span className="text-xs text-gray-400 uppercase">OR</span>
             <div className="h-px bg-gray-200 dark:bg-gray-600 flex-1"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center gap-3 transition-colors"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
             Continue with Google
          </button>
        </div>
      </Modal>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="App Settings">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">App Subtitle</label>
            <input 
              type="text" 
              value={appSubtitle}
              onChange={(e) => setAppSubtitle(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-400 text-sm bg-white dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Capture ideas instantly"
            />
          </div>
          <button 
            onClick={() => { setShowSettings(false); showToast('Settings saved'); }}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Save Changes
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
              className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white dark:bg-gray-700 dark:text-white"
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
              className="px-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                {editingCatId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input 
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 p-1 text-sm border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                        <button onClick={saveEditCategory} className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded">Save</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                        {cat.id === 'general' && <span className="text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">Default</span>}
                    </div>
                )}
                {cat.id !== 'general' && (
                  <div className="flex items-center gap-1">
                     <button onClick={() => startEditCategory(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">
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
          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Add Note
        </button>
      }>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Adding to <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeCategoryName}</span></p>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your note here..."
            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-colors text-base text-gray-800 dark:text-gray-100 resize-none"
            autoFocus
          />
          <div className="flex justify-between items-end">
             <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block">Quick Actions</span>
             <button onClick={() => setShowQAManager(true)} className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold px-2 py-1 mb-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded">Manage</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickActions
              .filter(qa => currentCategory === 'all' || qa.categoryId === currentCategory || qa.categoryId === 'general')
              .map(qa => (
                <button 
                  key={qa.id}
                  onClick={() => setInputValue(qa.text)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 active:bg-indigo-100 dark:active:bg-indigo-900 active:text-indigo-600 dark:active:text-indigo-300 border border-transparent rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {qa.text}
                </button>
              ))
            }
          </div>
        </div>
      </Modal>

      <Modal isOpen={showQAManager} onClose={() => setShowQAManager(false)} title="Manage Quick Actions">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
             <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-3">Create New Action</h4>
             <div className="flex flex-col gap-2">
                <input 
                  id="new-qa-input"
                  type="text" 
                  placeholder="Action name (e.g. Shopping List)"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-400 bg-white dark:bg-gray-700 dark:text-white"
                />
                <div className="flex gap-2">
                    <select id="new-qa-cat" className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 flex-1 focus:outline-none">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button 
                      onClick={() => {
                          const input = document.getElementById('new-qa-input') as HTMLInputElement;
                          const select = document.getElementById('new-qa-cat') as HTMLSelectElement;
                          handleAddQA(input.value, select.value);
                          input.value = '';
                      }}
                      className="px-6 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                      Create
                    </button>
                </div>
             </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Existing Actions</h4>
            <div className="max-h-[250px] overflow-y-auto pr-1 flex flex-col gap-2">
                {quickActions.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4 italic">No quick actions defined yet.</p>
                ) : (
                    quickActions.map((qa) => (
                    <div key={qa.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
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
                                    <button onClick={saveEditQA} className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 rounded font-medium">Save</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{qa.text}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: getCategoryColor(qa.categoryId) }}></span>
                                    {categories.find(c => c.id === qa.categoryId)?.name || 'Unknown'}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <button onClick={() => startEditQA(qa)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteQA(qa.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
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
    </div>
  );
};

export default App;

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  getStoredNotes, 
  saveStoredNotes, 
  getStoredCategories, 
  saveStoredCategories, 
  getStoredQuickActions, 
  saveStoredQuickActions, 
  getLastSyncTime, 
  saveLastSyncTime, 
  getAppSettings, 
  saveAppSettings, 
  getRememberMe, 
  getRememberedEmail, 
  saveRememberMe,
  getStoredUnits, 
  saveStoredUnits, 
  getStoredRelatedUnits, 
  saveStoredRelatedUnits 
} from '@shared/utils/storageUtils';
import { DEFAULT_CATEGORIES, DEFAULT_QUICK_ACTIONS, THEMES } from '@shared/constants';
import { Note, Category, QuickAction, UnitOfMeasure, RelatedUnit, AppSettings, CategoryType } from '@shared/types';

export const useData = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qn_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to load notes', e); return []; }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    // One-time read, will be overwritten by Firestore listener.
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    try {
      const saved = localStorage.getItem('qn_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) { return DEFAULT_CATEGORIES; }
  });

  const [quickActions, setQuickActions] = useState<QuickAction[]>(() => {
    // One-time read, will be overwritten by Firestore listener.
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qn_quick_actions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [units, setUnits] = useState<UnitOfMeasure[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qn_units');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to load units', e); return []; }
  });

  const [relatedUnits, setRelatedUnits] = useState<RelatedUnit[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('qn_related_units');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to load related units', e); return []; }
  });

  const [appName, setAppName] = useState(() => localStorage.getItem('app_name') || "Quick Notes");
  const [appSubtitle, setAppSubtitle] = useState(() => localStorage.getItem('app_subtitle') || "Capture ideas instantly");
  const [appTheme, setAppTheme] = useState<keyof typeof THEMES>(() => (localStorage.getItem('app_theme') as keyof typeof THEMES) || 'default');
  const [settingsLastUpdated, setSettingsLastUpdated] = useState<number>(() => parseInt(localStorage.getItem('qn_settings_updated') || '0', 10));
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const [lastSyncTime, setLastSyncTime] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('qn_last_sync');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
  });

  const [inputValue, setInputValue] = useState('');
  const [noteQuantity, setNoteQuantity] = useState('');
  const [noteUnitId, setNoteUnitId] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<any>([]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showQAManager, setShowQAManager] = useState(false);
  const [showUnitsManager, setShowUnitsManager] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showClearAllNotesConfirm, setShowClearAllNotesConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showMobileAdd, setShowMobileAdd] = useState(false);

  const [clearNotesInput, setClearNotesInput] = useState('');
  const [clearNotesError, setClearNotesError] = useState(false);
  const clearNotesInputRef = useRef<HTMLInputElement>(null);

  // QuickAction form state
  const [newQA, setNewQA] = useState({
    text: '',
    categoryId: '',
    quantity: '',
    unitId: ''
  });

  // Category form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    category_type: 'text' as CategoryType,
    defaultUnitId: '' as string | undefined
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    qaText: '',
    qaCategory: '',
    qaQuantity: '',
    qaUnit: '',
    categoryName: ''
  });

  // Auth state
  const [rememberMe, setRememberMe] = useState(() => getRememberMe());
  const [authEmail, setAuthEmail] = useState(() => getRememberedEmail());
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authLoadingSource, setAuthLoadingSource] = useState<'google' | 'email' | null>(null);

  // Global settings state
  const [globalSettings, setGlobalSettings] = useState({
    allowRegistration: true,
    enableAdminAnalytics: false,
    maintenanceMode: false,
    maintenanceMessage: ''
  });

  const [globalSettingsLoaded, setGlobalSettingsLoaded] = useState(false);

  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  const [confirmDeleteQAId, setConfirmDeleteQAId] = useState<string | null>(null);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const [editingQAId, setEditingQAId] = useState<string | null>(null);
  const [editQAText, setEditQAText] = useState('');
  const [editQACat, setEditQACat] = useState('general');

  const [qaFilter, setQaFilter] = useState('');
  const [qaSortOrder, setQaSortOrder] = useState<'asc' | 'desc'>('asc');
  const [qaSortKey, setQaSortKey] = useState<'text' | 'category'>('text');

  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  const menuRef = useRef<HTMLDivElement>(null);
  const loadingStartTime = useRef<number | null>(null);

  // Memoized values
  const activeCategoryName = useMemo(() => {
    if (currentCategory === 'all') return 'All Notes';
    const category = categories.find(c => c.id === currentCategory);
    return category?.name || 'General';
  }, [currentCategory, categories]);

  return {
    // Data state
    notes,
    setNotes,
    categories,
    setCategories,
    quickActions,
    setQuickActions,
    units,
    setUnits,
    relatedUnits,
    setRelatedUnits,
    appName,
    setAppName,
    appSubtitle,
    setAppSubtitle,
    appTheme,
    setAppTheme,
    settingsLastUpdated,
    setSettingsLastUpdated,
    darkMode,
    setDarkMode,
    lastSyncTime,
    setLastSyncTime,
    inputValue,
    setInputValue,
    noteQuantity,
    setNoteQuantity,
    noteUnitId,
    setNoteUnitId,
    isScrolled,
    setIsScrolled,
    isMenuOpen,
    setIsMenuOpen,
    toasts,
    setToasts,
    activeNoteId,
    setActiveNoteId,
    
    // Modal states
    showSettings,
    setShowSettings,
    showCategoryManager,
    setShowCategoryManager,
    showQAManager,
    setShowQAManager,
    showUnitsManager,
    setShowUnitsManager,
    showOnboarding,
    setShowOnboarding,
    showClearAllNotesConfirm,
    setShowClearAllNotesConfirm,
    showLoginModal,
    setShowLoginModal,
    showSetPasswordModal,
    setShowSetPasswordModal,
    showMobileAdd,
    setShowMobileAdd,
    
    // Form states
    newQA,
    setNewQA,
    newCategory,
    setNewCategory,
    validationErrors,
    setValidationErrors,
    
    // Auth states
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
    
    // Global settings
    globalSettings,
    setGlobalSettings,
    globalSettingsLoaded,
    setGlobalSettingsLoaded,
    
    // Editing states
    confirmDeleteNoteId,
    setConfirmDeleteNoteId,
    confirmDeleteCategoryId,
    setConfirmDeleteCategoryId,
    confirmDeleteQAId,
    setConfirmDeleteQAId,
    editingCatId,
    setEditingCatId,
    editCatName,
    setEditCatName,
    editingQAId,
    setEditingQAId,
    editQAText,
    setEditQAText,
    editQACat,
    setEditQACat,
    qaFilter,
    setQaFilter,
    qaSortOrder,
    setQaSortOrder,
    qaSortKey,
    setQaSortKey,
    selectedNoteIds,
    setSelectedNoteIds,
    
    // Refs
    menuRef,
    loadingStartTime,
    clearNotesInputRef,
    
    // Computed
    activeCategoryName
  };
};

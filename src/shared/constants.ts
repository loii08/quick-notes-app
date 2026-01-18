/**
 * Application-wide constants
 */

// Timing Constants (in milliseconds)
export const TIMINGS = {
  SYNC_TIMEOUT: 5000,
  TOAST_DURATION: 3000,
  LOGOUT_DURATION: 1500,
  BACK_ONLINE_BANNER_DURATION: 3000,
  MIN_LOADER_DURATION: 5000,
  UNDO_REDO_DEBOUNCE: 700,
  SCROLL_THRESHOLD: 20,
} as const;

// Time Constants
export const TIME = {
  MILLISECONDS_PER_DAY: 86400000,
  MILLISECONDS_PER_SECOND: 1000,
} as const;

// Default Values
export const DEFAULTS = {
  APP_NAME: 'Quick Notes',
  APP_SUBTITLE: 'Capture ideas instantly',
  APP_THEME: 'default' as const,
  DARK_MODE: false,
} as const;

// Default Categories
export const DEFAULT_CATEGORIES = [
  { id: 'general', name: 'General' },
  { id: 'work', name: 'Work' },
  { id: 'ideas', name: 'Ideas' },
] as const;

// Default Quick Actions
export const DEFAULT_QUICK_ACTIONS = [
  { id: 'qa1', text: 'Meeting notes', categoryId: 'work' },
  { id: 'qa2', text: 'Grocery list', categoryId: 'general' },
] as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  NOTES: 'qn_notes',
  CATEGORIES: 'qn_cats',
  QUICK_ACTIONS: 'qn_qa',
  LAST_SYNC: 'qn_last_sync',
  REMEMBER_ME: 'qn_remember',
  REMEMBER_EMAIL: 'qn_remember_email',
  SETTINGS_UPDATED: 'qn_settings_updated',
  APP_NAME: 'app_name',
  APP_SUBTITLE: 'app_subtitle',
  APP_THEME: 'app_theme',
  THEME: 'theme',
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_CATEGORY_NAME_LENGTH: 50,
  MAX_QUICK_ACTION_LENGTH: 100,
  MAX_NOTE_LENGTH: 10000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Firebase Paths
export const FIREBASE_PATHS = {
  USERS: 'users',
  NOTES: 'notes',
  CATEGORIES: 'categories',
  QUICK_ACTIONS: 'quickActions',
  SETTINGS: 'settings',
  GENERAL_SETTINGS: 'general',
} as const;

// UI Constants
export const UI = {
  SKELETON_LOADER_ITEMS: 5,
  NOTES_PER_PAGE: 20,
  MAX_TOAST_MESSAGES: 5,
} as const;

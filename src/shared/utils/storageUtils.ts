/**
 * LocalStorage utility functions
 */

import { STORAGE_KEYS } from '../constants';
import type { Note, Category, QuickAction, UnitOfMeasure } from '../types';

/**
 * Safely gets an item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed value or default
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to get storage item: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Safely sets an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 * @returns true if successful
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set storage item: ${key}`, error);
    return false;
  }
};

/**
 * Safely removes an item from localStorage
 * @param key - Storage key
 * @returns true if successful
 */
export const removeStorageItem = (key: string): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove storage item: ${key}`, error);
    return false;
  }
};

/**
 * Gets notes from localStorage
 * @returns Array of notes
 */
export const getStoredNotes = (): Note[] => {
  return getStorageItem<Note[]>(STORAGE_KEYS.NOTES, []);
};

/**
 * Saves notes to localStorage
 * @param notes - Notes to save
 * @returns true if successful
 */
export const saveStoredNotes = (notes: Note[]): boolean => {
  return setStorageItem(STORAGE_KEYS.NOTES, notes);
};

/**
 * Gets categories from localStorage
 * @returns Array of categories
 */
export const getStoredCategories = (): Category[] => {
  return getStorageItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
};

/**
 * Saves categories to localStorage
 * @param categories - Categories to save
 * @returns true if successful
 */
export const saveStoredCategories = (categories: Category[]): boolean => {
  return setStorageItem(STORAGE_KEYS.CATEGORIES, categories);
};

/**
 * Gets quick actions from localStorage
 * @returns Array of quick actions
 */
export const getStoredQuickActions = (): QuickAction[] => {
  return getStorageItem<QuickAction[]>(STORAGE_KEYS.QUICK_ACTIONS, []);
};

/**
 * Saves quick actions to localStorage
 * @param quickActions - Quick actions to save
 * @returns true if successful
 */
export const saveStoredQuickActions = (quickActions: QuickAction[]): boolean => {
  return setStorageItem(STORAGE_KEYS.QUICK_ACTIONS, quickActions);
};

/**
 * Gets last sync time from localStorage
 * @returns Last sync timestamp or null
 */
export const getLastSyncTime = (): number | null => {
  try {
    if (typeof window === 'undefined') return null;
    const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return time ? parseInt(time, 10) : null;
  } catch (error) {
    console.error('Failed to get last sync time', error);
    return null;
  }
};

/**
 * Saves last sync time to localStorage
 * @param timestamp - Sync timestamp
 * @returns true if successful
 */
export const saveLastSyncTime = (timestamp: number): boolean => {
  return setStorageItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
};

/**
 * Gets app settings from localStorage
 * @returns App settings object
 */
export const getAppSettings = () => {
  return {
    appName: getStorageItem(STORAGE_KEYS.APP_NAME, 'Quick Notes'),
    appSubtitle: getStorageItem(STORAGE_KEYS.APP_SUBTITLE, 'Capture ideas instantly'),
    appTheme: getStorageItem(STORAGE_KEYS.APP_THEME, 'default'),
    darkMode: localStorage.theme === 'dark',
  };
};

/**
 * Saves app settings to localStorage
 * @param settings - Settings to save
 * @returns true if successful
 */
export const saveAppSettings = (settings: {
  appName?: string;
  appSubtitle?: string;
  appTheme?: string;
  darkMode?: boolean;
}): boolean => {
  let success = true;
  
  if (settings.appName !== undefined) {
    success = setStorageItem(STORAGE_KEYS.APP_NAME, settings.appName) && success;
  }
  if (settings.appSubtitle !== undefined) {
    success = setStorageItem(STORAGE_KEYS.APP_SUBTITLE, settings.appSubtitle) && success;
  }
  if (settings.appTheme !== undefined) {
    success = setStorageItem(STORAGE_KEYS.APP_THEME, settings.appTheme) && success;
  }
  if (settings.darkMode !== undefined) {
    localStorage.theme = settings.darkMode ? 'dark' : 'light';
  }
  
  return success;
};

/**
 * Gets remember me preference
 * @returns true if user wants to be remembered
 */
export const getRememberMe = (): boolean => {
  return getStorageItem(STORAGE_KEYS.REMEMBER_ME, false);
};

/**
 * Gets remembered email
 * @returns Remembered email or empty string
 */
export const getRememberedEmail = (): string => {
  return getStorageItem(STORAGE_KEYS.REMEMBER_EMAIL, '');
};

/**
 * Saves remember me preference and email
 * @param rememberMe - Whether to remember
 * @param email - Email to remember
 * @returns true if successful
 */
export const saveRememberMe = (rememberMe: boolean, email: string): boolean => {
  let success = true;
  success = setStorageItem(STORAGE_KEYS.REMEMBER_ME, rememberMe) && success;
  if (rememberMe) {
    success = setStorageItem(STORAGE_KEYS.REMEMBER_EMAIL, email) && success;
  } else {
    success = removeStorageItem(STORAGE_KEYS.REMEMBER_EMAIL) && success;
  }
  return success;
};

/**
 * Gets units from localStorage
 * @returns Array of units
 */
export const getStoredUnits = (): UnitOfMeasure[] => {
  return getStorageItem<UnitOfMeasure[]>(STORAGE_KEYS.UNITS, []);
};

/**
 * Saves units to localStorage
 * @param units - Units to save
 * @returns true if successful
 */
export const saveStoredUnits = (units: UnitOfMeasure[]): boolean => {
  return setStorageItem(STORAGE_KEYS.UNITS, units);
};

/**
 * Clears all app data from localStorage
 * @returns true if successful
 */
export const clearAllStorage = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear storage', error);
    return false;
  }
};

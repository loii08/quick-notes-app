/**
 * Centralized error messages for the application
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    FIREBASE_CONFIG_MISSING: 'Firebase configuration is missing. Please check your environment variables.',
    GOOGLE_LOGIN_FAILED: 'Google login failed. Please try again.',
    EMAIL_AUTH_FAILED: 'Authentication failed. Please check your credentials.',
    EMAIL_ALREADY_IN_USE: 'This email is already registered. Please sign in instead.',
    WRONG_PASSWORD: 'Incorrect password. Please try again.',
    USER_NOT_FOUND: 'User not found. Please check your email.',
    WEAK_PASSWORD: 'Password must be at least 6 characters long.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_API_KEY: 'Invalid API key. Please check your Firebase configuration.',
    LOGOUT_FAILED: 'Failed to sign out. Please try again.',
    PASSWORD_RESET_FAILED: 'Failed to send password reset email. Please try again.',
    ENTER_EMAIL_AND_PASSWORD: 'Please enter both email and password.',
    ENTER_EMAIL_FOR_RESET: 'Please enter your email address.',
  },

  // Note errors
  NOTES: {
    ADD_FAILED: 'Failed to save note. Please try again.',
    UPDATE_FAILED: 'Failed to update note. Please try again.',
    DELETE_FAILED: 'Failed to delete note. Please try again.',
    EMPTY_NOTE: 'Please enter some text before saving.',
    LOAD_FAILED: 'Failed to load notes. Please refresh the page.',
  },

  // Category errors
  CATEGORIES: {
    ADD_FAILED: 'Failed to add category. Please try again.',
    UPDATE_FAILED: 'Failed to update category. Please try again.',
    DELETE_FAILED: 'Failed to delete category. Please try again.',
    DUPLICATE_NAME: 'A category with this name already exists.',
    OFFLINE_NOT_ALLOWED: 'Managing categories is disabled while offline.',
    EMPTY_NAME: 'Category name cannot be empty.',
  },

  // Quick Action errors
  QUICK_ACTIONS: {
    ADD_FAILED: 'Failed to add quick action. Please try again.',
    UPDATE_FAILED: 'Failed to update quick action. Please try again.',
    DELETE_FAILED: 'Failed to delete quick action. Please try again.',
    OFFLINE_NOT_ALLOWED: 'Managing quick actions is disabled while offline.',
    EMPTY_TEXT: 'Quick action text cannot be empty.',
  },

  // Settings errors
  SETTINGS: {
    SAVE_FAILED: 'Failed to save settings. Please try again.',
    LOAD_FAILED: 'Failed to load settings. Please refresh the page.',
  },

  // Sync errors
  SYNC: {
    FAILED: 'Offline sync failed. Please try again.',
    OFFLINE_CHANGES_PENDING: 'Note will be deleted when back online.',
    OFFLINE_CHANGES_SYNCED: 'Offline changes synced successfully!',
    EVERYTHING_UP_TO_DATE: 'Everything is up to date.',
  },

  // Import/Export errors
  IMPORT_EXPORT: {
    BACKUP_DOWNLOAD_SUCCESS: 'Backup downloaded successfully.',
    IMPORT_SUCCESS: 'Data imported successfully.',
    IMPORT_SYNC_SUCCESS: 'Data imported and synced to database successfully.',
    IMPORT_SYNC_FAILED: 'Data imported locally but failed to sync to database.',
    INVALID_FILE_FORMAT: 'Invalid backup file format.',
    PARSE_FAILED: 'Failed to parse backup file.',
    CONFIRM_OVERWRITE: 'This will overwrite your current data. Are you sure you want to proceed?',
  },

  // General errors
  GENERAL: {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    PLEASE_TRY_AGAIN: 'Please try again.',
    OFFLINE_MODE: 'You are currently offline.',
    BACK_ONLINE: 'Back online.',
  },
} as const;

/**
 * Get error message for Firebase auth error code
 * @param errorCode - Firebase error code
 * @returns Error message
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': ERROR_MESSAGES.AUTH.EMAIL_ALREADY_IN_USE,
    'auth/wrong-password': ERROR_MESSAGES.AUTH.WRONG_PASSWORD,
    'auth/user-not-found': ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
    'auth/weak-password': ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
    'auth/invalid-email': ERROR_MESSAGES.AUTH.INVALID_EMAIL,
    'auth/invalid-api-key': ERROR_MESSAGES.AUTH.INVALID_API_KEY,
  };

  return errorMap[errorCode] || ERROR_MESSAGES.AUTH.EMAIL_AUTH_FAILED;
};

/**
 * Get success message for an action
 * @param action - Action type
 * @returns Success message
 */
export const getSuccessMessage = (action: string): string => {
  const successMap: Record<string, string> = {
    'note-added': 'Note added',
    'note-updated': 'Note updated',
    'note-deleted': 'Note deleted',
    'category-added': 'Category added',
    'category-updated': 'Category updated',
    'category-deleted': 'Category deleted',
    'quick-action-added': 'Quick action added',
    'quick-action-updated': 'Quick action updated',
    'quick-action-deleted': 'Quick action deleted',
    'settings-saved': 'Settings saved',
    'welcome-back': 'Welcome back',
  };

  return successMap[action] || 'Success!';
};

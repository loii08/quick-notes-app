/**
 * Input validation utilities
 */

import { VALIDATION } from '../constants';

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if password meets minimum requirements
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

/**
 * Sanitizes category name
 * @param name - Category name to sanitize
 * @returns Sanitized category name
 */
export const sanitizeCategoryName = (name: string): string => {
  return name
    .trim()
    .slice(0, VALIDATION.MAX_CATEGORY_NAME_LENGTH)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Sanitizes quick action text
 * @param text - Quick action text to sanitize
 * @returns Sanitized quick action text
 */
export const sanitizeQuickActionText = (text: string): string => {
  return text
    .trim()
    .slice(0, VALIDATION.MAX_QUICK_ACTION_LENGTH)
    .replace(/[<>]/g, '');
};

/**
 * Sanitizes note content
 * @param content - Note content to sanitize
 * @returns Sanitized note content
 */
export const sanitizeNoteContent = (content: string): string => {
  return content
    .slice(0, VALIDATION.MAX_NOTE_LENGTH)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

/**
 * Validates that a string is not empty after trimming
 * @param value - String to validate
 * @returns true if string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates category name
 * @param name - Category name to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateCategoryName = (name: string): string => {
  if (!isNotEmpty(name)) {
    return 'Category name cannot be empty';
  }
  if (name.length > VALIDATION.MAX_CATEGORY_NAME_LENGTH) {
    return `Category name must be less than ${VALIDATION.MAX_CATEGORY_NAME_LENGTH} characters`;
  }
  return '';
};

/**
 * Validates quick action text
 * @param text - Quick action text to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateQuickActionText = (text: string): string => {
  if (!isNotEmpty(text)) {
    return 'Quick action text cannot be empty';
  }
  if (text.length > VALIDATION.MAX_QUICK_ACTION_LENGTH) {
    return `Quick action text must be less than ${VALIDATION.MAX_QUICK_ACTION_LENGTH} characters`;
  }
  return '';
};

/**
 * Validates note content
 * @param content - Note content to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateNoteContent = (content: string): string => {
  if (!isNotEmpty(content)) {
    return 'Note cannot be empty';
  }
  if (content.length > VALIDATION.MAX_NOTE_LENGTH) {
    return `Note must be less than ${VALIDATION.MAX_NOTE_LENGTH} characters`;
  }
  return '';
};

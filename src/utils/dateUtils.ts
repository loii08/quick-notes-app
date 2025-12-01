/**
 * Date and time utility functions
 */

import { TIMINGS, TIME } from '../constants';

/**
 * Formats a timestamp as "time ago" (e.g., "5m ago", "2h ago")
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted time ago string
 */
export const formatTimeAgo = (timestamp: number | null): string => {
  if (!timestamp) return 'never';
  
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / TIME.MILLISECONDS_PER_SECOND);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Formats a timestamp as a full date string
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export const formatHeaderDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

/**
 * Formats a timestamp as time only
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Converts a date to ISO datetime-local format for input elements
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO datetime-local string
 */
export const toDatetimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/**
 * Converts datetime-local string to timestamp
 * @param datetimeLocal - ISO datetime-local string
 * @returns Timestamp in milliseconds
 */
export const fromDatetimeLocal = (datetimeLocal: string): number => {
  return new Date(datetimeLocal).getTime();
};

/**
 * Checks if a date is today
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is today
 */
export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Checks if a date is yesterday
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is yesterday
 */
export const isYesterday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

/**
 * Gets the start of the week (Sunday)
 * @param date - Date object
 * @returns Start of week as timestamp
 */
export const getWeekStart = (date: Date): number => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
};

/**
 * Gets the end of the week (Saturday)
 * @param date - Date object
 * @returns End of week as timestamp
 */
export const getWeekEnd = (date: Date): number => {
  const end = new Date(date);
  const day = end.getDay();
  const diff = end.getDate() - day + 6;
  end.setDate(diff);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
};

/**
 * Checks if a date is in the current week
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is in current week
 */
export const isInCurrentWeek = (timestamp: number): boolean => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  return timestamp >= weekStart && timestamp <= weekEnd;
};

/**
 * Checks if a date is in the current month
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is in current month
 */
export const isInCurrentMonth = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Checks if a date is in the current year
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is in current year
 */
export const isInCurrentYear = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();
  return date.getFullYear() === today.getFullYear();
};

/**
 * Cleans a date to midnight (removes time component)
 * @param date - Date object
 * @returns Timestamp at midnight
 */
export const cleanDate = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

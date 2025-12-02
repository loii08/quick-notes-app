/**
 * Gets today's date as a string in 'YYYY-MM-DD' format.
 * @returns The formatted date string.
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};
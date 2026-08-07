/**
 * Central Financial Year Configuration for Frontend
 * Available years: 2026, 2027, 2028, 2029, 2030 (scalable for future years)
 */
export const START_YEAR = 2026;
export const END_YEAR = 2030;

export const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i
);

export const DEFAULT_YEAR = new Date().getFullYear() < START_YEAR ? START_YEAR : new Date().getFullYear();

/**
 * Production API & Asset URL Helpers
 */
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = API_URL.replace(/\/api\/?$/, '');
  return `${apiBase}${path.startsWith('/') ? '' : '/'}${path}`;
};

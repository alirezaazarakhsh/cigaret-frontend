/**
 * Central API Configuration for Django Backend Connection.
 * Modify `DEFAULT_BASE_URL` or use `setApiBaseUrl()` to dynamically point all API requests.
 */

const STORAGE_KEY_BASE_URL = 'sevin_api_base_url';
export const DEFAULT_BASE_URL = 'https://api.sevin-smoke.ir/api/v1';

/**
 * Retrieves the current configured API Base URL from localStorage or returns default.
 */
export function getApiBaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BASE_URL);
    if (saved && saved.trim() !== '') {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // LocalStorage fallback
  }
  return DEFAULT_BASE_URL;
}

/**
 * Sets a new API Base URL globally across the application.
 */
export function setApiBaseUrl(url: string): void {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
  } catch (e) {
    console.error('Failed to store API Base URL:', e);
  }
}

/**
 * Helper to build a full URL string given a path.
 * Example: `buildApiUrl('/products/')` => `https://api.sevin-smoke.ir/api/v1/products/`
 */
export function buildApiUrl(endpointPath: string): string {
  const base = getApiBaseUrl();
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${base}${cleanPath}`;
}

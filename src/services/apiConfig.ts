/**
 * Central API & App URL Configuration for Sevin Wholesale.
 * Supports environment variables, dynamic localStorage overrides, and connection status checking.
 */

const STORAGE_KEY_BASE_URL = 'sevin_api_base_url';
const STORAGE_KEY_API_TOKEN = 'sevin_api_token';
const STORAGE_KEY_WEB_APP_URL = 'sevin_web_app_url';

// Default Vercel production frontend URL
export const DEFAULT_WEB_APP_URL = 'https://cigaretsevin.vercel.app';

// Default Backend API Base URL (Django / Node / Express / FastAPI)
export const DEFAULT_API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'https://cigar.sevinhost.ir/api/v1';

export const DEFAULT_BASE_URL = DEFAULT_API_BASE_URL;

/**
 * Retrieves the current configured API Base URL.
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

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '');
  }

  return DEFAULT_API_BASE_URL.replace(/\/+$/, '');
}

/**
 * Sets a new API Base URL globally across the application.
 */
export function setApiBaseUrl(url: string): void {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
    window.dispatchEvent(new CustomEvent('sevin-api-url-changed', { detail: { url: cleanUrl } }));
  } catch (e) {
    console.error('Failed to store API Base URL:', e);
  }
}

/**
 * Retrieves the API Authentication Token (Bearer / Token).
 */
export function getApiToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_API_TOKEN) || '';
  } catch {
    return '';
  }
}

/**
 * Sets the API Authentication Token.
 */
export function setApiToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_API_TOKEN, token.trim());
    window.dispatchEvent(new CustomEvent('sevin-api-token-changed', { detail: { token: token.trim() } }));
  } catch (e) {
    console.error('Failed to store API Token:', e);
  }
}

/**
 * Retrieves the Web App URL (defaults to https://cigaretsevin.vercel.app).
 */
export function getWebAppBaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEB_APP_URL);
    if (saved && saved.trim() !== '') {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {}

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.trim().replace(/\/+$/, '');
  }

  // If running in browser on a custom vercel/live domain, we can prioritize the production link
  return DEFAULT_WEB_APP_URL;
}

/**
 * Sets a new Web App URL (for custom domains).
 */
export function setWebAppBaseUrl(url: string): void {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_WEB_APP_URL, cleanUrl);
  } catch (e) {
    console.error('Failed to store Web App URL:', e);
  }
}

/**
 * Generates customer web app link for POS / visitor sharing.
 */
export function getCustomerPortalUrl(customerId: string, phone?: string): string {
  const base = getWebAppBaseUrl();
  const phoneParam = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  return `${base}/app/c/${encodeURIComponent(customerId)}${phoneParam}`;
}

/**
 * Helper to build a full endpoint URL given a path.
 */
export function buildApiUrl(endpointPath: string): string {
  const base = getApiBaseUrl();
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${base}${cleanPath}`;
}

/**
 * Tests live connectivity to the configured API Base URL.
 */
export async function testApiConnection(customUrl?: string, customToken?: string): Promise<{
  connected: boolean;
  status: number;
  message: string;
  latencyMs: number;
}> {
  const urlToTest = (customUrl || getApiBaseUrl()).replace(/\/+$/, '');
  const token = customToken !== undefined ? customToken : getApiToken();

  const startTime = Date.now();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // Test live endpoint (footer-settings or products/list/)
    let response = await fetch(`${urlToTest}/footer-settings/settings/`, {
      method: 'GET',
      headers,
      signal: controller.signal
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(`${urlToTest}/products/list/`, {
        method: 'GET',
        headers,
        signal: controller.signal
      }).catch(() => null);
    }

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response) {
      if (response.ok) {
        return {
          connected: true,
          status: response.status,
          message: 'ارتباط با سرور بک‌اند با موفقیت برقرار است.',
          latencyMs,
        };
      } else {
        return {
          connected: false,
          status: response.status,
          message: `سرور پاسخ داد ولی با وضعیت خطا (${response.status}: ${response.statusText})`,
          latencyMs,
        };
      }
    }
  } catch (err: any) {
    // Network / CORS / offline
  }

  return {
    connected: false,
    status: 0,
    message: 'امکان اتصال به سرور بک‌اند وجود ندارد (سرور هنوز در دسترس نیست یا خطای شبکه/CORS).',
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Unified HTTP API Client for Sevin Wholesale Backend Integration.
 * Enforces strict zero-cache policy (no-store, timestamps) to prevent stale/cached responses.
 */

import { getApiBaseUrl, getApiToken, setApiToken } from './apiConfig';
import { invalidatePosTokenAndSession } from './sessionSecurity';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: any;
  status: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
  skipAuth?: boolean;
  skipCacheBuster?: boolean;
  _isRetry?: boolean;
}

export const DEFAULT_NO_CACHE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store', // Crucial: forces browser & edge to bypass HTTP cache
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function request<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Add automatic cache-busting timestamp to GET requests to guarantee zero stale cache
  let finalEndpoint = cleanEndpoint;
  if (method === 'GET' && !options.skipCacheBuster) {
    const separator = finalEndpoint.includes('?') ? '&' : '?';
    finalEndpoint = `${finalEndpoint}${separator}_nocache=${Date.now()}`;
  }

  const fullUrl = `${baseUrl}${finalEndpoint}`;
  const token = options.token !== undefined ? options.token : getApiToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...DEFAULT_NO_CACHE_HEADERS,
    ...(options.headers || {}),
  };

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !options.skipAuth) {
    // Standard Bearer or Token header
    headers['Authorization'] = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const reqInit: RequestInit = {
    method,
    headers,
    cache: 'no-store', // Disallow caching across all browser fetch calls
  };

  if (body !== undefined && method !== 'GET') {
    if (body instanceof FormData) {
      reqInit.body = body;
    } else {
      reqInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  const parseResponse = async (response: Response): Promise<ApiResponse<T>> => {
    let responseData: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => null);
    }

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        status: response.status,
      };
    } else {
      // If token expired or invalid, try to refresh it silently using the refresh token first!
      if (response.status === 401 && responseData?.code === 'token_not_valid' && !options._isRetry) {
        const storedRefreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('sevin_refresh_token') : null;
        if (storedRefreshToken) {
          try {
            const baseUrl = getApiBaseUrl();
            const rootBase = baseUrl.replace(/\/api\/v1\/?$/, '');
            const refreshUrl = `${rootBase}/api/v1/accounts/token/refresh/`;
            const refreshRes = await fetch(refreshUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: storedRefreshToken }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newAccessToken = refreshData?.access;
              if (newAccessToken) {
                // Save new access token
                setApiToken(newAccessToken);
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('sevin_api_token', newAccessToken);
                  // Also extend the session security expires_at time in localStorage
                  localStorage.setItem('sovin_pos_session_expires_at', String(Date.now() + 30 * 60 * 1000));
                }
                // Retry the original request with the new token
                const retryHeaders = { ...headers, 'Authorization': `Bearer ${newAccessToken}` };
                const retryInit: RequestInit = {
                  ...reqInit,
                  headers: retryHeaders,
                };
                options._isRetry = true;
                const retryRes = await fetchWithTimeout(fullUrl, retryInit, options.timeoutMs || 60000);
                return await parseResponse(retryRes);
              }
            }
          } catch (err) {
            console.error('Silent token refresh failed:', err);
          }
        }

        try {
          invalidatePosTokenAndSession('token_invalid_or_expired');
        } catch {}
        try {
          const fallbackHeaders = { ...headers };
          delete fallbackHeaders['Authorization'];
          const fallbackInit: RequestInit = {
            ...reqInit,
            headers: fallbackHeaders,
          };
          const fallbackRes = await fetchWithTimeout(fullUrl, fallbackInit, options.timeoutMs || 60000);
          return await parseResponse(fallbackRes);
        } catch {
          // Fall through
        }
      }

      return {
        success: false,
        data: responseData,
        error: responseData?.detail || responseData?.message || response.statusText,
        status: response.status,
      };
    }
  };

  try {
    const response = await fetchWithTimeout(fullUrl, reqInit, options.timeoutMs || 60000);
    return await parseResponse(response);
  } catch (error: any) {
    // If the request fails (e.g. cross-origin CORS preflight rejection when custom headers like Cache-Control are sent),
    // automatically retry once with minimal headers to ensure zero downtime for the user
    if (headers['Cache-Control'] && !options._isRetry) {
      try {
        const fallbackHeaders = { ...headers };
        delete fallbackHeaders['Cache-Control'];
        delete fallbackHeaders['Pragma'];
        delete fallbackHeaders['Expires'];
        const fallbackInit: RequestInit = {
          ...reqInit,
          headers: fallbackHeaders,
        };
        const fallbackRes = await fetchWithTimeout(fullUrl, fallbackInit, options.timeoutMs || 60000);
        return await parseResponse(fallbackRes);
      } catch {
        // Fall through to standard error handling
      }
    }

    return {
      success: false,
      data: null as any,
      error: error?.name === 'AbortError' ? 'مهلت زمان درخواست به پایان رسید (Timeout)' : (error?.message || 'خطای برقراری ارتباط با سرور'),
      status: 0,
    };
  }
}

export const httpClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'GET', undefined, options),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => request<T>(endpoint, 'POST', body, options),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => request<T>(endpoint, 'PUT', body, options),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => request<T>(endpoint, 'PATCH', body, options),
  delete: <T = any>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, 'DELETE', undefined, options),
};

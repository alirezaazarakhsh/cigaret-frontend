/**
 * Unified HTTP API Client for Sevin Wholesale Backend Integration.
 */

import { getApiBaseUrl, getApiToken } from './apiConfig';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: any;
  status: number;
}

interface RequestOptions {
  headers?: Record<string, string>;
  token?: string;
  timeoutMs?: number;
  skipAuth?: boolean;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
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
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const token = options.token !== undefined ? options.token : getApiToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (method === 'GET') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  if (token && !options.skipAuth) {
    // Standard Bearer or Token header
    headers['Authorization'] = token.startsWith('Token ') || token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const reqInit: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== 'GET') {
    reqInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetchWithTimeout(fullUrl, reqInit, options.timeoutMs || 8000);
    
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
      return {
        success: false,
        data: responseData,
        error: responseData?.detail || responseData?.message || response.statusText,
        status: response.status,
      };
    }
  } catch (error: any) {
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

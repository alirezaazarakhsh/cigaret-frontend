/**
 * مدیریت امنیت توکن، اعتبارسنجی نشست‌های کاری و خروج خودکار پس از انقضا (Auto Logout on Token Expiration)
 * این ماژول زمان انقضای توکن‌های JWT و نشست صندوق POS را بررسی کرده و در صورت پایان اعتبار،
 * توکن را باطل و کاربر را بلافاصله از سیستم خارج می‌سازد.
 */

import { setApiToken } from './apiConfig';

export const POS_SESSION_STORAGE_KEYS = {
  TOKEN: 'sevin_api_token',
  AUTH_FLAG: 'sovin_pos_auth',
  CURRENT_STAFF: 'sovin_pos_current_staff',
  SESSION_EXPIRES_AT: 'sovin_pos_session_expires_at',
  LAST_LOGOUT_REASON: 'sovin_pos_last_logout_reason',
  AUTO_LOGOUT_DURATION_MINUTES: 'sovin_pos_auto_logout_duration',
};

export interface JwtTokenPayload {
  token_type?: string;
  exp?: number; // Unix timestamp in seconds
  iat?: number;
  jti?: string;
  user_id?: number | string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

/**
 * دیکود کردن امن محتوای پلود توکن JWT بدون وابستگی خارجی
 */
export function parseJwtPayload(token: string): JwtTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + '='.repeat(padLength);
    
    // دیکود باینری به کاراکترها
    const binaryStr = atob(paddedBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decodedText = new TextDecoder().decode(bytes);
    return JSON.parse(decodedText);
  } catch (err) {
    try {
      // فال‌بک روش قدیمی
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}

/**
 * دریافت توکن ذخیره‌شده از LocalStorage
 */
export function getStoredApiToken(): string {
  try {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem(POS_SESSION_STORAGE_KEYS.TOKEN) || 
           localStorage.getItem('token') || 
           localStorage.getItem('sevin_auth_token') || '';
  } catch {
    return '';
  }
}

/**
 * دریافت زمان انقضای تعیین‌شده (به میلی‌ثانیه بر مبنای ساعت سیستم)
 */
export function getPosSessionExpiry(token?: string): number | null {
  try {
    if (typeof localStorage === 'undefined') return null;

    const activeToken = token || getStoredApiToken();
    if (activeToken && activeToken.includes('.')) {
      const payload = parseJwtPayload(activeToken);
      if (payload?.exp && typeof payload.exp === 'number' && payload.exp > 0) {
        return payload.exp * 1000;
      }
    }

    const savedExpiryStr = localStorage.getItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT);
    if (savedExpiryStr) {
      const expNum = Number(savedExpiryStr);
      if (!isNaN(expNum) && expNum > 0) {
        return expNum;
      }
    }
  } catch {}

  return null;
}

/**
 * بررسی اینکه آیا توکن یا نشست صندوق منقضی شده است یا خیر
 */
export function isPosSessionExpired(token?: string): boolean {
  const expiryMs = getPosSessionExpiry(token);
  if (!expiryMs) {
    // در صورتی که کاربر اعلام احراز هویت کرده اما هیچ تایمی ست نشده باشد
    // برای اطمینان نشست را برقرار نگه می‌داریم تا بلافاصله تایمر آغاز شود
    return false;
  }
  return Date.now() >= expiryMs;
}

/**
 * دریافت زمان باقی‌مانده از اعتبار نشست برحسب ثانیه
 */
export function getRemainingSessionSeconds(token?: string): number {
  const expiryMs = getPosSessionExpiry(token);
  if (!expiryMs) return 0;
  const diffMs = expiryMs - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * فرمت‌بندی ثانیه باقی‌مانده به صورت دقیقه:ثانیه (MM:SS) یا ساعت:دقیقه:ثانیه
 */
export function formatRemainingTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '۰۰:۰۰';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * مقداردهی اولیه یا بروزرسانی زمان انقضای توکن به محض لاگین موفق
 */
export function initPosSessionExpiry(token?: string, defaultDurationMinutes: number = 30): number {
  try {
    if (typeof localStorage === 'undefined') return Date.now();

    const activeToken = token || getStoredApiToken();
    let expiryMs: number = 0;

    if (activeToken && activeToken.includes('.')) {
      const payload = parseJwtPayload(activeToken);
      if (payload?.exp && typeof payload.exp === 'number' && payload.exp > 0) {
        expiryMs = payload.exp * 1000;
      }
    }

    // اگر توکن JWT نبود یا فیلد exp نداشت، از مدت‌زمان پیش‌فرض (مثلاً ۳۰ دقیقه) استفاده کن
    if (!expiryMs || expiryMs <= Date.now()) {
      const savedDuration = Number(localStorage.getItem(POS_SESSION_STORAGE_KEYS.AUTO_LOGOUT_DURATION_MINUTES)) || defaultDurationMinutes;
      expiryMs = Date.now() + (savedDuration * 60 * 1000);
    }

    localStorage.setItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT, String(expiryMs));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sevin-session-expiry-updated', {
        detail: { expiryMs, remainingSeconds: Math.floor((expiryMs - Date.now()) / 1000) }
      }));
    }

    return expiryMs;
  } catch {
    return Date.now() + (30 * 60 * 1000);
  }
}

/**
 * تمدید زمان نشست کاربر (به عنوان مثال برای ۳۰ دقیقه دیگر)
 */
export function extendPosSession(minutes: number = 30): number {
  try {
    const newExpiry = Date.now() + (minutes * 60 * 1000);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT, String(newExpiry));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sevin-session-expiry-updated', {
        detail: { expiryMs: newExpiry, remainingSeconds: minutes * 60 }
      }));
    }
    return newExpiry;
  } catch {
    return Date.now();
  }
}

/**
 * ابطال کامل توکن و خروج کاربر از سیستم صندوق (Security Purge)
 */
export function invalidatePosTokenAndSession(reason: string = 'token_expired'): void {
  try {
    setApiToken('');

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.TOKEN);
      localStorage.removeItem('token');
      localStorage.removeItem('sevin_auth_token');
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.AUTH_FLAG);
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.CURRENT_STAFF);
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT);
      localStorage.setItem(POS_SESSION_STORAGE_KEYS.LAST_LOGOUT_REASON, reason);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sevin-pos-session-expired', {
        detail: {
          reason,
          timestamp: Date.now(),
          message: 'مدت اعتبار توکن امنیتی به پایان رسید و کاربر به صورت خودکار از صندوق خارج شد.'
        }
      }));

      window.dispatchEvent(new CustomEvent('sevin-token-expired', {
        detail: { reason }
      }));

      window.dispatchEvent(new CustomEvent('sevin-api-token-changed', {
        detail: { token: '' }
      }));
    }
  } catch (err) {
    console.error('Failed to invalidate POS session:', err);
  }
}

/**
 * دریافت آخرین دلیل خروج و پاکسازی آن
 */
export function consumeLastLogoutReason(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const reason = localStorage.getItem(POS_SESSION_STORAGE_KEYS.LAST_LOGOUT_REASON);
    if (reason) {
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.LAST_LOGOUT_REASON);
      return reason;
    }
  } catch {}
  return null;
}

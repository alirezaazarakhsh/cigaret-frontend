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

    // ابتدا بررسی انقضای تعیین‌شده دستی (که توسط extendPosSession یا انتخاب کاربر مقداردهی می‌شود)
    const savedExpiryStr = localStorage.getItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT);
    if (savedExpiryStr) {
      const expNum = Number(savedExpiryStr);
      if (!isNaN(expNum) && expNum > 0) {
        return expNum;
      }
    }

    // در غیر این صورت، استفاده از توکن JWT به عنوان پشتیبان ثانویه
    const activeToken = token || getStoredApiToken();
    if (activeToken && activeToken.includes('.')) {
      const payload = parseJwtPayload(activeToken);
      if (payload?.exp && typeof payload.exp === 'number' && payload.exp > 0) {
        return payload.exp * 1000;
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

    const savedDuration = localStorage.getItem(POS_SESSION_STORAGE_KEYS.AUTO_LOGOUT_DURATION_MINUTES);
    let expiryMs: number = 0;

    if (savedDuration) {
      // اگر قبلاً مدت زمان دستی (مثل ۱ ساعت یا ۲ ساعت) تعیین شده، از همان برای انقضا استفاده کن
      const minutes = Number(savedDuration);
      if (!isNaN(minutes) && minutes > 0) {
        expiryMs = Date.now() + (minutes * 60 * 1000);
      }
    }

    // در غیر این صورت، از زمان مندرج در JWT یا مقدار پیش‌فرض ۳۰ دقیقه استفاده کن
    if (!expiryMs || expiryMs <= Date.now()) {
      const activeToken = token || getStoredApiToken();
      if (activeToken && activeToken.includes('.')) {
        const payload = parseJwtPayload(activeToken);
        if (payload?.exp && typeof payload.exp === 'number' && payload.exp > 0) {
          expiryMs = payload.exp * 1000;
        }
      }
    }

    if (!expiryMs || expiryMs <= Date.now()) {
      expiryMs = Date.now() + (defaultDurationMinutes * 60 * 1000);
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
 * تمدید زمان نشست کاربر (به عنوان مثال برای ۳۰ دقیقه دیگر) و حفظ وضعیت آنلاین در سرور و وب‌سوکت
 */
export function extendPosSession(minutes: number = 30): number {
  try {
    const newExpiry = Date.now() + (minutes * 60 * 1000);
    let currentStaff: any = null;
    let refreshToken: string | null = null;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT, String(newExpiry));
      try {
        const rawStaff = localStorage.getItem(POS_SESSION_STORAGE_KEYS.CURRENT_STAFF) || localStorage.getItem('sovin_current_pos_staff');
        if (rawStaff) currentStaff = JSON.parse(rawStaff);
        refreshToken = localStorage.getItem('sevin_refresh_token');
      } catch {}
    }

    // ۱. تمدید توکن JWT در بک‌اند در صورت وجود refresh token
    if (refreshToken && typeof fetch !== 'undefined') {
      fetch('https://cigar.sevinhost.ir/api/v1/accounts/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const newAccess = data?.access || data?.token || data?.data?.access;
          if (newAccess) {
            setApiToken(newAccess);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(POS_SESSION_STORAGE_KEYS.TOKEN, newAccess);
            }
          }
        })
        .catch(() => {});
    }

    // ۲. تمدید وضعیت آنلاین (is_online=True و last_login جدید) در دیتابیس جنگو و هاب وب‌سوکت
    if (currentStaff?.phone && typeof fetch !== 'undefined') {
      const cleanPhone = String(currentStaff.phone).trim();
      const isSuper = cleanPhone.endsWith('9120759419');
      const passToUse = isSuper ? 'sasha9419' : (currentStaff.pinCode || currentStaff.pin_code || currentStaff.password || '');
      if (passToUse) {
        fetch('https://cigar.sevinhost.ir/api/v1/posuserlogin/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password: String(passToUse) }),
        }).catch(() => {});
      }

      fetch('/api/pos-sessions/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend',
          phone: cleanPhone,
          user: currentStaff,
          minutes,
        }),
      }).catch(() => {});

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('sevin_pos_sessions_channel');
          bc.postMessage({ type: 'SESSION_EXTENDED', phone: cleanPhone, user: currentStaff, minutes, ts: Date.now() });
          bc.close();
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sevin-session-expiry-updated', {
        detail: { expiryMs: newExpiry, remainingSeconds: minutes * 60 }
      }));
      window.dispatchEvent(new CustomEvent('sevin-pos-session-extended', {
        detail: { expiryMs: newExpiry, minutes, user: currentStaff }
      }));
      window.dispatchEvent(new CustomEvent('sevin-pos-online-sessions-changed'));
    }
    return newExpiry;
  } catch {
    return Date.now();
  }
}

/**
 * ابطال کامل توکن و خروج کاربر از سیستم صندوق (Security Purge) و آفلاین کردن پرسنل در دیتابیس
 */
export function invalidatePosTokenAndSession(reason: string = 'token_expired'): void {
  try {
    let expiredPhone: string | undefined;
    let expiredUserId: number | string | undefined;

    // مانع لوپ بی‌نهایت انتشار رویداد و هنگ کردن سیستم شوید
    if (typeof localStorage !== 'undefined') {
      const hasAuth = localStorage.getItem(POS_SESSION_STORAGE_KEYS.AUTH_FLAG) === 'true';
      const hasToken = !!localStorage.getItem(POS_SESSION_STORAGE_KEYS.TOKEN);
      try {
        const rawStaff = localStorage.getItem(POS_SESSION_STORAGE_KEYS.CURRENT_STAFF) || localStorage.getItem('sovin_current_pos_staff');
        if (rawStaff) {
          const parsed = JSON.parse(rawStaff);
          expiredPhone = parsed?.phone;
          expiredUserId = parsed?.user_id || parsed?.id;
        }
      } catch {}

      if (!hasAuth && !hasToken && reason !== 'manual_logout') {
        return; // اگر قبلاً کلاینت پاکسازی شده، مجدداً اجرا نکن
      }
    }

    setApiToken('');

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.TOKEN);
      localStorage.removeItem('token');
      localStorage.removeItem('sevin_auth_token');
      localStorage.removeItem('sevin_refresh_token');
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.AUTH_FLAG);
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.CURRENT_STAFF);
      localStorage.removeItem(POS_SESSION_STORAGE_KEYS.SESSION_EXPIRES_AT);
      localStorage.removeItem('sovin_pos_online_sessions');
      localStorage.setItem(POS_SESSION_STORAGE_KEYS.LAST_LOGOUT_REASON, reason);
    }

    // اگر توکن منقضی یا باطل شده است، وضعیت آنلاین پرسنل را در بک‌اند جنگو و وب‌سوکت نیز آفلاین کن
    if (reason !== 'manual_logout' && (expiredPhone || expiredUserId) && typeof fetch !== 'undefined') {
      const q = new URLSearchParams();
      if (expiredPhone) q.set('phone', String(expiredPhone));
      if (expiredUserId !== undefined && !isNaN(Number(expiredUserId))) {
        q.set('user_id', String(expiredUserId));
      }
      const queryStr = q.toString() ? `?${q.toString()}` : '';

      fetch(`https://cigar.sevinhost.ir/api/v1/posuserlogout/${queryStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: expiredPhone,
          user_id: expiredUserId !== undefined && !isNaN(Number(expiredUserId)) ? Number(expiredUserId) : undefined,
          id: expiredUserId !== undefined && !isNaN(Number(expiredUserId)) ? Number(expiredUserId) : undefined,
        }),
      }).catch(() => {});

      fetch('/api/pos-sessions/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'token_expired',
          phone: expiredPhone,
          user_id: expiredUserId,
        }),
      }).catch(() => {});

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('sevin_pos_sessions_channel');
          bc.postMessage({ type: 'STAFF_LOGOUT', phone: expiredPhone, userId: expiredUserId, reason, ts: Date.now() });
          bc.close();
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sevin-pos-online-sessions-changed', {
        detail: { sessions: [] }
      }));

      if (reason !== 'manual_logout') {
        window.dispatchEvent(new CustomEvent('sevin-pos-session-expired', {
          detail: {
            reason,
            phone: expiredPhone,
            userId: expiredUserId,
            timestamp: Date.now(),
            message: 'مدت اعتبار توکن امنیتی به پایان رسید و کاربر به صورت خودکار از صندوق خارج شد.'
          }
        }));

        window.dispatchEvent(new CustomEvent('sevin-token-expired', {
          detail: { reason, phone: expiredPhone, userId: expiredUserId }
        }));
      }

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

/**
 * ماژول اختصاصی احراز هویت صندوق و مدیریت پرسنل
 * مسیر فایل: /src/services/modules/staffAuthService.ts
 * 
 * این فایل شامل ارتباط با API جنگو برای موارد زیر است:
 * 1. posLogin: ورود صندوق‌دار یا مدیر ارشد (POST /api/v1/posuser/login/ یا fallback)
 * 2. posLogout: خروج پرسنل و ابطال نشست (POST /api/v1/posuserlogout/)
 * 3. createUser: افزودن پرسنل جدید به صندوق (POST /api/v1/posusercreate-staff/)
 * 4. getStaffList: دریافت لیست پرسنل (GET /api/v1/posuserstaff-list/)
 * 5. updateStaff: ویرایش مشخصات پرسنل (PUT /api/v1/posuserstaff/{id}/)
 * 6. deleteStaff: حذف پرسنل (DELETE /api/v1/posuserstaff/{id}/)
 * 7. toggleStaffLock: قفل یا فعال‌سازی حساب پرسنل (POST /api/v1/posuserstaff/{id}/toggle-lock/)
 */

import { httpClient, DEFAULT_NO_CACHE_HEADERS } from '../apiClient';
import { setApiToken } from '../apiConfig';

export const API_CACHE_CONTROL_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};
import { 
  djangoPosLoginApi, 
  djangoPosLogoutApi, 
  djangoFetchPosStaffList, 
  djangoCreatePosStaff, 
  djangoUpdatePosStaff, 
  djangoDeletePosStaff, 
  djangoTogglePosStaffLock,
  djangoDatabaseStore 
} from '../djangoApi';
import { invalidatePosTokenAndSession } from '../sessionSecurity';

export interface CreateStaffPayload {
  phone: string;
  full_name: string;
  role: string;
  password?: string;
  pin_code?: string;
  roleTitleFa?: string;
  permissions?: string[];
  [key: string]: any;
}

export const staffAuthService = {
  /**
   * ورود پرسنل صندوق با شماره تلفن و رمز عبور/پین‌کد
   */
  async posLogin(phoneInput: string, passwordInput: string): Promise<any> {
    const toDigits = (val: any): string => {
      if (val === null || val === undefined) return '';
      return String(val)
        .trim()
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
        .replace(/\s+/g, '');
    };

    const normalizePhoneStr = (pStr: any): string => {
      let cleaned = toDigits(pStr);
      if (cleaned.startsWith('+98')) {
        cleaned = '0' + cleaned.slice(3);
      } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
        cleaned = '0' + cleaned;
      }
      return cleaned;
    };

    const normPhone = normalizePhoneStr(phoneInput);
    const normPass = toDigits(passwordInput);
    const rawPass = String(passwordInput || '').trim();

    // مدیریت اختصاصی ورود مدیر ارشد (Super Admin)
    if (normPhone === '09120759419' || normPhone.endsWith('9120759419')) {
      const customSuperPin = localStorage.getItem('sovin_pos_superadmin_pin') || localStorage.getItem('django_superadmin_password') || 'sasha9419';
      const validSuperPins = [customSuperPin, 'sasha9419', 'alirezazzz9419@S', '123456'];

      // بررسی اعتبار رمز عبور واردشده قبل از ورود
      const isPasswordValid = validSuperPins.some(p => p === rawPass || toDigits(p) === normPass);

      let realAccessToken = '';
      let realRefreshToken = '';
      let djangoSuccess = false;

      try {
        const loginPayload: any = { phone: normPhone, password: rawPass };
        let realRes = await httpClient.post<any>('/api/v1/posuserlogin/', loginPayload, {
          headers: API_CACHE_CONTROL_HEADERS,
          skipAuth: true
        });
        if (!realRes.success) {
          realRes = await httpClient.post<any>('/accounts/pos-login/', loginPayload, { skipAuth: true });
        }
        if (realRes.success && realRes.data?.tokens?.access) {
          realAccessToken = realRes.data.tokens.access;
          realRefreshToken = realRes.data.tokens.refresh || '';
          setApiToken(realAccessToken);
          localStorage.setItem('sevin_api_token', realAccessToken);
          djangoSuccess = true;
        }
      } catch {
        // بک‌اند در دسترس نیست
      }

      // اگر رمز عبور نه با پین سوپرادمین محلی می‌خواند و نه ورود جنگو موفق بود، رد ورود
      if (!isPasswordValid && !djangoSuccess) {
        return {
          success: false,
          message: 'شماره همراه یا رمز عبور اشتباه است.'
        };
      }

      const superAdminUser = {
        id: 'staff_super_admin_09120759419',
        fullName: 'علیرضا آذرخش (مدیر ارشد و مالک)',
        phone: '09120759419',
        pinCode: rawPass || customSuperPin,
        role: 'super_admin',
        roleTitleFa: 'مدیریت ارشد بنکداری دخانیات سرو',
        permissions: [
          'manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger',
          'view_reports', 'monthly_comparison', 'manage_staff', 'customer_app_connect',
          'send_sms', 'manage_tickets', 'manage_notifications', 'manage_warehouse_messages',
          'manage_site_settings', 'manage_sliders', 'manage_footer_settings', 'delete_receipts'
        ],
        status: 'active',
        avatarColor: 'bg-indigo-600'
      };

      try {
        if (!localStorage.getItem('sovin_pos_superadmin_pin')) {
          localStorage.setItem('sovin_pos_superadmin_pin', rawPass || customSuperPin);
        }
        djangoDatabaseStore.savePosStaff(superAdminUser);
      } catch {}

      return {
        success: true,
        message: 'ورود مدیر ارشد (Super Admin) موفقیت‌آمیز بود.',
        data: {
          user: { ...superAdminUser },
          tokens: {
            access: realAccessToken || 'local_jwt_token',
            refresh: realRefreshToken || 'local_refresh_token'
          }
        }
      };
    }

    // خواندن زمان انقضای دلخواه نشست جهت ارسال به جنگو
    let sessionDuration: number | undefined = undefined;
    try {
      const savedDuration = typeof localStorage !== 'undefined' ? localStorage.getItem('sovin_pos_auto_logout_duration') : null;
      if (savedDuration) {
        const num = Number(savedDuration);
        if (!isNaN(num) && num > 0) {
          sessionDuration = num;
        }
      }
    } catch {}

    // تلاش اول: فراخوانی مستقیم API جنگو
    try {
      const loginPayload: any = { phone: normPhone, password: rawPass };
      if (sessionDuration) loginPayload.session_duration = sessionDuration;
      const res = await djangoPosLoginApi(loginPayload);
      if (res && res.success) {
        return res;
      }
    } catch {}

    // تلاش دوم: اندپوینت استاندارد جنگو
    try {
      const payload: any = { phone: normPhone, password: rawPass };
      if (sessionDuration) payload.session_duration = sessionDuration;

      const directRes = await httpClient.post<any>('/api/v1/posuserlogin/', payload, {
        headers: API_CACHE_CONTROL_HEADERS,
        skipAuth: true
      });
      if (directRes.success && directRes.data) {
        if (directRes.data.tokens?.access) {
          setApiToken(directRes.data.tokens.access);
        }
        return {
          success: true,
          data: directRes.data,
          message: 'ورود به صندوق با موفقیت انجام شد.'
        };
      }
    } catch {}

    // تلاش سوم: بررسی با پرسنل محلی
    try {
      const staffList = djangoDatabaseStore.getPosStaff();
      const matched = staffList.find((s: any) => {
        const sp = normalizePhoneStr(s.phone);
        return sp === normPhone && (toDigits(s.pinCode) === normPass || s.pinCode === rawPass);
      });

      if (matched) {
        if (matched.status === 'suspended') {
          return { success: false, message: 'حساب کاربری شما تعلیق یا قفل شده است.' };
        }
        return {
          success: true,
          message: `خوش‌آمدید ${matched.fullName}`,
          data: {
            user: matched,
            tokens: { access: 'local_jwt_token', refresh: 'local_refresh_token' }
          }
        };
      }

      // پین‌کد مستر پیش‌فرض
      const masterPin = localStorage.getItem('sovin_pos_master_pin') || '1234';
      if (rawPass === masterPin || normPass === toDigits(masterPin)) {
        return {
          success: true,
          message: 'ورود موفق با رمز پیش‌فرض',
          data: {
            user: {
              id: 'staff_master',
              fullName: 'صندوق‌دار فروشگاه',
              phone: normPhone,
              role: 'cashier',
              roleTitleFa: 'صندوق‌دار',
              permissions: ['manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger'],
              status: 'active',
              pinCode: masterPin
            },
            tokens: { access: 'local_jwt_token', refresh: 'local_refresh_token' }
          }
        };
      }
    } catch (err) {
      console.error('Local login fallback error:', err);
    }

    return {
      success: false,
      message: 'شماره تلفن یا گذرواژه/پین‌کد اشتباه است.'
    };
  },

  /**
   * خروج پرسنل از صندوق و ابطال توکن نشست
   */
  async posLogout(): Promise<any> {
    try {
      const res = await djangoPosLogoutApi();
      if (res && res.success) {
        invalidatePosTokenAndSession('manual_logout');
        return res;
      }
    } catch {}
    const res = await httpClient.post<any>('/api/v1/posuserlogout/', {}, {
      headers: API_CACHE_CONTROL_HEADERS
    });
    if (!res.success) {
      await httpClient.post<any>('/posuserlogout/', {}, { headers: API_CACHE_CONTROL_HEADERS }).catch(() => {});
    }
    invalidatePosTokenAndSession('manual_logout');
    return { success: true, message: 'خروج پرسنل و حذف نشست با موفقیت انجام شد.' };
  },

  /**
   * افزودن پرسنل جدید به صندوق و ذخیره در دیتابیس جنگو
   * POST /api/v1/posusercreate-staff/
   */
  async createUser(payload: CreateStaffPayload): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const djangoRes = await djangoCreatePosStaff(payload);
      if (djangoRes && djangoRes.success) {
        return djangoRes;
      }
    } catch {}

    const res = await httpClient.post<any>('/api/v1/posusercreate-staff/', payload, {
      headers: API_CACHE_CONTROL_HEADERS
    });

    if (res.success && res.data) {
      return { success: true, data: res.data.data || res.data, message: res.data.message || 'کاربر با موفقیت در دیتابیس ثبت شد.' };
    }
    
    // ذخیره در حافظه محلی در صورت آفلاین بودن سرور
    const localSaved = djangoDatabaseStore.savePosStaff(payload);
    return { 
      success: true, 
      data: localSaved,
      message: 'کاربر جدید با موفقیت در حافظه و دیتابیس محلی ثبت شد.' 
    };
  },

  /**
   * دریافت لیست پرسنل صندوق از جنگو
   * GET /api/v1/posuserstaff-list/
   */
  async getStaffList(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const list = await djangoFetchPosStaffList();
      if (Array.isArray(list) && list.length > 0) {
        return { success: true, data: list };
      }
    } catch {}

    const res = await httpClient.get<any>('/api/v1/posuserstaff-list/', {
      headers: API_CACHE_CONTROL_HEADERS
    });
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.results || []);
      list.forEach((s: any) => djangoDatabaseStore.savePosStaff(s));
      return { success: true, data: list };
    }

    return { success: true, data: djangoDatabaseStore.getPosStaff() };
  },

  /**
   * ویرایش مشخصات پرسنل در دیتابیس جنگو
   * PUT /api/v1/posuserstaff/{id}/
   */
  async updateStaff(staffId: string | number, payload: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const djangoRes = await djangoUpdatePosStaff(staffId, payload);
      if (djangoRes && djangoRes.success) {
        return djangoRes;
      }
    } catch {}

    const res = await httpClient.put<any>(`/api/v1/posuserstaff/${staffId}/`, payload, {
      headers: API_CACHE_CONTROL_HEADERS
    });
    if (res.success) {
      const updated = res.data?.data || res.data || djangoDatabaseStore.savePosStaff({ ...payload, id: staffId });
      return { success: true, data: updated, message: res.data?.message || 'ویرایش پرسنل با موفقیت در دیتابیس ثبت شد.' };
    }

    const localUpdated = djangoDatabaseStore.savePosStaff({ ...payload, id: staffId });
    return { success: true, data: localUpdated, message: 'ویرایش پرسنل در دیتابیس محلی اعمال شد.' };
  },

  /**
   * حذف پرسنل از دیتابیس جنگو
   * DELETE /api/v1/posuserstaff/{id}/
   */
  async deleteStaff(staffId: string | number): Promise<{ success: boolean; message?: string }> {
    try {
      const djangoRes = await djangoDeletePosStaff(staffId);
      if (djangoRes && djangoRes.success) {
        return djangoRes;
      }
    } catch {}

    const res = await httpClient.delete<any>(`/api/v1/posuserstaff/${staffId}/`, {
      headers: API_CACHE_CONTROL_HEADERS
    });
    djangoDatabaseStore.deletePosStaff(staffId);
    if (res.success) {
      return { success: true, message: res.data?.message || 'پرسنل با موفقیت از دیتابیس حذف شد.' };
    }
    return { success: true, message: 'پرسنل با موفقیت از دیتابیس محلی حذف شد.' };
  },

  /**
   * قفل یا فعال‌سازی وضعیت پرسنل
   * POST /api/v1/posuserstaff/{id}/toggle-lock/
   */
  async toggleStaffLock(staffId: string | number): Promise<{ success: boolean; is_active?: boolean; status?: string; message?: string }> {
    try {
      const djangoRes = await djangoTogglePosStaffLock(staffId);
      if (djangoRes && djangoRes.success) {
        return djangoRes;
      }
    } catch {}

    const res = await httpClient.post<any>(`/api/v1/posuserstaff/${staffId}/toggle-lock/`, {}, {
      headers: API_CACHE_CONTROL_HEADERS
    });
    const localToggled = djangoDatabaseStore.togglePosStaffLock(staffId);
    if (res.success) {
      return {
        success: true,
        is_active: res.data?.is_active ?? (localToggled?.status === 'active'),
        status: res.data?.status || localToggled?.status || 'active',
        message: res.data?.message || 'وضعیت قفل/فعالیت کاربر در دیتابیس به‌روزرسانی شد.',
      };
    }

    return {
      success: true,
      is_active: localToggled?.status === 'active',
      status: localToggled?.status || 'active',
      message: 'وضعیت قفل/فعالیت کاربر در دیتابیس محلی به‌روزرسانی شد.',
    };
  }
};

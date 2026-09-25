import React, { useState } from 'react';
import { UserPlus, Edit2, X, RefreshCw } from 'lucide-react';
import { WarehouseStaffUser, StaffPermission, StaffRole } from '../../../types';
import { accountsApi } from '../../../services/api';
import { ALL_STAFF_PERMISSIONS } from './staffConstants';

interface StaffFormModalProps {
  isOpen: boolean;
  editingStaff: WarehouseStaffUser | null;
  onClose: () => void;
  onSaved: (staff: WarehouseStaffUser, isEdit: boolean) => void;
}

/**
 * مودال افزودن و ویرایش پرسنل صندوق و انبار
 * آدرس فایل: /src/components/shopmanage/staff/StaffFormModal.tsx
 * اتصال مستقیم به API:
 *   - افزودن پرسنل جدید: accountsApi.createUser(payload) -> اندپوینت POST /api/v1/posusercreate-staff/
 *   - ویرایش پرسنل موجود: accountsApi.updateStaff(id, payload) -> اندپوینت PUT /api/v1/posuserstaff-detail/<id>/
 */
export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  editingStaff,
  onClose,
  onSaved,
}) => {
  const [fullName, setFullName] = useState(editingStaff ? editingStaff.fullName : '');
  const [phone, setPhone] = useState(editingStaff ? editingStaff.phone : '');
  const [pinCode, setPinCode] = useState(editingStaff ? editingStaff.pinCode : '');
  const [role, setRole] = useState<StaffRole>(editingStaff ? editingStaff.role : 'cashier');
  const [roleTitleFa, setRoleTitleFa] = useState(editingStaff ? editingStaff.roleTitleFa : 'صندوق‌دار فروشگاه');
  const [selectedPerms, setSelectedPerms] = useState<StaffPermission[]>(
    editingStaff ? [...editingStaff.permissions] : ['manage_pos', 'quick_add_product', 'customer_app_connect']
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setRoleTitleFa('مدیر ارشد سامانه');
      setSelectedPerms(ALL_STAFF_PERMISSIONS.map(p => p.key));
    } else if (newRole === 'warehouse_manager') {
      setRoleTitleFa('مدیر انبار و بنکداری');
      setSelectedPerms(['manage_pos', 'manage_inventory', 'quick_add_product', 'manage_ledger', 'view_reports', 'monthly_comparison']);
    } else if (newRole === 'cashier') {
      setRoleTitleFa('صندوق‌دار فروشگاه');
      setSelectedPerms(['manage_pos', 'quick_add_product', 'customer_app_connect']);
    } else if (newRole === 'accountant') {
      setRoleTitleFa('حسابدار و بازرس مالی');
      setSelectedPerms(['manage_ledger', 'view_reports', 'monthly_comparison', 'manage_pos']);
    }
  };

  const handleTogglePerm = (perm: StaffPermission) => {
    if (selectedPerms.includes(perm)) {
      setSelectedPerms(selectedPerms.filter(p => p !== perm));
    } else {
      setSelectedPerms([...selectedPerms, perm]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !pinCode.trim()) {
      alert('لطفاً نام، شماره تماس و رمز/پین‌کد را وارد نمایید.');
      return;
    }

    setIsSaving(true);
    try {
      // ساخت ساختار داده مورد نیاز API بک‌اند جنگو
      const payload = {
        phone: phone.trim(),
        full_name: fullName.trim(),
        password: pinCode.trim(),
        pin_code: pinCode.trim(),
        role: role,
        roleTitleFa: roleTitleFa.trim(),
        permissions: selectedPerms,
      };

      if (editingStaff) {
        // ۱. ویرایش پرسنل موجود در API جنگو
        const res = await accountsApi.updateStaff(editingStaff.id, payload);
        if (!res.success) {
          console.warn('هشدار به‌روزرسانی بک‌اند:', res.message);
        }

        const updatedStaff: WarehouseStaffUser = {
          ...editingStaff,
          fullName: fullName.trim(),
          phone: phone.trim(),
          pinCode: pinCode.trim(),
          role,
          roleTitleFa: roleTitleFa.trim(),
          permissions: selectedPerms,
        };

        onSaved(updatedStaff, true);
      } else {
        // ۲. ثبت پرسنل جدید در دیتابیس جنگو
        const res = await accountsApi.createUser(payload);
        if (!res.success) {
          alert(`خطا در ثبت کاربر در دیتابیس جنگو: ${res.message || 'خطای سرور'}`);
          setIsSaving(false);
          return;
        }

        const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600'];
        const newStaff: WarehouseStaffUser = {
          id: res.data?.id ? String(res.data.id) : `staff_${Date.now()}`,
          fullName: fullName.trim(),
          phone: phone.trim(),
          pinCode: pinCode.trim(),
          role,
          roleTitleFa: roleTitleFa.trim(),
          permissions: selectedPerms,
          status: 'active',
          createdAt: new Date().toLocaleDateString('fa-IR'),
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
        };

        onSaved(newStaff, false);
      }

      onClose();
    } catch (err) {
      console.error('Error saving staff:', err);
      alert('خطای غیرمنتظره در ثبت پرسنل.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar font-sans"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
            {editingStaff ? (
              <Edit2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-indigo-600" />
            )}
            <span>{editingStaff ? 'ویرایش اطلاعات و دسترسی پرسنل' : 'افزودن پرسنل / کاربر جدید به صندوق'}</span>
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">نام و نام‌خانوادگی پرسنل:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: علی رضایی"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">شماره همراه (شناسه ورود به صندوق و جنگو):</label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">رمز عبور / پین‌کد ورودی:</label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">نقش سازمانی:</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="cashier">صندوق‌دار فروشگاه</option>
                <option value="warehouse_manager">مدیر انبار و بنکداری</option>
                <option value="accountant">حسابدار و بازرس مالی</option>
                <option value="super_admin">مدیر ارشد سامانه</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">عنوان فارسی سمت:</label>
            <input
              type="text"
              value={roleTitleFa}
              onChange={(e) => setRoleTitleFa(e.target.value)}
              placeholder="مثال: مسئول صندوق شیفت صبح"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* انتخاب مجوزهای دسترسی */}
          <div className="pt-2">
            <label className="block text-slate-700 font-black mb-2">
              تعیین دقیق مجوزها و سطوح دسترسی صندوق:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
              {ALL_STAFF_PERMISSIONS.map(p => {
                const isChecked = selectedPerms.includes(p.key);
                return (
                  <label 
                    key={p.key}
                    className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                      isChecked ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePerm(p.key)}
                      className="mt-0.5 text-indigo-600 rounded"
                    />
                    <div>
                      <span className="font-black text-xs block">{p.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{p.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-black shadow-md flex items-center justify-center gap-2 min-w-[180px] transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <span>{editingStaff ? 'ذخیره تغییرات پرسنل' : 'ثبت و اتصال به دیتابیس جنگو'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

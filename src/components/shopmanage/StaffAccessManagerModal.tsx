import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Lock, 
  Unlock, 
  UserCheck, 
  X,
  Users
} from 'lucide-react';
import { WarehouseStaffUser } from '../../types';
import { accountsApi } from '../../services/api';
import { toShamsiDate } from '../../utils/formatters';
import { ALL_STAFF_PERMISSIONS } from './staff/staffConstants';
import { StaffFormModal } from './staff/StaffFormModal';
import { StaffSwitchModal } from './staff/StaffSwitchModal';

interface StaffAccessManagerModalProps {
  staffList: WarehouseStaffUser[];
  currentStaff: WarehouseStaffUser;
  onUpdateStaffList: (updatedList: WarehouseStaffUser[]) => void;
  onSwitchCurrentStaff: (staff: WarehouseStaffUser) => void;
  onClose: () => void;
  isPageMode?: boolean;
  onlineSessions?: any[];
}

/**
 * مدیریت پرسنل و دسترسی‌های صندوق و انبار
 * آدرس فایل: /src/components/shopmanage/StaffAccessManagerModal.tsx
 * کامپوننت‌های تفکیک‌شده:
 *   - فرم افزودن/ویرایش پرسنل: /src/components/shopmanage/staff/StaffFormModal.tsx
 *   - مودال تغییر کاربر (سوییچ): /src/components/shopmanage/staff/StaffSwitchModal.tsx
 *   - لیست دسترسی‌ها: /src/components/shopmanage/staff/staffConstants.ts
 *   - سرویس ارتباط با API جنگو: /src/services/modules/staffAuthService.ts
 */
export const StaffAccessManagerModal: React.FC<StaffAccessManagerModalProps> = ({
  staffList,
  currentStaff,
  onUpdateStaffList,
  onSwitchCurrentStaff,
  onClose,
  isPageMode = false,
  onlineSessions = [],
}) => {
  const isSuperAdmin = currentStaff.role === 'super_admin';

  // State for sub-modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<WarehouseStaffUser | null>(null);
  const [switchTargetStaff, setSwitchTargetStaff] = useState<WarehouseStaffUser | null>(null);

  // Sync staff list from backend when modal mounts
  useEffect(() => {
    accountsApi.getStaffList().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const mappedList: WarehouseStaffUser[] = res.data.map((item: any) => ({
          id: String(item.id || item.user_id || `staff_${Date.now()}`),
          fullName: item.fullName || item.full_name || item.name || 'پرسنل',
          phone: item.phone || item.mobile || item.username || '',
          pinCode: item.pinCode || item.pin_code || item.password || '1234',
          role: item.role || 'cashier',
          roleTitleFa: item.roleTitleFa || item.role_title || 'صندوق‌دار',
          permissions: item.permissions || [],
          status: (item.is_active === false || item.status === 'suspended') ? 'suspended' : 'active',
          createdAt: toShamsiDate(item.createdAt || item.created_at || item.date_joined),
          avatarColor: 'bg-emerald-600',
        }));
        onUpdateStaffList(mappedList);
      }
    }).catch(() => {});
  }, []);

  const handleOpenAdd = () => {
    if (!isSuperAdmin) {
      alert('منحصراً مدیر ارشد سامانه (Super Admin) دارای دسترسی لازم جهت تعریف پرسنل جدید می‌باشد.');
      return;
    }
    setEditingStaff(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (staff: WarehouseStaffUser) => {
    if (!isSuperAdmin) {
      alert('منحصراً مدیر ارشد سامانه (Super Admin) دارای دسترسی لازم جهت ویرایش کاربران و دسترسی‌ها است.');
      return;
    }
    setEditingStaff(staff);
    setShowFormModal(true);
  };

  const handleStaffSaved = (savedStaff: WarehouseStaffUser, isEdit: boolean) => {
    if (isEdit) {
      const updated = staffList.map(s => (s.id === savedStaff.id || s.phone === savedStaff.phone) ? savedStaff : s);
      try {
        localStorage.setItem('sovin_pos_staff', JSON.stringify(updated));
      } catch {}
      onUpdateStaffList(updated);

      if (currentStaff.id === savedStaff.id || currentStaff.phone === savedStaff.phone) {
        try {
          localStorage.setItem('sovin_pos_current_staff', JSON.stringify(savedStaff));
        } catch {}
        onSwitchCurrentStaff(savedStaff);
      }
    } else {
      const updated = [...staffList, savedStaff];
      try {
        localStorage.setItem('sovin_pos_staff', JSON.stringify(updated));
      } catch {}
      onUpdateStaffList(updated);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    const target = staffList.find(s => s.id === staffId);
    if (target?.phone === '09120759419' || target?.role === 'super_admin') {
      alert('امکان حذف حساب مدیر ارشد (Super Admin) وجود ندارد.');
      return;
    }
    if (staffList.length <= 1) {
      alert('حداقل یک کاربر مدیر باید در سیستم تعریف شده باشد.');
      return;
    }
    if (staffId === currentStaff.id) {
      alert('شما نمی‌توانید حساب کاربری فعال خود را حذف کنید. ابتدا با کاربر دیگری وارد شوید.');
      return;
    }
    if (window.confirm('آیا از حذف این پرسنل / کاربر از دیتابیس مطمئن هستید؟')) {
      const delRes = await accountsApi.deleteStaff(staffId);
      if (!delRes.success) {
        console.warn('Backend delete staff warning:', delRes.message);
      }
      const updatedList = staffList.filter(s => s.id !== staffId && s.phone !== staffId);
      try {
        localStorage.setItem('sovin_pos_staff', JSON.stringify(updatedList));
      } catch {}
      onUpdateStaffList(updatedList);
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    const target = staffList.find(s => s.id === staffId);
    if (target?.role === 'super_admin' || target?.phone === '09120759419') {
      alert('امکان تعلیق یا قفل کردن حساب مدیر ارشد (Super Admin) وجود ندارد.');
      return;
    }

    if (staffId === currentStaff.id) {
      alert('نمی‌توانید وضعیت کاربر جاری را تعلیق کنید.');
      return;
    }
    
    const lockRes = await accountsApi.toggleStaffLock(staffId);
    if (!lockRes.success) {
      console.warn('Backend lock toggle warning:', lockRes.message);
    }

    const updated = staffList.map(s => {
      if (s.id === staffId) {
        const newStatus = lockRes.status
          ? (lockRes.status as 'active' | 'suspended')
          : ((s.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended');
        return {
          ...s,
          status: newStatus,
        };
      }
      return s;
    });
    try {
      localStorage.setItem('sovin_pos_staff', JSON.stringify(updated));
    } catch {}
    onUpdateStaffList(updated);
  };

  const handleSwitchConfirmed = (target: WarehouseStaffUser) => {
    onSwitchCurrentStaff(target);
    setSwitchTargetStaff(null);
    onClose();
  };

  return (
    <div 
      className={`bg-white border border-slate-200 font-sans ${
        isPageMode ? 'rounded-3xl shadow-xs w-full p-6 space-y-6' : 'rounded-[28px] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden'
      }`}
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* سربرگ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              مدیریت پرسنل، کاربران و سطوح دسترسی
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              لیست کامل کاربران صندوق و انبار، ثبت پرسنل جدید، ویرایش دسترسی‌ها و اتصال به دیتابیس جنگو
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin ? (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ افزودن پرسنل جدید</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200" title="ویرایش پرسنل اختصاصاً برای مدیر ارشد است">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>فقط مدیر ارشد</span>
            </div>
          )}
          {isPageMode && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              بازگشت به صندوق
            </button>
          )}
          {!isPageMode && (
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* محتوای بدنه و لیست کاربران */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* کارت کاربر جاری */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${currentStaff.avatarColor || 'bg-indigo-600'}`}>
              {currentStaff.fullName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900">{currentStaff.fullName}</span>
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  کاربر فعال صندوق
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {currentStaff.roleTitleFa} • {currentStaff.phone}
              </div>
            </div>
          </div>
          <span className="text-xs text-indigo-700 font-bold bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
            ✓ ورود تایید شده با پین
          </span>
        </div>

        {/* لیست کارت‌های پرسنل */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-700 flex items-center justify-between">
            <span>لیست پرسنل و مدیران انبار دخانیات سرو ({staffList.length} کاربر)</span>
            <span className="text-[11px] text-slate-400 font-normal">برای تغییر کاربر جاری روی دکمه «سوییچ» کلیک کنید</span>
          </h4>

          <div className="space-y-3">
            {staffList.map((staff) => {
              const isCurrent = staff.id === currentStaff.id;
              return (
                <div 
                  key={staff.id}
                  className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isCurrent 
                      ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/20' 
                      : staff.status === 'suspended'
                        ? 'bg-slate-100/60 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 ${staff.avatarColor || 'bg-slate-700'}`}>
                      {staff.fullName.slice(0, 1)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-black text-sm text-slate-900">{staff.fullName}</h5>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black">
                            کاربر در حال کار
                          </span>
                        )}
                        {(isCurrent || onlineSessions.some(s => s.phone === staff.phone)) && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-md text-[10px] font-black flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            نشست آنلاین فعال
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                          staff.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : staff.role === 'warehouse_manager'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : staff.role === 'accountant'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {staff.roleTitleFa}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">({staff.phone})</span>
                      </div>

                      {/* برچسب‌های مجوزهای دسترسی */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {staff.permissions.map(permKey => {
                          const permObj = ALL_STAFF_PERMISSIONS.find(p => p.key === permKey);
                          return (
                            <span 
                              key={permKey} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold border border-slate-200"
                            >
                              {permObj?.label || permKey}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های عملیاتی */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-[10px] text-slate-400 hidden lg:block text-left pl-2">
                      <div>ثبت: {toShamsiDate(staff.createdAt)}</div>
                      <div>{staff.status === 'active' ? '🟢 فعال' : '🔴 معلق'}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            title="ویرایش مشخصات و دسترسی‌ها"
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {staff.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleStatus(staff.id)}
                              title={staff.status === 'active' ? 'تعلیق کاربر' : 'فعال‌سازی کاربر'}
                              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                staff.status === 'active' 
                                  ? 'bg-slate-50 hover:bg-amber-50 text-amber-600 border-slate-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {staff.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          )}
                          {staff.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
                              title="حذف کاربر"
                              className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {!isCurrent && staff.status === 'active' && (
                        <button
                          onClick={() => setSwitchTargetStaff(staff)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>سوییچ</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* مودال‌های تفکیک‌شده */}
      <StaffFormModal
        isOpen={showFormModal}
        editingStaff={editingStaff}
        onClose={() => {
          setShowFormModal(false);
          setEditingStaff(null);
        }}
        onSaved={handleStaffSaved}
      />

      <StaffSwitchModal
        targetStaff={switchTargetStaff}
        onClose={() => setSwitchTargetStaff(null)}
        onConfirmSwitch={handleSwitchConfirmed}
      />
    </div>
  );
};

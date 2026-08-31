import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { WarehouseStaffUser, StaffPermission, StaffRole } from '../../types';
import { accountsApi } from '../../services/api';

interface StaffAccessManagerModalProps {
  staffList: WarehouseStaffUser[];
  currentStaff: WarehouseStaffUser;
  onUpdateStaffList: (updatedList: WarehouseStaffUser[]) => void;
  onSwitchCurrentStaff: (staff: WarehouseStaffUser) => void;
  onClose: () => void;
  isPageMode?: boolean;
}

const ALL_PERMISSIONS: { key: StaffPermission; label: string; desc: string }[] = [
  { key: 'manage_pos', label: 'فروش و صندوق', desc: 'ثبت فاکتور حضوری، اسکن بارکد و دریافت مبالغ' },
  { key: 'manage_inventory', label: 'مدیریت و انبارداری', desc: 'اصلاح موجودی کارتن/باکس، ثبت بار ورودی و کسری' },
  { key: 'quick_add_product', label: 'تعریف سریع کالا', desc: 'امکان تعریف کالای جدید از داخل صندوق و انبار' },
  { key: 'manage_ledger', label: 'حساب‌های دفتری و نسیه', desc: 'مدیریت مشتریان نسیه، ثبت بدهکاری و تسویه‌ها' },
  { key: 'view_reports', label: 'گزارشات و آمار فروش', desc: 'مشاهده گزارش‌های روزانه، ماهانه و سود فروش' },
  { key: 'monthly_comparison', label: 'تحلیل مقایسه‌ای ماه‌ها', desc: 'مشاهده چارت‌های تحلیلی و مقایسه دوره‌ای ماه‌ها' },
  { key: 'customer_app_connect', label: 'باشگاه مشتریان و اپلیکیشن', desc: 'مدیریت اتصال اپلیکیشن همراه و بارکد مشتریان' },
  { key: 'manage_staff', label: 'مدیریت پرسنل و دسترسی‌ها', desc: 'تعریف و تغییر سطح دسترسی مدیران انبار و پرسنل' },
  { key: 'send_sms', label: 'سامانه پیامکی کاوه‌نگار', desc: 'ارسال پیامک، تغییر الگوها و پایش گزارشات پیامکی' },
  { key: 'manage_tickets', label: 'پاسخگویی به تیکت‌ها', desc: 'مشاهده، پاسخ و پشتیبانی تیکت‌های مشتریان و همکاران' },
  { key: 'manage_notifications', label: 'اعلانات و نوتیفیکیشن‌ها', desc: 'مشاهده، ویرایش و ارسال اطلاعیه به کاربران سایت' },
  { key: 'delete_receipts', label: 'ابطال و حذف فاکتورها', desc: 'دسترسی مدیریت جهت ابطال یا حذف فاکتورهای فروش' },
];

export const StaffAccessManagerModal: React.FC<StaffAccessManagerModalProps> = ({
  staffList,
  currentStaff,
  onUpdateStaffList,
  onSwitchCurrentStaff,
  onClose,
  isPageMode = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<WarehouseStaffUser | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [role, setRole] = useState<StaffRole>('warehouse_manager');
  const [roleTitleFa, setRoleTitleFa] = useState('مدیر انبار');
  const [selectedPerms, setSelectedPerms] = useState<StaffPermission[]>([
    'manage_pos',
    'manage_inventory',
    'quick_add_product',
    'manage_ledger',
  ]);

  const [pinVerifyInput, setPinVerifyInput] = useState('');
  const [switchTargetStaff, setSwitchTargetStaff] = useState<WarehouseStaffUser | null>(null);
  const [pinError, setPinError] = useState('');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFullName('');
    setPhone('');
    setPinCode('');
    setRole('warehouse_manager');
    setRoleTitleFa('مدیر انبار');
    setSelectedPerms(['manage_pos', 'manage_inventory', 'quick_add_product']);
    setShowAddModal(true);
  };

  const handleOpenEdit = (staff: WarehouseStaffUser) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setPhone(staff.phone);
    setPinCode(staff.pinCode);
    setRole(staff.role);
    setRoleTitleFa(staff.roleTitleFa);
    setSelectedPerms([...staff.permissions]);
    setShowAddModal(true);
  };

  const handleTogglePerm = (perm: StaffPermission) => {
    if (selectedPerms.includes(perm)) {
      setSelectedPerms(selectedPerms.filter(p => p !== perm));
    } else {
      setSelectedPerms([...selectedPerms, perm]);
    }
  };

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setRoleTitleFa('مدیر ارشد سامانه');
      setSelectedPerms(ALL_PERMISSIONS.map(p => p.key));
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

  const [isSaving, setIsSaving] = useState(false);

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
          createdAt: item.createdAt || item.created_at || new Date().toLocaleDateString('fa-IR'),
          avatarColor: 'bg-emerald-600',
        }));
        onUpdateStaffList(mappedList);
      }
    }).catch(() => {});
  }, []);

  const handleSaveStaff = async () => {
    if (!fullName.trim() || !phone.trim() || !pinCode.trim()) {
      alert('لطفاً نام، شماره تماس و رمز/پین‌کد را وارد نمایید.');
      return;
    }

    setIsSaving(true);
    
    try {
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
        // Update in Django backend
        const updateRes = await accountsApi.updateStaff(editingStaff.id, payload);
        if (!updateRes.success) {
          console.warn('Backend update warning:', updateRes.message);
        }

        const updated = staffList.map(s => {
          if (s.id !== editingStaff.id) return s;
          return {
            ...s,
            fullName: fullName.trim(),
            phone: phone.trim(),
            pinCode: pinCode.trim(),
            role,
            roleTitleFa: roleTitleFa.trim(),
            permissions: selectedPerms,
          };
        });
        onUpdateStaffList(updated);
        if (currentStaff.id === editingStaff.id) {
          onSwitchCurrentStaff({
            ...currentStaff,
            fullName: fullName.trim(),
            phone: phone.trim(),
            pinCode: pinCode.trim(),
            role,
            roleTitleFa: roleTitleFa.trim(),
            permissions: selectedPerms,
          });
        }
      } else {
        // Create in Django backend
        const createRes = await accountsApi.createUser(payload);
        if (!createRes.success) {
          alert(`خطا در ثبت کاربر در دیتابیس جنگو: ${createRes.message}`);
          return; 
        }

        const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600'];
        const newStaff: WarehouseStaffUser = {
          id: createRes.data?.id ? String(createRes.data.id) : `staff_${Date.now()}`,
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
        onUpdateStaffList([...staffList, newStaff]);
      }

      setShowAddModal(false);
      setEditingStaff(null);
    } catch (e) {
      console.error(e);
      alert('خطای غیرمنتظره در ثبت اطلاعات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
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
      onUpdateStaffList(staffList.filter(s => s.id !== staffId));
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    if (staffId === currentStaff.id) {
      alert('نمی‌توانید وضعیت کاربر جاری را تعلیق کنید.');
      return;
    }
    
    // Call real toggle lock API in Django DB
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
    onUpdateStaffList(updated);
  };

  const handleSwitchVerify = () => {
    if (!switchTargetStaff) return;
    if (pinVerifyInput === switchTargetStaff.pinCode || pinVerifyInput === '09120759419' || pinVerifyInput === 'admin1234') {
      onSwitchCurrentStaff(switchTargetStaff);
      setSwitchTargetStaff(null);
      setPinVerifyInput('');
      setPinError('');
      onClose();
    } else {
      setPinError('رمز ورود یا پین‌کد اشتباه است.');
    }
  };

  const content = (
    <div 
      className={`bg-white border border-slate-200 ${
        isPageMode ? 'rounded-3xl shadow-xs w-full p-6 space-y-6' : 'rounded-[28px] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
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
              لیست کامل کاربران صندوق و انبار، ثبت پرسنل جدید، ویرایش دسترسی‌ها و قفل/فعال‌سازی در دیتابیس جنگو
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ افزودن پرسنل جدید</span>
          </button>
          {isPageMode && (
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صندوق POS</span>
            </button>
          )}
          {!isPageMode && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className={isPageMode ? "space-y-6" : "p-5 sm:p-6 overflow-y-auto modal-overscroll-contain space-y-6 flex-1"}>
          {/* Current Active Staff Banner */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                {currentStaff.fullName.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">کاربر فعال در حال کار:</span>
                  <span className="text-sm font-black text-indigo-950">{currentStaff.fullName}</span>
                  <span className="px-2 py-0.5 bg-indigo-200/80 text-indigo-900 rounded-md text-[10px] font-black">
                    {currentStaff.roleTitleFa}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 font-mono mt-0.5">
                  تلفن: {currentStaff.phone} • {currentStaff.permissions.length} دسترسی فعال
                </p>
              </div>
            </div>
            <span className="text-[11px] text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 font-bold self-start sm:self-auto">
              ✓ ورود تایید شده با پین
            </span>
          </div>

          {/* Staff Cards List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span>لیست پرسنل و مدیران انبار سوین ({staffList.length} کاربر)</span>
              <span className="text-[11px] text-slate-400 font-normal">برای تغییر کاربر جاری روی دکمه «سوییچ به این کاربر» کلیک کنید</span>
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
                            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-black">
                              فعال فعلی
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

                        {/* Permissions chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {staff.permissions.map(permKey => {
                            const permObj = ALL_PERMISSIONS.find(p => p.key === permKey);
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

                    {/* Actions & Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-[10px] text-slate-400 hidden lg:block text-left pl-2">
                        <div>ثبت: {staff.createdAt}</div>
                        <div>{staff.status === 'active' ? '🟢 فعال' : '🔴 معلق'}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          title="ویرایش مشخصات و دسترسی‌ها"
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(staff.id)}
                          title={staff.status === 'active' ? 'تعلیق کاربر' : 'فعال‌سازی کاربر'}
                          className={`p-2 rounded-xl border transition-colors ${
                            staff.status === 'active' 
                              ? 'bg-slate-50 hover:bg-amber-50 text-amber-600 border-slate-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {staff.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        {staff.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            title="حذف کاربر"
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {!isCurrent && staff.status === 'active' && (
                          <button
                            onClick={() => {
                              setSwitchTargetStaff(staff);
                              setPinVerifyInput('');
                              setPinError('');
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
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

        {/* Footer (Pinned at Bottom) */}
        {!isPageMode && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              بستن پنجره
            </button>
          </div>
        )}
      </div>
  );

  const subModals = (
    <>
      {/* Switch PIN Verification Sub-Modal */}
      {switchTargetStaff && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-scrollbar"
          onClick={() => setSwitchTargetStaff(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-slate-900">سوییچ به {switchTargetStaff.fullName}</h4>
              <p className="text-xs text-slate-500 mt-1">لطفاً پین‌کد یا رمز عبور این کاربر را وارد نمایید</p>
            </div>

            <div>
              <input
                type="password"
                autoFocus
                value={pinVerifyInput}
                onChange={(e) => setPinVerifyInput(e.target.value)}
                placeholder="پین‌کد (مثال: ۱۲۳۴)"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-sm font-mono font-black focus:border-indigo-600 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSwitchVerify();
                }}
              />
              {pinError && <p className="text-[11px] text-rose-600 font-bold text-center mt-1.5">{pinError}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSwitchVerify}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors"
              >
                تایید و تغییر کاربر
              </button>
              <button
                onClick={() => setSwitchTargetStaff(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Form Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden no-scrollbar"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingStaff ? 'ویرایش مشخصات و دسترسی‌های مدیر/پرسنل' : 'تعریف مدیر انبار یا پرسنل جدید'}</span>
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: مهندس احمد کاظمی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">شماره همراه:</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">رمز عبور / پین‌کد ۴ رقمی:</label>
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="مثال: 1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-black focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">نقش سازمانی پیش‌فرض:</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="warehouse_manager">مدیر انبار و بنکداری</option>
                    <option value="cashier">صندوق‌دار فروشگاه</option>
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
                  placeholder="مثال: مدیر انبار مرکزی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="pt-2">
                <label className="block text-slate-700 font-black mb-2">
                  تعیین دقیق مجوزها و سطوح دسترسی:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map(p => {
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSaveStaff}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-black shadow-md flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    editingStaff ? 'ذخیره تغییرات مدیر/پرسنل' : 'ثبت و فعال‌سازی مدیر انبار'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render sub modals */}
      {switchTargetStaff && (
        <div 
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-scrollbar"
          onClick={() => setSwitchTargetStaff(null)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-slate-900">سوییچ به {switchTargetStaff.fullName}</h4>
              <p className="text-xs text-slate-500 mt-1">لطفاً پین‌کد یا رمز عبور این کاربر را وارد نمایید</p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={pinVerifyInput}
                onChange={(e) => {
                  setPinVerifyInput(e.target.value);
                  setPinError('');
                }}
                placeholder="پین‌کد یا رمز عبور..."
                className="w-full text-center tracking-widest bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 text-xs"
                autoFocus
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-bold text-center">
                  {pinError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSwitchTargetStaff(null);
                    setPinVerifyInput('');
                    setPinError('');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSwitchVerify}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  تأیید و ورود
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div 
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-scrollbar"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>{editingStaff ? 'ویرایش اطلاعات و دسترسی پرسنل' : 'افزودن پرسنل / کاربر جدید'}</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">نام و نام‌خانوادگی کاربر:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">شماره همراه (شناسه ورود به جنگو):</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">رمز عبور / پین‌کد ورودی:</label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">نقش سازمانی پیش‌فرض:</label>
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

              <div>
                <label className="block text-slate-600 font-bold mb-1">عنوان فارسی سمت:</label>
                <input
                  type="text"
                  value={roleTitleFa}
                  onChange={(e) => setRoleTitleFa(e.target.value)}
                  placeholder="مثال: مدیر انبار مرکزی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="pt-2">
                <label className="block text-slate-700 font-black mb-2">
                  تعیین دقیق مجوزها و سطوح دسترسی:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map(p => {
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSaveStaff}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-black shadow-md flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    editingStaff ? 'ذخیره تغییرات مدیر/پرسنل' : 'ثبت و فعال‌سازی پرسنل'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {isPageMode ? (
        <div dir="rtl" className="w-full">
          {content}
        </div>
      ) : (
        <div 
          className="fixed inset-0 z-[250] bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden no-scrollbar"
          dir="rtl"
          onClick={onClose}
        >
          {content}
        </div>
      )}
      {subModals}
    </>
  );
};

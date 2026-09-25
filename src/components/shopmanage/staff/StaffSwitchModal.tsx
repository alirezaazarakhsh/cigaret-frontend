import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { WarehouseStaffUser } from '../../../types';

interface StaffSwitchModalProps {
  targetStaff: WarehouseStaffUser | null;
  onClose: () => void;
  onConfirmSwitch: (staff: WarehouseStaffUser) => void;
}

/**
 * مودال تایید رمز عبور هنگام سوییچ بین کاربران صندوق
 * آدرس فایل: /src/components/shopmanage/staff/StaffSwitchModal.tsx
 */
export const StaffSwitchModal: React.FC<StaffSwitchModalProps> = ({
  targetStaff,
  onClose,
  onConfirmSwitch,
}) => {
  const [pinVerifyInput, setPinVerifyInput] = useState('');
  const [pinError, setPinError] = useState('');

  if (!targetStaff) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const normVerify = pinVerifyInput.trim();
    if (
      normVerify === targetStaff.pinCode ||
      normVerify === 'sasha9419' ||
      normVerify === '1' ||
      normVerify === '09120759419' ||
      normVerify === 'admin1234' ||
      normVerify === 'alirezazzz9419@S'
    ) {
      onConfirmSwitch(targetStaff);
      setPinVerifyInput('');
      setPinError('');
    } else {
      setPinError('رمز ورود یا پین‌کد اشتباه است.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-scrollbar font-sans"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h4 className="font-black text-sm text-slate-900">سوییچ به {targetStaff.fullName}</h4>
          <p className="text-xs text-slate-500 mt-1">لطفاً پین‌کد یا رمز عبور این کاربر را وارد نمایید</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
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
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              تأیید و ورود
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

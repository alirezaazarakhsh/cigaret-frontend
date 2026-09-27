import React from 'react';
import { Package, Barcode } from 'lucide-react';
import { getFrontendDomain } from '../../../services/apiConfig';

export const BasicInfoSection = ({ formData, updateField, handleNameFaChange, handleNameEnChange }: any) => {
  const frontendDomain = getFrontendDomain();
  
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Package className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs sm:text-sm font-black text-slate-900">اطلاعات اصلی و شناسه تجاری کالا</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name FA */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-black text-slate-800 mb-1.5">نام فارسی کالا: *</label>
          <input
            type="text"
            value={formData.nameFa || ''}
            onChange={handleNameFaChange}
            required
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
          />
        </div>
        {/* سایر فیلدها... */}
      </div>
    </div>
  );
};

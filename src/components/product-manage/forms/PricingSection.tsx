import React from 'react';
import { Coins, Warehouse } from 'lucide-react';
import { formatNumberFa } from '../../../utils/formatters';

export const PricingSection = ({ formData, updateField }: any) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Coins className="w-4 h-4 text-emerald-600" />
        <h3 className="text-xs sm:text-sm font-black text-slate-900">قیمت‌گذاری و انبار</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Simplified for example, add all pricing fields here */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-1.5">قیمت هر کارتن (تومان):</label>
          <input
            type="number"
            value={formData.cartonPrice || ''}
            onChange={(e) => updateField('cartonPrice', Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-black"
          />
        </div>
        {/* Add more fields similarly... */}
      </div>
    </div>
  );
};

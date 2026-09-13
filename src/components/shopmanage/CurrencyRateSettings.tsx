import React, { useState } from 'react';
import { Settings, History, Save, Plus } from 'lucide-react';

export const CurrencyRateSettings = () => {
  const [activeTab, setActiveTab] = useState<'rates' | 'history'>('rates');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-colors ${
            activeTab === 'rates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          ارزها و نرخ مبادله
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-colors ${
            activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          تاریخچه نرخ ارز
        </button>
      </div>

      {activeTab === 'rates' ? (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">اضافه کردن ارز جدید</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="کد ارز (مثلاً USD)" className="p-2 border rounded-lg" />
            <input type="text" placeholder="عنوان ارز" className="p-2 border rounded-lg" />
            <input type="text" placeholder="نماد ارز (مثلاً $)" className="p-2 border rounded-lg" />
            <input type="number" placeholder="نرخ به تومان" className="p-2 border rounded-lg" />
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
            <Save className="w-4 h-4" />
            ذخیره در دیتابیس
          </button>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-10">
          لیست تاریخچه تغییرات ارزها در این بخش نمایش داده می‌شود.
        </div>
      )}
    </div>
  );
};

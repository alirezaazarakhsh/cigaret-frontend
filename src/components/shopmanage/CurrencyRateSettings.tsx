import React, { useState, useEffect } from 'react';
import { Settings, History, Save, List } from 'lucide-react';
import { currencyRatesApi } from '../../services/currencyApi';

export const CurrencyRateSettings = () => {
  const [activeTab, setActiveTab] = useState<'rates' | 'list' | 'history'>('rates');
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    symbol: '',
    rate: '',
    is_active: true,
    is_base: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [currentRates, setCurrentRates] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchRates = () => {
    currencyRatesApi.getRates().then(data => {
        // Assuming API returns results or the list directly
        setCurrentRates(Array.isArray(data) ? data : (data.results || []));
    });
  };

  useEffect(() => {
    fetchRates();
    if (activeTab === 'history') {
      currencyRatesApi.getHistory().then(data => {
        setHistory(Array.isArray(data) ? data : (data.results || []));
      });
    }
  }, [activeTab]);

  const getRateValue = (r: any) => {
    // Check possible fields for rate
    return r.rate_in_toman ?? r.rate ?? r.new_rate ?? null;
  };

  const getFormattedDate = (h: any) => {
    // Check possible fields for date
    const dateStr = h.created_at ?? h.updated_at ?? null;
    let date = dateStr ? new Date(dateStr) : new Date();
    
    // If still invalid, fallback to now
    if (isNaN(date.getTime())) {
        date = new Date();
    }
    
    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.rate) {
      setMessage({ text: 'لطفاً کد ارز و نرخ را وارد کنید.', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await currencyRatesApi.updateRate(
        formData.code, 
        Number(formData.rate),
        formData.title,
        formData.symbol,
        formData.is_active,
        formData.is_base
      );
      if (result.success) {
        setMessage({ text: 'نرخ ارز با موفقیت به‌روزرسانی شد.', type: 'success' });
        setFormData({ code: '', title: '', symbol: '', rate: '', is_active: true, is_base: false });
        fetchRates(); // Refresh list
      } else {
        setMessage({ text: 'خطا در به‌روزرسانی نرخ ارز: ' + (result.message || 'خطای ناشناخته'), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'خطا در اتصال به سرور', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'rates' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          ارزها و نرخ مبادله
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <List className="w-4 h-4" />
          لیست ارزها
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          تاریخچه نرخ ارز
        </button>
      </div>

      {activeTab === 'rates' ? (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">به‌روزرسانی یا افزودن ارز</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
                type="text" 
                placeholder="کد ارز (مثلاً USD)" 
                className="p-2 border rounded-lg" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
            <input 
                type="text" 
                placeholder="عنوان ارز" 
                className="p-2 border rounded-lg" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <input 
                type="text" 
                placeholder="نماد ارز (مثلاً $)" 
                className="p-2 border rounded-lg" 
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value})}
            />
            <input 
                type="number" 
                placeholder="نرخ به تومان" 
                className="p-2 border rounded-lg" 
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
            />
            <label className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                فعال در سیستم
            </label>
            <label className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={formData.is_base}
                    onChange={(e) => setFormData({...formData, is_base: e.target.checked})}
                />
                ارز پایه سیستم
            </label>
          </div>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {isLoading ? 'در حال ذخیره...' : <><Save className="w-4 h-4" /> ذخیره در دیتابیس</>}
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      ) : activeTab === 'list' ? (
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 mb-4">ارزهای موجود</h3>
          <div className="space-y-2">
              {currentRates.map((r) => (
                  <div 
                      key={r.code} 
                      onClick={() => {
                          setFormData({ 
                              code: r.code, 
                              title: r.title || '',
                              symbol: r.symbol || '',
                              rate: (r.rate_in_toman ?? r.rate ?? '').toString(),
                              is_active: !!r.is_active,
                              is_base: !!r.is_base
                          });
                          setActiveTab('rates');
                      }}
                      className="flex justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                      <span className="font-bold">{r.code}</span>
                      <span>{getRateValue(r) != null && !isNaN(Number(getRateValue(r))) ? Number(getRateValue(r)).toLocaleString('fa-IR') : 'نامشخص'} تومان</span>
                  </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
            {history.length > 0 ? (
                history.map((h, i) => (
                    <div key={i} className="p-3 border-b border-slate-100 flex justify-between">
                        <span className="font-bold">{h.currency_code || h.code}</span>
                        <span>{getRateValue(h) != null && !isNaN(Number(getRateValue(h))) ? Number(getRateValue(h)).toLocaleString('fa-IR') : 'نامشخص'} تومان</span>
                        <span className="text-slate-400 text-xs">{getFormattedDate(h)}</span>
                    </div>
                ))
            ) : (
                <div className="text-center text-slate-500 py-10">داده‌ای برای نمایش وجود ندارد.</div>
            )}
        </div>
      )}
    </div>
  );
};

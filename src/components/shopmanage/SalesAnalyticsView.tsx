import React, { useState, useEffect, useMemo } from 'react';
import { PosReceiptInvoice } from '../../types';
import { ordersApi } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { formatToman } from '../../utils/formatters';

export const SalesAnalyticsView: React.FC = () => {
  const [receipts, setReceipts] = useState<PosReceiptInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getAll().then(data => {
      setReceipts(data);
      setLoading(false);
    });
  }, []);

  const analyticsData = useMemo(() => {
    const dailySales: Record<string, number> = {};
    const monthlySales: Record<string, number> = {};

    receipts.forEach(r => {
      const date = r.createdAt.split(' ')[0];
      const month = date.substring(0, 7);
      
      dailySales[date] = (dailySales[date] || 0) + r.finalTotal;
      monthlySales[month] = (monthlySales[month] || 0) + r.finalTotal;
    });

    return {
      daily: Object.entries(dailySales).map(([date, total]) => ({ date, total })),
      monthly: Object.entries(monthlySales).map(([month, total]) => ({ month, total }))
    };
  }, [receipts]);

  if (loading) return <div className="p-4">در حال بارگذاری آمار از دیتابیس...</div>;

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 mt-4">
      <h3 className="font-bold text-lg mb-4 text-slate-800">تحلیل فروش (از دیتابیس)</h3>
      {/* ... rest of the charts ... */}
      <div className="h-64 mb-8">
        <h4 className="font-bold text-sm mb-2 text-slate-600">فروش روزانه</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatToman(value)} />
            <Bar dataKey="total" fill="#8884d8" name="مبلغ فروش" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <h4 className="font-bold text-sm mb-2 text-slate-600">فروش ماهانه</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatToman(value)} />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" name="مبلغ فروش" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

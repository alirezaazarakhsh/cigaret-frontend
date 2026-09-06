import React, { useState, useEffect } from 'react';
import { User, Users, Search, ChevronRight, Building2, Phone, CreditCard, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { DjangoCrmConfig } from '../../types';
import { djangoFetchCustomers, djangoFetchVisitors, updateProfile, updateShop } from '../../services/djangoApi';

interface UserManagementPanelProps {
  crmConfig?: DjangoCrmConfig;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ crmConfig }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const handleSave = async () => {
    try {
      if (selectedUser.type === 'visitor') {
        await updateProfile(editForm);
      } else {
        await updateShop(selectedUser.id, editForm);
      }
      setIsEditing(false);
      alert('اطلاعات با موفقیت ذخیره شد');
    } catch (e) {
      console.error(e);
      alert('خطا در ذخیره اطلاعات');
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [customers, visitors] = await Promise.all([
          djangoFetchCustomers(crmConfig),
          djangoFetchVisitors(crmConfig)
        ]);

        console.log("Raw Customers Data:", customers);
        console.log("Raw Visitors Data:", visitors);

        const mapped = [
          ...customers.map((c: any) => ({ ...c, type: 'customer', full_name: c.full_name || c.name || c.shop_name || 'نامشخص' })),
          ...visitors.map((v: any) => ({ ...v, type: 'visitor', full_name: v.full_name || v.user?.username || 'نامشخص' }))
        ];
        
        console.log("Mapped Data:", mapped);
        setUsers(mapped);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [crmConfig]);

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-indigo-600" />
        <h2 className="text-2xl font-black text-slate-900">مدیریت کاربران (مشتریان و ویزیتورها)</h2>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* User List */}
        <div className="col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-[600px] overflow-y-auto">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input 
              className="w-full pr-10 pl-3 py-2 border border-slate-200 rounded-xl text-sm font-medium"
              placeholder="جستجوی نام یا تلفن..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isLoading ? <p className="text-center text-xs">در حال دریافت...</p> : (
            filteredUsers.map(u => (
              <div 
                key={`${u.type}-${u.id}`} 
                className={`p-4 mb-2 bg-white rounded-2xl cursor-pointer border ${selectedUser?.id === u.id ? 'border-indigo-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`} 
                onClick={() => setSelectedUser(u)}
              >
                <div className="font-black text-sm truncate">{u.full_name}</div>
                <div className="text-xs text-slate-500 mt-1 truncate">{u.phone} - {u.type === 'customer' ? '🛒 مشتری' : '👔 ویزیتور'}</div>
              </div>
            ))
          )}
        </div>

        {/* Profile Details */}
        <div className="col-span-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          {selectedUser ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-2xl">
                    {selectedUser.full_name?.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{selectedUser.full_name}</h3>
                    <p className="text-sm text-slate-500">{selectedUser.type === 'customer' ? 'مشتری' : 'ویزیتور'}</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button onClick={() => { setIsEditing(true); setEditForm(selectedUser); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">ویرایش</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">ذخیره</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold">انصراف</button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                {isEditing ? (
                  <>
                    <input className="p-3 rounded-xl border" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="تلفن" />
                    <input className="p-3 rounded-xl border" value={editForm.city || ''} onChange={e => setEditForm({...editForm, city: e.target.value})} placeholder="شهر" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border"><Phone className="w-4 h-4 text-indigo-500" /> {selectedUser.phone}</div>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedUser.city || 'نامشخص'}</div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">کاربری را از لیست انتخاب کنید</div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const UsersDocs = () => (
  <div className="p-8 max-w-4xl mx-auto text-right bg-white min-h-screen" dir="rtl">
    <h1 className="text-2xl font-black mb-6 text-slate-900">اپلیکیشن کاربران</h1>
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-bold mb-2 text-slate-900">ساختار API (views.py)</h3>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
{`class UserProfileAPIView(APIView):
    name = 'پروفایل کاربر'
    @swagger_auto_schema(
        operation_id='get_user_profile',
        operation_description="دریافت اطلاعات پروفایل کاربر",
        responses={200: 'UserSerializer()'},
        tags=["کاربران"]
    )
    def get(self, request): ...`}
        </pre>
      </div>
    </div>
  </div>
);

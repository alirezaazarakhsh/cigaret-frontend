import React from 'react';

export const Categories = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-black">اپلیکیشن دسته‌بندی</h2>
    
    <div className="bg-white p-4 rounded-xl border">
      <h3 className="font-bold mb-2">ساختار API (با توضیحات فارسی)</h3>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs">
{`@swagger_auto_schema(
    operation_id='get_categories',
    operation_description="دریافت لیست دسته‌بندی‌های کالاها",
    responses={200: 'CategorySerializer(many=True)'},
    tags=["دسته‌بندی‌ها"]
)
def get(self, request): ...`}
      </pre>
    </div>
  </div>
);

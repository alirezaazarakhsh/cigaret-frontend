import React from 'react';
import { Package } from 'lucide-react';
import { AppDocTemplate, TableErdMeta, ApiEndpointMeta } from './AppDocTemplate';
import { DJANGO_APPS_DATA } from '../data/djangoCodebase';

export const ProductsDocs: React.FC = () => {
  const catalogData = DJANGO_APPS_DATA.catalog || {
    models: '',
    admin: '',
    serializers: '',
    views: '',
    urls: '',
  };

  const erdTables: TableErdMeta[] = [
    {
      name: 'products_cigaretteproduct',
      verboseName: 'جدول محصولات دخانیات',
      description: 'کاتالوگ جامع کالاها شامل قیمت کارتن، باکس، نرخ ارز و ادیتور TinyMCE',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'name', type: 'CharField(max_length=200)', verbose: 'نام کامل کالا' },
        { name: 'brand', type: 'CharField(max_length=100)', verbose: 'برند (وینستون، کنت، مارلبرو)' },
        { name: 'category_id', type: 'ForeignKey', isFk: true, fkTarget: 'categories_category', verbose: 'دسته‌بندی' },
        { name: 'box_price', type: 'DecimalField(max_digits=12)', verbose: 'قیمت هر باکس (تومان)' },
        { name: 'boxes_per_carton', type: 'PositiveIntegerField', verbose: 'تعداد باکس در هر کارتن (معمولا ۵۰)' },
        { name: 'carton_price', type: 'DecimalField(max_digits=14)', verbose: 'قیمت هر کارتن کامل (تومان)' },
        { name: 'stock_cartons', type: 'PositiveIntegerField', verbose: 'موجودی انبار (کارتن)' },
        { name: 'full_description', type: 'HTMLField(TinyMCE)', verbose: 'توضیحات غنی با ادیتور TinyMCE' },
        { name: 'image', type: 'ImageField', verbose: 'تصویر شاخص' },
        { name: 'is_active', type: 'BooleanField', verbose: 'فعال جهت سفارش' },
      ]
    },
    {
      name: 'products_productimage',
      verboseName: 'تصاویر گالری کالا',
      description: 'گالری چندگانه تصاویر کالا با کیفیت بالا',
      fields: [
        { name: 'id', type: 'BigAutoField', isPk: true, verbose: 'شناسه' },
        { name: 'product_id', type: 'ForeignKey', isFk: true, fkTarget: 'products_cigaretteproduct', verbose: 'محصول مربوطه' },
        { name: 'image', type: 'ImageField', verbose: 'فایل تصویر' },
        { name: 'order', type: 'PositiveIntegerField', verbose: 'ترتیب نمایش' },
      ]
    }
  ];

  const endpoints: ApiEndpointMeta[] = [
    {
      method: 'GET',
      path: '/api/v1/products/',
      auth: 'AllowAny',
      description: 'فهرست محصولات با فیلتر دسته‌بندی، برند، محدوده قیمت، موجودی و جستجوی متنی',
      responseBody: JSON.stringify([
        {
          id: 1,
          name: "وینستون لایت نقره‌ای (کارتن ۵۰ باکسی)",
          brand: "وینستون (Winston)",
          category_name: "سیگار وارداتی و اولترا لایت",
          box_price: 680000,
          boxes_per_carton: 50,
          carton_price: 34000000,
          stock_cartons: 180,
          image: "/media/products/winston_light.webp",
          is_active: true
        }
      ], null, 2),
      curlExample: `curl -X GET "http://localhost:8000/api/v1/products/?brand=وینستون&in_stock=true"`
    },
    {
      method: 'GET',
      path: '/api/v1/products/{id}/',
      auth: 'AllowAny',
      description: 'مشاهده جزئیات کامل کالا، متن TinyMCE، گالری تصاویر و مشخصات ترابری'
    },
    {
      method: 'POST',
      path: '/api/v1/products/',
      auth: 'IsAdminUser',
      description: 'افزودن محصول جدید به همراه گالری تصاویر (مخصوص مدیران انبار)'
    }
  ];

  return (
    <AppDocTemplate
      appFolder="products"
      title="۷. اپلیکیشن کاتالوگ محصولات و TinyMCE"
      titleEn="products / Product Catalog App"
      badge="TinyMCE HTMLField • Multi-Pricing"
      description="مدیریت کامل کالاهای عمده دخانیات، محاسبه هوشمند قیمت کارتن و باکس، فیلد توضیحات غنی TinyMCE با پشتیبانی از فرمت‌بندی متن و جداول، گالری تصاویر چندگانه و فیلترهای پیشرفته با django-filter."
      icon={<Package className="w-6 h-6" />}
      modelsCode={catalogData.models}
      adminCode={catalogData.admin}
      serializersCode={catalogData.serializers}
      viewsCode={catalogData.views}
      urlsCode={catalogData.urls}
      erdTables={erdTables}
      endpoints={endpoints}
    />
  );
};

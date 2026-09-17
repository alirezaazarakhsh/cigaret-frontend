import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  ShieldCheck,
  Tag,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Edit3
} from 'lucide-react';
import { CigaretteProduct } from '../../types';
import { ProductList } from './ProductList';
import { CategoryList } from './CategoryList';
import { HologramList } from './HologramList';
import { FeatureList } from './FeatureList';
import { ProductEditorPage } from './ProductEditorPage';
import {
  ProductCategoryItem,
  ProductHologramItem,
  ProductFeatureItem,
  INITIAL_PRODUCT_CATEGORIES,
  INITIAL_PRODUCT_HOLOGRAMS,
  INITIAL_PRODUCT_FEATURES
} from './types';
import { formatNumberFa } from '../../utils/formatters';
import { categoriesApi, hologramsApi, attributesApi } from '../../services/api';

interface ProductManagementPanelProps {
  products: CigaretteProduct[];
  onUpdateProducts: (updatedProducts: CigaretteProduct[]) => void;
  onReturnToDashboard?: () => void;
  onNavigateToPublicStore?: () => void;
  initialTab?: 'list' | 'editor' | 'categories' | 'holograms' | 'features';
  initialBarcode?: string;
  initialEditingProduct?: CigaretteProduct | null;
  onTabChange?: (tab: string) => void;
}

export const ProductManagementPanel: React.FC<ProductManagementPanelProps> = ({
  products,
  onUpdateProducts,
  onReturnToDashboard,
  onNavigateToPublicStore,
  initialTab,
  initialBarcode,
  initialEditingProduct,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'categories' | 'holograms' | 'features'>(initialTab || 'list');
  const [currentInitialBarcode, setCurrentInitialBarcode] = useState<string>(initialBarcode || '');
  const [selectedProduct, setSelectedProduct] = useState<CigaretteProduct | null>(initialEditingProduct || null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialBarcode !== undefined) {
      setCurrentInitialBarcode(initialBarcode);
    }
  }, [initialBarcode]);

  useEffect(() => {
    if (initialEditingProduct !== undefined) {
      setSelectedProduct(initialEditingProduct);
    }
  }, [initialEditingProduct]);

  // Categories state from Django API
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const fetched = await categoriesApi.getAll();
        if (isMounted) {
          setCategories(fetched);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // Holograms state with database synchronization
  const [holograms, setHolograms] = useState<ProductHologramItem[]>(() => {
    try {
      const saved = localStorage.getItem('sevin_product_holograms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const mockIds = ['holo-iran', 'holo-dubai', 'holo-eu', 'holo-domestic', 'holo-original-bare'];
          return parsed.filter((h: any) => !mockIds.includes(h.id));
        }
      }
    } catch {}
    return INITIAL_PRODUCT_HOLOGRAMS;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHolograms = async () => {
      try {
        const data = await hologramsApi.getAll();
        if (isMounted) {
          setHolograms(data);
        }
      } catch (err) {
        console.error('Error loading holograms from DB:', err);
      }
    };
    fetchHolograms();
    return () => { isMounted = false; };
  }, []);

  // Features state with database synchronization
  const [features, setFeatures] = useState<ProductFeatureItem[]>(() => {
    try {
      const saved = localStorage.getItem('sevin_product_features');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const mockIds = ['feat-tar', 'feat-nicotine', 'feat-format', 'feat-filter', 'feat-flavor', 'feat-origin'];
          return parsed.filter((f: any) => !mockIds.includes(f.id));
        }
      }
    } catch {}
    return INITIAL_PRODUCT_FEATURES;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAttributes = async () => {
      try {
        const data = await attributesApi.getAll();
        if (isMounted) {
          setFeatures(data);
        }
      } catch (err) {
        console.error('Error loading product features/attributes from DB:', err);
      }
    };
    fetchAttributes();
    return () => { isMounted = false; };
  }, []);

  // Notification Toast state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Switch to Full-Page Editor for Products
  const handleOpenCreateProduct = () => {
    setSelectedProduct(null);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProduct = (prod: CigaretteProduct) => {
    setSelectedProduct(prod);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = (savedProd: CigaretteProduct) => {
    let updated: CigaretteProduct[];
    const exists = products.some((p) => p.id === savedProd.id);

    if (exists) {
      updated = products.map((p) => (p.id === savedProd.id ? savedProd : p));
      showToast(`محصول «${savedProd.nameFa}» با موفقیت ویرایش و در انبار مرکزی ذخیره شد.`);
    } else {
      updated = [savedProd, ...products];
      showToast(`کالای جدید «${savedProd.nameFa}» با موفقیت به انبار و کاتالوگ فروشگاه اضافه شد.`);
    }

    onUpdateProducts(updated);
    try {
      localStorage.setItem('wholesale_products', JSON.stringify(updated));
    } catch {}

    setActiveTab('list');
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (prod: CigaretteProduct) => {
    if (!window.confirm(`آیا از حذف کالای «${prod.nameFa}» از لیست محصولات مطمئن هستید؟`)) return;

    const updated = products.filter((p) => p.id !== prod.id);
    onUpdateProducts(updated);
    try {
      localStorage.setItem('wholesale_products', JSON.stringify(updated));
    } catch {}

    showToast(`محصول «${prod.nameFa}» از سیستم حذف شد.`);
  };

  // CRUD for Categories (Connected to Django Database)
  const handleAddCategory = async (newCat: ProductCategoryItem) => {
    try {
      const savedCat = await categoriesApi.create({
        name: newCat.name,
        nameEn: newCat.nameEn,
        slug: newCat.slug,
        color: newCat.color,
        description: newCat.description,
      });
      setCategories(prev => [savedCat, ...prev]);
      showToast(`دسته‌بندی «${savedCat.name}» با موفقیت در دیتابیس ثبت شد.`);
    } catch (err: any) {
      showToast(err?.message || 'خطا در ثبت دسته‌بندی در دیتابیس', 'error');
    }
  };

  const handleUpdateCategory = async (updatedCat: ProductCategoryItem) => {
    try {
      const savedCat = await categoriesApi.update(updatedCat.id, {
        name: updatedCat.name,
        nameEn: updatedCat.nameEn,
        slug: updatedCat.slug,
        color: updatedCat.color,
        description: updatedCat.description,
      });
      setCategories(prev => prev.map(c => (c.id === updatedCat.id || c.id === savedCat.id ? savedCat : c)));
      showToast(`تغییرات دسته‌بندی «${savedCat.name}» با موفقیت در دیتابیس ذخیره شد.`);
    } catch (err: any) {
      showToast(err?.message || 'خطا در ویرایش دسته‌بندی در دیتابیس', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('آیا از حذف این دسته‌بندی از دیتابیس مطمئن هستید؟')) return;
    try {
      await categoriesApi.delete(catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
      showToast('دسته‌بندی مورد نظر با موفقیت از دیتابیس حذف گردید.');
    } catch (err: any) {
      showToast(err?.message || 'خطا در حذف دسته‌بندی از دیتابیس', 'error');
    }
  };

  // CRUD for Holograms
  const handleAddHologram = async (newHolo: ProductHologramItem) => {
    try {
      const created = await hologramsApi.create({
        title: newHolo.title,
        issuer: newHolo.issuer,
        country: newHolo.country,
        securityLevel: newHolo.securityLevel,
        description: newHolo.description,
      });
      const updated = [...holograms, created];
      setHolograms(updated);
      showToast(`استاندارد هولوگرام «${created.title}» ایجاد شد.`);
    } catch (err: any) {
      console.warn('API creation failed, falling back to local state:', err);
      const updated = [...holograms, newHolo];
      setHolograms(updated);
      try {
        localStorage.setItem('sevin_product_holograms', JSON.stringify(updated));
      } catch {}
      showToast(`استاندارد هولوگرام «${newHolo.title}» ایجاد شد.`);
    }
  };

  const handleUpdateHologram = async (updatedHolo: ProductHologramItem) => {
    try {
      const updatedFromApi = await hologramsApi.update(updatedHolo.id, {
        title: updatedHolo.title,
        issuer: updatedHolo.issuer,
        country: updatedHolo.country,
        securityLevel: updatedHolo.securityLevel,
        description: updatedHolo.description,
      });
      const updated = holograms.map((h) => (h.id === updatedHolo.id ? updatedFromApi : h));
      setHolograms(updated);
      showToast(`تغییرات هولوگرام «${updatedHolo.title}» با موفقیت ذخیره شد.`);
    } catch (err: any) {
      console.warn('API update failed, falling back to local state:', err);
      const updated = holograms.map((h) => (h.id === updatedHolo.id ? updatedHolo : h));
      setHolograms(updated);
      try {
        localStorage.setItem('sevin_product_holograms', JSON.stringify(updated));
      } catch {}
      showToast(`تغییرات هولوگرام «${updatedHolo.title}» با موفقیت ذخیره شد.`);
    }
  };

  const handleDeleteHologram = async (holoId: string) => {
    try {
      await hologramsApi.delete(holoId);
    } catch (err) {
      console.warn('API delete failed:', err);
    }
    const updated = holograms.filter((h) => h.id !== holoId);
    setHolograms(updated);
    try {
      localStorage.setItem('sevin_product_holograms', JSON.stringify(updated));
    } catch {}
    showToast('هولوگرام از لیست استانداردهای کالا حذف شد.');
  };

  // CRUD for Features
  const handleAddFeature = async (newFeat: ProductFeatureItem) => {
    try {
      const created = await attributesApi.create({
        nameFa: newFeat.nameFa,
        nameEn: newFeat.nameEn,
        type: newFeat.type,
        unit: newFeat.unit,
        description: newFeat.description,
      });
      const updated = [...features, created];
      setFeatures(updated);
      showToast(`مشخصه فنی «${created.nameFa}» به شناسنامه کالا اضافه شد.`);
    } catch (err: any) {
      console.warn('API feature creation failed, falling back to local state:', err);
      const updated = [...features, newFeat];
      setFeatures(updated);
      try {
        localStorage.setItem('sevin_product_features', JSON.stringify(updated));
      } catch {}
      showToast(`مشخصه فنی «${newFeat.nameFa}» به شناسنامه کالا اضافه شد.`);
    }
  };

  const handleUpdateFeature = async (updatedFeat: ProductFeatureItem) => {
    try {
      const updatedFromApi = await attributesApi.update(updatedFeat.id, {
        nameFa: updatedFeat.nameFa,
        nameEn: updatedFeat.nameEn,
        type: updatedFeat.type,
        unit: updatedFeat.unit,
        description: updatedFeat.description,
      });
      const updated = features.map((f) => (f.id === updatedFeat.id ? updatedFromApi : f));
      setFeatures(updated);
      showToast(`تغییرات مشخصه فنی «${updatedFeat.nameFa}» با موفقیت ذخیره شد.`);
    } catch (err: any) {
      console.warn('API feature update failed, falling back to local state:', err);
      const updated = features.map((f) => (f.id === updatedFeat.id ? updatedFeat : f));
      setFeatures(updated);
      try {
        localStorage.setItem('sevin_product_features', JSON.stringify(updated));
      } catch {}
      showToast(`تغییرات مشخصه فنی «${updatedFeat.nameFa}» با موفقیت ذخیره شد.`);
    }
  };

  const handleDeleteFeature = async (featId: string) => {
    try {
      await attributesApi.delete(featId);
    } catch (err) {
      console.warn('API feature delete failed:', err);
    }
    const updated = features.filter((f) => f.id !== featId);
    setFeatures(updated);
    try {
      localStorage.setItem('sevin_product_features', JSON.stringify(updated));
    } catch {}
    showToast('مشخصه فنی از سیستم حذف شد.');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/80 text-slate-900 font-sans pb-16" dir="rtl">
      {/* TOP HEADER BAR - Matching BlogManagementPanel */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  مدیریت جامع کالاها و محصولات
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                  Django Store Engine
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                کاتالوگ عمده، موجودی انبار جنت‌آباد، دسته‌بندی‌ها، هولوگرام‌ها و مشخصات فنی کالا
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="px-3 sm:px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به صندوق</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onNavigateToPublicStore) {
                  onNavigateToPublicStore();
                } else {
                  window.location.href = '/';
                }
              }}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>مشاهده کاتالوگ فروشگاه</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateProduct}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن محصول جدید</span>
            </button>
          </div>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-100 overflow-x-auto">
          {/* Tab 1: Product List */}
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>فهرست محصولات</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(products.length)}
            </span>
          </button>

          {/* Tab 2: Categories */}
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مدیریت دسته‌بندی‌ها</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(categories.length)}
            </span>
          </button>

          {/* Tab 3: Holograms */}
          <button
            type="button"
            onClick={() => setActiveTab('holograms')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'holograms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مدیریت هولوگرام‌ها</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(holograms.length)}
            </span>
          </button>

          {/* Tab 4: Features */}
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>مدیریت ویژگی‌های محصولات</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(features.length)}
            </span>
          </button>
          {/* Tab: Editor (Active when editing or creating) */}
          {activeTab === 'editor' && (
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className="py-3 px-3 sm:px-4 text-xs font-black border-b-2 border-blue-600 text-blue-600 flex items-center gap-2 transition-all whitespace-nowrap bg-blue-50/50"
            >
              <Edit3 className="w-4 h-4" />
              <span>{selectedProduct ? `ویرایش: ${selectedProduct.nameFa}` : 'ثبت کالای جدید'}</span>
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="w-full px-3 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'editor' && (
          <ProductEditorPage
            product={selectedProduct}
            initialBarcode={currentInitialBarcode}
            categories={categories}
            holograms={holograms}
            features={features}
            onSave={(savedProd) => {
              handleSaveProduct(savedProd);
              setCurrentInitialBarcode('');
            }}
            onCancel={() => {
              setActiveTab('list');
              setSelectedProduct(null);
              setCurrentInitialBarcode('');
            }}
          />
        )}

        {activeTab === 'list' && (
          <ProductList
            products={products}
            categories={categories}
            holograms={holograms}
            onOpenCreate={handleOpenCreateProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryList
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'holograms' && (
          <HologramList
            holograms={holograms}
            products={products}
            onAddHologram={handleAddHologram}
            onUpdateHologram={handleUpdateHologram}
            onDeleteHologram={handleDeleteHologram}
          />
        )}

        {activeTab === 'features' && (
          <FeatureList
            features={features}
            onAddFeature={handleAddFeature}
            onUpdateFeature={handleUpdateFeature}
            onDeleteFeature={handleDeleteFeature}
          />
        )}
      </div>
    </div>
  );
};

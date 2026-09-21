import React, { useState, useEffect } from 'react';
import { 
  PackagePlus, 
  Barcode, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  DollarSign, 
  Boxes, 
  ShoppingCart,
  ShieldCheck,
  Tag,
  Package,
  Plus,
  Database,
  Search,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Flame,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
  RefreshCw,
  PlusCircle,
  Link,
  ChevronRight,
  ChevronLeft,
  Upload
} from 'lucide-react';
import { CigaretteProduct, CigaretteCategory } from '../../types';
import { formatToman } from '../../utils/formatters';
import { 
  fetchDjangoCategories, 
  fetchDjangoHolograms, 
  saveProductToDjango,
  djangoDatabaseStore
} from '../../services/djangoApi';

interface ProductManagerPanelProps {
  onClose?: () => void;
  onProductSaved?: (product: CigaretteProduct) => void;
}

export const ProductManagerPanel: React.FC<ProductManagerPanelProps> = ({
  onClose,
  onProductSaved
}) => {
  // Store products list
  const [products, setProducts] = useState<CigaretteProduct[]>(() => 
    djangoDatabaseStore.getProducts()
  );

  // View state: 'list' or 'form'
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Search and filter for list view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Categories and Holograms state
  const [categories, setCategories] = useState<{ key: CigaretteCategory; label: string }[]>(() => 
    djangoDatabaseStore.getCategories()
  );
  const [holograms, setHolograms] = useState<string[]>(() => 
    djangoDatabaseStore.getHolograms()
  );

  useEffect(() => {
    fetchDjangoCategories().then(cats => setCategories(cats));
    fetchDjangoHolograms().then(hols => setHolograms(hols));
  }, []);

  // Form Fields State
  // Step 1: Main Info & Commercial
  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('دخانیات سرو');
  const [origin, setOrigin] = useState('وارداتی اصل');
  const [excerpt, setExcerpt] = useState('');

  // Step 2: Category, Hologram & Badges
  const [category, setCategory] = useState<CigaretteCategory>('cigarettes');
  const [hologram, setHologram] = useState<string>('اورجینال اروپایی');
  const [badge, setBadge] = useState<string>('none');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isPosOnly, setIsPosOnly] = useState<boolean>(false);
  const [isBoxOnly, setIsBoxOnly] = useState<boolean>(false);

  // Step 3: Pricing & Inventory
  const [cartonPrice, setCartonPrice] = useState<number>(45000000);
  const [boxPrice, setBoxPrice] = useState<number>(900000);
  const [packPrice, setPackPrice] = useState<number>(90000);
  const [purchasePrice, setPurchasePrice] = useState<number>(40000000);
  const [stockCartons, setStockCartons] = useState<number>(10);
  const [stockBoxes, setStockBoxes] = useState<number>(50);
  const [boxesPerCarton, setBoxesPerCarton] = useState<number>(50);
  const [packsPerBox, setPacksPerBox] = useState<number>(10);
  const [moq, setMoq] = useState<number>(1);
  const [moqBox, setMoqBox] = useState<number>(1);
  const [hasCarton, setHasCarton] = useState<boolean>(true);
  const [hasBox, setHasBox] = useState<boolean>(true);
  const [hasPack, setHasPack] = useState<boolean>(true);

  // Step 4: Technical Specs
  const [tar, setTar] = useState<string>('6mg');
  const [nicotine, setNicotine] = useState<string>('0.5mg');
  const [carbonMonoxide, setCarbonMonoxide] = useState<string>('5mg');
  const [cigaretteSize, setCigaretteSize] = useState<string>('king_size');
  const [filterType, setFilterType] = useState<string>('white');

  // Step 5: Images, Gallery, SEO & Description
  const [mainImage, setMainImage] = useState<string>('https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&fit=crop&w=600&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState<string>('');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');
  const [fullDescription, setFullDescription] = useState<string>('');
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [canonicalUrl, setCanonicalUrl] = useState<string>('');

  // Auto generate slug from English or Persian name
  const handleNameFaChange = (val: string) => {
    setNameFa(val);
    if (!slug) {
      setSlug(val.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  };

  // Reset or Load product for editing
  const handleOpenCreateNew = () => {
    setEditingProductId(null);
    setNameFa('');
    setNameEn('');
    setSlug('');
    setBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString());
    setBrand('دخانیات سرو');
    setOrigin('وارداتی اصل');
    setExcerpt('');
    setCategory('cigarettes');
    setHologram('اورجینال اروپایی');
    setBadge('none');
    setIsAvailable(true);
    setIsFeatured(false);
    setIsPosOnly(false);
    setIsBoxOnly(false);
    setCartonPrice(45000000);
    setBoxPrice(900000);
    setPackPrice(90000);
    setPurchasePrice(40000000);
    setStockCartons(10);
    setStockBoxes(50);
    setBoxesPerCarton(50);
    setPacksPerBox(10);
    setMoq(1);
    setMoqBox(1);
    setHasCarton(true);
    setHasBox(true);
    setHasPack(true);
    setTar('6mg');
    setNicotine('0.5mg');
    setCarbonMonoxide('5mg');
    setCigaretteSize('king_size');
    setFilterType('white');
    setMainImage('https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&fit=crop&w=600&q=80');
    setGalleryImages([]);
    setKeyTakeaways([]);
    setFullDescription('');
    setFocusKeyword('');
    setMetaTitle('');
    setMetaDescription('');
    setCanonicalUrl('');
    setCurrentStep(1);
    setActiveTab('form');
  };

  const handleEditProduct = (prod: CigaretteProduct) => {
    setEditingProductId(prod.id);
    setNameFa(prod.nameFa || '');
    setNameEn(prod.nameEn || '');
    setSlug(prod.slug || prod.id);
    setBarcode(prod.barcode || '');
    setBrand(prod.brand || 'دخانیات سرو');
    setOrigin(prod.origin || 'وارداتی اصل');
    setExcerpt(prod.excerpt || '');
    setCategory(prod.category || 'cigarettes');
    setHologram(prod.hologram || 'اورجینال اروپایی');
    setBadge(prod.badge || 'none');
    setIsAvailable(prod.isAvailable ?? true);
    setIsFeatured(prod.badge === 'پیشنهاد ویژه');
    setIsPosOnly(prod.isPosOnly ?? false);
    setIsBoxOnly(prod.isBoxOnly ?? false);
    setCartonPrice(prod.cartonPrice || 0);
    setBoxPrice(prod.boxPrice || 0);
    setPackPrice(prod.packPrice || 0);
    setPurchasePrice(prod.purchasePrice || 0);
    setStockCartons(prod.stockCartons || 0);
    setStockBoxes(prod.stockBoxes || 0);
    setBoxesPerCarton(prod.boxesPerCarton || 50);
    setPacksPerBox(prod.packsPerBox || 10);
    setMoq(prod.moq || 1);
    setMoqBox(prod.moqBox || 1);
    setHasCarton(prod.hasCarton ?? true);
    setHasBox(prod.hasBox ?? true);
    setHasPack(prod.hasPack ?? true);
    setTar(prod.tar || '6mg');
    setNicotine(prod.nicotine || '0.5mg');
    setCarbonMonoxide('5mg');
    setCigaretteSize('king_size');
    setFilterType('white');
    setMainImage(prod.image || '');
    setGalleryImages(prod.images || []);
    setKeyTakeaways(prod.keyTakeaways || []);
    setFullDescription(prod.description || '');
    setFocusKeyword(prod.focusKeyword || '');
    setMetaTitle(prod.metaTitle || '');
    setMetaDescription(prod.metaDescription || '');
    setCanonicalUrl('');
    setCurrentStep(1);
    setActiveTab('form');
  };

  // Add Gallery Image
  const handleAddGalleryImage = () => {
    if (newGalleryInput.trim()) {
      setGalleryImages(prev => [...prev, newGalleryInput.trim()]);
      setNewGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Upload/Read file locally as base64
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setMainImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setGalleryImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Key Takeaway
  const handleAddKeyTakeaway = () => {
    if (newTakeawayInput.trim()) {
      setKeyTakeaways(prev => [...prev, newTakeawayInput.trim()]);
      setNewTakeawayInput('');
    }
  };

  const handleRemoveKeyTakeaway = (index: number) => {
    setKeyTakeaways(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      alert('لطفاً نام فارسی محصول را وارد نمایید.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    const productPayload: CigaretteProduct = {
      id: editingProductId || `prod_${Date.now()}`,
      djangoId: editingProductId ? editingProductId : undefined,
      nameFa,
      nameEn,
      slug: slug || nameFa.trim().toLowerCase().replace(/\s+/g, '-'),
      barcode: barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      brand,
      category,
      origin,
      tar,
      nicotine,
      cartonPrice,
      boxPrice,
      packPrice,
      purchasePrice,
      stockCartons,
      stockBoxes,
      boxesPerCarton,
      packsPerBox,
      moq,
      moqBox,
      image: mainImage || 'https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&fit=crop&w=600&q=80',
      images: galleryImages,
      badge: badge !== 'none' ? badge : undefined,
      hologram,
      isAvailable,
      hasCarton,
      hasBox,
      hasPack,
      isBoxOnly,
      isPosOnly,
      description: fullDescription || excerpt,
      excerpt,
      keyTakeaways,
      metaTitle,
      metaDescription,
      focusKeyword,
      lastPriceUpdate: 'امروز',
      tierDiscounts: [
        { minCartons: 10, discountPercentage: 2, label: 'تخفیف ۱۰ کارتنی (۲٪)' },
        { minCartons: 25, discountPercentage: 4, label: 'تخفیف ۲۵ کارتنی (۴٪)' }
      ]
    };

    try {
      await saveProductToDjango(productPayload);
      
      // Update local state list
      const updatedList = djangoDatabaseStore.getProducts();
      setProducts(updatedList);

      setSaveSuccessMessage(
        editingProductId 
          ? 'محصول با موفقیت در سیستم و دیتابیس دجانگو بروزرسانی شد.' 
          : 'محصول جدید با تمامی مشخصات و گالری در دیتابیس ثبت گردید.'
      );

      if (onProductSaved) {
        onProductSaved(productPayload);
      }

      setTimeout(() => {
        setSaveSuccessMessage(null);
        setActiveTab('list');
        setIsSubmitting(false);
      }, 1200);

    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('خطا در ذخیره‌سازی محصول در پایگاه‌داده. لطفا مجددا تلاش کنید.');
    }
  };

  // Filtered Products for List View
  const filteredProducts = products.filter(p => {
    const matchSearch = (p.nameFa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.barcode || '').includes(searchTerm);
    const matchCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  const stepsList = [
    { num: 1, title: 'اطلاعات اصلی', desc: 'شناسه تجاری و نام کالا' },
    { num: 2, title: 'دسته و هولوگرام', desc: 'اصالت و برچسب ویژه' },
    { num: 3, title: 'قیمت و انبارداری', desc: 'نرخ کارتن، باکس و موجودی' },
    { num: 4, title: 'مشخصات فنی', desc: 'قطران، نیکوتین و فیلتر' },
    { num: 5, title: 'رسانه و سئو', desc: 'گالری تصاویر و محتوا' },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 font-sans dir-rtl">
      {/* Top Bar Header */}
      <div className="max-w-7xl mx-auto mb-6 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 sm:p-6 backdrop-blur shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <PackagePlus className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                پنل مدیریت کامل محصولات انبار
              </h1>
              <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-500/20 font-mono">
                Django API
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              مدیریت و فرم ۵ مرحله‌ای ثبت کالا بر اساس استاندارد دیتابیس آذرخش
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            فهرست محصولات ({products.length})
          </button>

          <button
            onClick={handleOpenCreateNew}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'form' && !editingProductId
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            تعریف کالا جدید
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="max-w-7xl mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{saveSuccessMessage}</span>
        </div>
      )}

      {/* LIST VIEW TAB */}
      {activeTab === 'list' && (
        <div className="max-w-7xl mx-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در نام، برند یا بارکد..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
              >
                <option value="all">همه دسته‌بندی‌ها</option>
                {categories.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>

              <button
                onClick={() => setProducts(djangoDatabaseStore.getProducts())}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="بروزرسانی لیست"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Grid View (Hidden on Desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-900/40 rounded-xl border border-slate-700/40">
                هیچ کالایی متناسب با جستجو یافت نشد.
              </div>
            ) : (
              filteredProducts.map(prod => (
                <div key={prod.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <img 
                      src={prod.image || 'https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&fit=crop&w=600&q=80'} 
                      alt={prod.nameFa} 
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-xs sm:text-sm truncate">{prod.nameFa}</div>
                      {prod.nameEn && <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{prod.nameEn}</div>}
                      <div className="text-[10px] text-slate-500 font-mono mt-1">بارکد: {prod.barcode}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-slate-800 py-2.5">
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">برند / اصالت:</div>
                      <div className="text-blue-400 font-medium">{prod.brand}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{prod.hologram}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">موجودی انبار:</div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                        prod.stockCartons > 5 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {prod.stockCartons} کارتن ({prod.stockBoxes || 0} باکس)
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">قیمت کارتن:</div>
                      <div className="text-emerald-400 font-bold">{formatToman(prod.cartonPrice)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold mb-0.5">قیمت باکس:</div>
                      <div className="text-slate-300 font-bold">{formatToman(prod.boxPrice)}</div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleEditProduct(prod)}
                      className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ویرایش محصول</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="w-full text-right text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">تصویر</th>
                  <th className="p-3">نام محصول</th>
                  <th className="p-3">برند & دسته</th>
                  <th className="p-3">قیمت هر کارتن</th>
                  <th className="p-3">قیمت هر باکس</th>
                  <th className="p-3">موجودی (کارتن)</th>
                  <th className="p-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      هیچ کالایی متناسب با جستجو یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3">
                        <img 
                          src={prod.image || 'https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&fit=crop&w=600&q=80'} 
                          alt={prod.nameFa} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{prod.nameFa}</div>
                        {prod.nameEn && <div className="text-xs text-slate-400 font-mono">{prod.nameEn}</div>}
                        <div className="text-[11px] text-slate-500 mt-0.5">بارکد: {prod.barcode}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-500/20 mb-1">
                          {prod.brand}
                        </span>
                        <div className="text-xs text-slate-400">{prod.hologram}</div>
                      </td>
                      <td className="p-3 font-semibold text-emerald-400">
                        {formatToman(prod.cartonPrice)}
                      </td>
                      <td className="p-3 font-medium text-slate-300">
                        {formatToman(prod.boxPrice)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          prod.stockCartons > 5 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {prod.stockCartons} کارتن ({prod.stockBoxes || 0} باکس)
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          ویرایش
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM WIZARD TAB */}
      {activeTab === 'form' && (
        <div className="max-w-7xl mx-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8 bg-slate-900/60 p-2 rounded-2xl border border-slate-700/50">
            {stepsList.map(step => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`p-3 rounded-xl transition-all text-right flex flex-col justify-between border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                      : isDone
                      ? 'bg-slate-800 text-slate-200 border-emerald-500/40 hover:bg-slate-700'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">گام {step.num}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{step.title}</div>
                    <div className="text-[10px] opacity-70 mt-0.5 hidden sm:block truncate">{step.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Main Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">۱. اطلاعات اصلی و شناسه تجاری کالا</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      نام فارسی کالا <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سیگار وینستون لایت"
                      value={nameFa}
                      onChange={e => handleNameFaChange(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      نام لاتین / انگلیسی کالا (English Name)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: Winston Light"
                      value={nameEn}
                      onChange={e => setNameEn(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      پیوند یکتا (Slug URL)
                    </label>
                    <input
                      type="text"
                      placeholder="winston-light"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      برند سازنده
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: وینستون / دخانیات سرو"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      کشور سازنده / مبدا بار
                    </label>

                    <input
                      type="text"
                      placeholder="مثال: سوئیس اصل / ایران / ارمنستان"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      بارکد اختصاصی کالا (Barcode)
                    </label>
                    <div className="relative">
                      <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="6260000000000"
                        value={barcode}
                        onChange={e => setBarcode(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pr-3 pl-9 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    خلاصه و معرفی کوتاه محصول (Excerpt)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="توضیح کوتاه درباره کیفیت، طعم و بسته بندی محصول..."
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Category, Hologram & Badges */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">۲. دسته‌بندی، هولوگرام و برچسب تجاری</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      دسته‌بندی محصول
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as CigaretteCategory)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      هولوگرام و اصالت کالا
                    </label>
                    <select
                      value={hologram}
                      onChange={e => setHologram(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {holograms.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      نشان ویژه (Badge)
                    </label>
                    <select
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="none">بدون نشان</option>
                      <option value="bestseller">پرفروشترین</option>
                      <option value="special">پیشنهاد ویژه</option>
                      <option value="new">جدیدترین</option>
                      <option value="discount">تخفیف ویژه</option>
                      <option value="import">وارداتی اصل</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={e => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-600"
                    />
                    <span className="text-sm font-semibold text-slate-200">وضعیت کالا (موجود/فعال)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={e => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-600"
                    />
                    <span className="text-sm font-semibold text-amber-300">نمایش در پیشنهاد ویژه هوم‌پیج</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPosOnly}
                      onChange={e => setIsPosOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-500 focus:ring-0 bg-slate-800 border-slate-600"
                    />
                    <span className="text-sm font-semibold text-purple-300">اختصاصی صندوق POS (مخفی از آنلاین)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBoxOnly}
                      onChange={e => setIsBoxOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-400 focus:ring-0 bg-slate-800 border-slate-600"
                    />
                    <span className="text-sm font-semibold text-slate-300">فقط فروش باکسی (فاقد کارتن)</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Pricing & Inventory */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">۳. قیمت‌گذاری عمده، سطوح فروش و موجودی انبار</h3>
                </div>

                {/* Level toggles */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 flex flex-wrap gap-4 items-center">
                  <span className="text-xs font-bold text-slate-400">سطوح فروش مجاز:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                    <input type="checkbox" checked={hasCarton} onChange={e => setHasCarton(e.target.checked)} className="rounded bg-slate-800 border-slate-600" />
                    فروش کارتنی
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                    <input type="checkbox" checked={hasBox} onChange={e => setHasBox(e.target.checked)} className="rounded bg-slate-800 border-slate-600" />
                    فروش باکسی
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                    <input type="checkbox" checked={hasPack} onChange={e => setHasPack(e.target.checked)} className="rounded bg-slate-800 border-slate-600" />
                    فروش تک/پاکتی
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      قیمت هر کارتن (تومان)
                    </label>
                    <input
                      type="number"
                      value={cartonPrice}
                      onChange={e => setCartonPrice(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-emerald-500"
                    />
                    <div className="text-[11px] text-emerald-400/80 mt-1">{formatToman(cartonPrice)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-400 mb-1">
                      قیمت هر باکس / جین (تومان)
                    </label>
                    <input
                      type="number"
                      value={boxPrice}
                      onChange={e => setBoxPrice(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500"
                    />
                    <div className="text-[11px] text-blue-400/80 mt-1">{formatToman(boxPrice)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-400 mb-1">
                      قیمت تک هر پاکت (تومان)
                    </label>
                    <input
                      type="number"
                      value={packPrice}
                      onChange={e => setPackPrice(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-purple-500"
                    />
                    <div className="text-[11px] text-purple-400/80 mt-1">{formatToman(packPrice)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      قیمت خرید فاکتور / تمام‌شده (تومان)
                    </label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={e => setPurchasePrice(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">{formatToman(purchasePrice)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      موجودی انبار (کارتن)
                    </label>
                    <input
                      type="number"
                      value={stockCartons}
                      onChange={e => setStockCartons(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-amber-400/80 mb-1">
                      موجودی فله انبار (باکس)
                    </label>
                    <input
                      type="number"
                      value={stockBoxes}
                      onChange={e => setStockBoxes(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      تعداد باکس در کارتن
                    </label>
                    <input
                      type="number"
                      value={boxesPerCarton}
                      onChange={e => setBoxesPerCarton(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      تعداد پاکت در باکس
                    </label>
                    <input
                      type="number"
                      value={packsPerBox}
                      onChange={e => setPacksPerBox(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      حداقل سفارش کارتن (MOQ Cartons)
                    </label>
                    <input
                      type="number"
                      value={moq}
                      onChange={e => setMoq(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      حداقل سفارش باکس (MOQ Boxes)
                    </label>
                    <input
                      type="number"
                      value={moqBox}
                      onChange={e => setMoqBox(Number(e.target.value))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Technical Specs */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">۴. مشخصات فنی و شناسنامه استاندارد دود</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      میزان قطران (Tar - mg)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 6mg"
                      value={tar}
                      onChange={e => setTar(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      میزان نیکوتین (Nicotine - mg)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 0.5mg"
                      value={nicotine}
                      onChange={e => setNicotine(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      میزان کربن مونوکسید (Carbon Monoxide)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 5mg"
                      value={carbonMonoxide}
                      onChange={e => setCarbonMonoxide(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      سایز سیگار (Cigarette Size)
                    </label>
                    <select
                      value={cigaretteSize}
                      onChange={e => setCigaretteSize(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="king_size">کینگ سایز (King Size)</option>
                      <option value="slims">اسلیم / باریک (Slims)</option>
                      <option value="super_slims">سوپر اسلیم (Super Slims)</option>
                      <option value="nano">نانو (Nano)</option>
                      <option value="compact">کامپکت (Compact)</option>
                      <option value="queen_size">کویین سایز (Queen Size)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      نوع فیلتر (Filter Type)
                    </label>
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="white">فیلتر سفید استاندارد</option>
                      <option value="yellow">فیلتر زرد سنتی</option>
                      <option value="charcoal">فیلتر کربن / زغالی</option>
                      <option value="recessed">فیلتر مجوف (Recessed)</option>
                      <option value="capsule">فیلتر طعمدار / پاور (Capsule)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Images, Gallery, Key Takeaways & SEO */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-700 pb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">۵. رسانه، گالری تصاویر و تنظیمات سئو Yoast</h3>
                </div>

                {/* Main Image */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/80 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      آدرس تصویر اصلی کالا (Main Image URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={mainImage}
                        onChange={e => setMainImage(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono dir-ltr"
                      />
                      <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0">
                        <Upload className="w-4 h-4 text-blue-400" />
                        آپلود فایل اصلی
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {mainImage && (
                    <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700 w-fit">
                      <img src={mainImage} alt="Main preview" className="w-12 h-12 object-cover rounded-lg border border-slate-600" />
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-300 font-bold">پیش‌نمایش تصویر اصلی شاخص</span>
                        <span className="text-[10px] text-slate-500 font-mono max-w-[200px] truncate" dir="ltr">
                          {mainImage.startsWith('data:') ? 'تصویر آپلود شده (Base64)' : mainImage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Images Array Upload */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-3">
                  <label className="block text-xs font-semibold text-purple-300 mb-1">
                    گالری تصاویر محصول (علاوه بر تصویر شاخص بالا)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="آدرس اینترنتی تصویر گالری..."
                      value={newGalleryInput}
                      onChange={e => setNewGalleryInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono dir-ltr"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        افزودن با لینک
                      </button>
                      <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0">
                        <Upload className="w-4 h-4 text-purple-400" />
                        آپلود چند تصویر
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-square">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 transition-colors shadow-md animate-scaleIn"
                              title="حذف از گالری"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      هیچ تصویر دیگری برای گالری این محصول اضافه نشده است.
                    </div>
                  )}
                </div>

                {/* Key Takeaways */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <label className="block text-xs font-semibold text-emerald-300 mb-2">
                    نکات کلیدی محصول (Key Takeaways)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="مثال: فیلتر ساخت آلمان با طعم ملایم"
                      value={newTakeawayInput}
                      onChange={e => setNewTakeawayInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyTakeaway}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن نکته
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {keyTakeaways.map((item, idx) => (
                      <span key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-lg flex items-center gap-2">
                        {item}
                        <button type="button" onClick={() => handleRemoveKeyTakeaway(idx)} className="hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نقد و بررسی و توضیحات جامع محصول (TinyMCE / HTML)
                  </label>
                  <textarea
                    rows={5}
                    placeholder="توضیحات مفصل محصول..."
                    value={fullDescription}
                    onChange={e => setFullDescription(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* SEO Yoast */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      کلیدواژه اصلی سئو (Focus Keyword)
                    </label>
                    <input
                      type="text"
                      placeholder="خرید عمده سیگار وینستون"
                      value={focusKeyword}
                      onChange={e => setFocusKeyword(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      عنوان سئو (Meta Title)
                    </label>
                    <input
                      type="text"
                      placeholder="قیمت عمده سیگار وینستون | فروشگاه آذرخش"
                      value={metaTitle}
                      onChange={e => setMetaTitle(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    توضیحات سئو (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="توضیحات متای گوگل..."
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 bg-slate-900/95 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4 shadow-2xl backdrop-blur mt-8">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                    مرحله قبل
                  </button>
                )}
                {currentStep < 5 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    مرحله بعد
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 shadow-lg ${
                    isSubmitting 
                      ? 'bg-emerald-700/80 text-emerald-100 cursor-not-allowed shadow-none' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>{editingProductId ? 'در حال ثبت تغییرات دیتابیس...' : 'در حال ایجاد کالا جدید...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProductId ? 'بروزرسانی نهایی کالا' : 'ثبت و ذخیره‌سازی نهایی در انبار'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

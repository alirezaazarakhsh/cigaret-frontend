import React, { useState, useRef, useMemo } from 'react';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import {
  ArrowRight,
  Check,
  Package,
  Sparkles,
  Tag,
  Eye,
  Sliders,
  Laptop,
  Smartphone,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  ShieldCheck,
  Layers,
  Barcode,
  Coins,
  Warehouse,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  FileText,
  Loader2,
  Database,
  CheckCircle2
} from 'lucide-react';
import { CigaretteProduct, CigaretteCategory, ProductAppliedFeature, WholesaleTierDiscount } from '../../types';
import { ProductCategoryItem, ProductHologramItem, ProductFeatureItem, INITIAL_PRODUCT_FEATURES } from './types';
import { TinyMceEditor } from '../common/TinyMceEditor';
import { calculateProductYoastSeo, ProductYoastSeoReport } from './seoUtils';
import { formatNumberFa } from '../../utils/formatters';
import { getFrontendDomain } from '../../services/apiConfig';
import { attributesApi } from '../../services/api';

interface ProductEditorPageProps {
  product: CigaretteProduct | null;
  initialBarcode?: string;
  categories: ProductCategoryItem[];
  holograms: ProductHologramItem[];
  features?: ProductFeatureItem[];
  onSave: (savedProduct: CigaretteProduct) => Promise<void> | void;
  onCancel: () => void;
  onAddFeature?: (feature: ProductFeatureItem) => Promise<void> | void;
}

const COMMON_BRANDS = [
  'وینستون (Winston)',
  'کنت (Kent)',
  'مارلبرو (Marlboro)',
  'بهمن (Bahman)',
  'اسکار (Oscar)',
  'سناتور (Senator)',
  'منچستر (Manchester)',
  'اسه (Esse)',
  'جی ون (G1)',
  'موند (Mond)',
  'کاپیتان بلک (Captain Black)',
  'پال مال (Pall Mall)'
];

const COMMON_ORIGINS = [
  'سوئیس اصل (Duty Free)',
  'ترکیه (سفارش اروپا)',
  'ایران (دخانیات ایران)',
  'امارات (سفارش دبی)',
  'ارمنستان',
  'آلمان',
  'لهستان',
  'روسیه'
];

export const CIGARETTE_SIZE_CHOICES = [
  { value: 'king_size', label: 'کینگ سایز (King Size)' },
  { value: 'slims', label: 'اسلیم / باریک (Slims)' },
  { value: 'super_slims', label: 'سوپر اسلیم (Super Slims)' },
  { value: 'nano', label: 'نانو (Nano)' },
  { value: 'compact', label: 'کامپکت (Compact)' },
  { value: 'queen_size', label: 'کویین سایز (Queen Size)' },
];

export const FILTER_TYPE_CHOICES = [
  { value: 'white', label: 'فیلتر سفید استاندارد (White)' },
  { value: 'yellow', label: 'فیلتر زرد سنتی (Yellow / Cork)' },
  { value: 'charcoal', label: 'فیلتر کربن / زغالی (Charcoal)' },
  { value: 'recessed', label: 'فیلتر مجوف (Recessed)' },
  { value: 'capsule', label: 'فیلتر طعم‌دار / پاور (Capsule)' },
];

export const ProductEditorPage: React.FC<ProductEditorPageProps> = ({
  product,
  initialBarcode,
  categories,
  holograms,
  features,
  onSave,
  onCancel,
  onAddFeature,
}) => {
  const isEditing = Boolean(product && product.id);

  // Initial form data
  const initialFormValues = useMemo(() => {
    if (product) {
      const initialApplied = product.appliedFeatures && product.appliedFeatures.length > 0
        ? product.appliedFeatures
        : [
            { id: 'feat-tar', featureId: 'feat-tar', nameFa: 'قطران (Tar)', value: product.tar ? product.tar.replace(/[^0-9.]/g, '') || product.tar : '6', unit: 'mg' },
            { id: 'feat-nicotine', featureId: 'feat-nicotine', nameFa: 'نیکوتین (Nicotine)', value: product.nicotine ? product.nicotine.replace(/[^0-9.]/g, '') || product.nicotine : '0.5', unit: 'mg' },
            { id: 'feat-format', featureId: 'feat-format', nameFa: 'سایز و اندازه پاکت (Format)', value: product.packSize || 'کینگ سایز (King Size)' },
            { id: 'feat-flavor', featureId: 'feat-flavor', nameFa: 'طعم و اسانس (Flavor)', value: product.flavor || 'توتون خالص طبیعی (Original)' },
            { id: 'feat-filter', featureId: 'feat-filter', nameFa: 'نوع فیلتر (Filter Technology)', value: product.filterType || 'فیلتر سفید استاندارد' },
            { id: 'feat-origin', featureId: 'feat-origin', nameFa: 'کشور سازنده و مبدأ', value: product.origin || 'سوئیس اصل (Duty Free)' },
          ];

      const initialIsFeatured = Boolean(
        product.isFeatured !== undefined 
          ? product.isFeatured 
          : ((product as any).is_featured || product.badge === 'پیشنهاد ویژه' || product.badge === 'special')
      );

      return {
        ...product,
        barcode: product.barcode || initialBarcode || '',
        purchasePrice: product.purchasePrice !== undefined ? Number(product.purchasePrice) : 0,
        stockBoxes: product.stockBoxes !== undefined ? Number(product.stockBoxes) : 0,
        moq: (product.moq !== undefined && product.moq !== null) ? Number(product.moq) : 0,
        moqBox: (product.moqBox !== undefined && product.moqBox !== null) ? Number(product.moqBox) : 0,
        tierDiscounts: product.tierDiscounts ? [...product.tierDiscounts] : [],
        slug: product.slug || product.nameEn?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${product.id}`,
        keyTakeaways: product.keyTakeaways || [],
        focusKeyword: product.focusKeyword || `${product.nameFa || ''}`.trim(),
        metaTitle: product.metaTitle || product.nameFa || '',
        metaDescription: product.metaDescription || product.excerpt || '',
        excerpt: product.excerpt || '',
        cigaretteSize: product.cigaretteSize || product.packSize || (product as any).cigarette_size || 'king_size',
        packSize: product.packSize || product.cigaretteSize || (product as any).cigarette_size || 'king_size',
        filterType: product.filterType || (product as any).filter_type || 'white',
        isFeatured: initialIsFeatured,
        appliedFeatures: initialApplied,
        images: product.images ? [...product.images] : [],
      };
    }
    return {
      nameFa: '',
      nameEn: '',
      brand: 'وینستون (Winston)',
      category: 'cigarettes' as CigaretteCategory,
      origin: 'سوئیس اصل (Duty Free)',
      tar: '6 mg',
      nicotine: '0.5 mg',
      cigaretteSize: 'king_size',
      packSize: 'king_size',
      packagingType: 'باکس هارد (Hard Box)',
      manufacturer: 'JTI / شرکت دخانیات بین‌المللی',
      cartonPrice: 0,
      boxPrice: 0,
      packPrice: 0,
      purchasePrice: 0,
      boxesPerCarton: 50,
      packsPerBox: 10,
      stockCartons: 10,
      stockBoxes: 0,
      moq: 0,
      moqBox: 0,
      image: '',
      barcode: initialBarcode || '',
      flavor: 'طعم کلاسیک توتون',
      filterType: 'white',
      badge: 'بار تازه',
      priceTrend: 'stable',
      lastPriceUpdate: new Date().toLocaleDateString('fa-IR'),
      hologram: 'شرکتی اصل',
      description: '',
      excerpt: '',
      slug: '',
      isAvailable: true,
      isFeatured: false,
      hasCarton: true,
      hasBox: true,
      hasPack: false,
      isBoxOnly: false,
      isPosOnly: false,
      tierDiscounts: [],
      focusKeyword: '',
      metaTitle: '',
      metaDescription: '',
      keyTakeaways: ['بار تازه و تحویل فوری از انبار جنت‌آباد', 'دارای هولوگرام و تضمین اصالت فیزیکی'],
      appliedFeatures: [
        { id: 'feat-tar', featureId: 'feat-tar', nameFa: 'قطران (Tar)', value: '6', unit: 'mg' },
        { id: 'feat-nicotine', featureId: 'feat-nicotine', nameFa: 'نیکوتین (Nicotine)', value: '0.5', unit: 'mg' },
        { id: 'feat-format', featureId: 'feat-format', nameFa: 'سایز و اندازه پاکت (Format)', value: 'کینگ سایز (King Size)' },
        { id: 'feat-flavor', featureId: 'feat-flavor', nameFa: 'طعم و اسانس (Flavor)', value: 'توتون خالص طبیعی (Original)' },
        { id: 'feat-filter', featureId: 'feat-filter', nameFa: 'نوع فیلتر (Filter Technology)', value: 'فیلتر سفید استاندارد' },
        { id: 'feat-origin', featureId: 'feat-origin', nameFa: 'کشور سازنده و مبدأ', value: 'سوئیس اصل (Duty Free)' },
      ],
      images: [],
    };
  }, [product, initialBarcode]);

  const {
    values: formData,
    setValues: setFormData,
    hasDraft,
    clear: clearFormPersistence,
  } = useFormPersistence<any>('sevin_product_draft', initialFormValues, !product);

  // UI States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [seoSnippetTab, setSeoSnippetTab] = useState<'desktop' | 'mobile'>('desktop');
  const [seoFilterStatus, setSeoFilterStatus] = useState<'all' | 'good' | 'ok' | 'bad'>('all');
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [newGalleryInput, setNewGalleryInput] = useState<string>('');

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem('sevin_product_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {}
  };

  const handleClearDraft = () => {
    clearFormPersistence();
  };

  const handleAddGalleryImage = () => {
    if (newGalleryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newGalleryInput.trim()]
      }));
      setNewGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleGalleryImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const b64 = reader.result;
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), b64]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Dynamic features created in this session
  const [dynamicFeatures, setDynamicFeatures] = useState<ProductFeatureItem[]>([]);

  // Custom Feature UI State with Full EAV Attributes
  const [customFeatName, setCustomFeatName] = useState<string>('');
  const [customFeatNameEn, setCustomFeatNameEn] = useState<string>('');
  const [customFeatType, setCustomFeatType] = useState<'text' | 'number' | 'select' | 'badge'>('text');
  const [customFeatUnit, setCustomFeatUnit] = useState<string>('');
  const [customFeatValue, setCustomFeatValue] = useState<string>('');
  const [customFeatOptions, setCustomFeatOptions] = useState<string>('');
  const [customFeatHelpText, setCustomFeatHelpText] = useState<string>('');
  const [customFeatSaveToDb, setCustomFeatSaveToDb] = useState<boolean>(true);
  const [isAddingCustomFeat, setIsAddingCustomFeat] = useState<boolean>(false);
  const [customFeatError, setCustomFeatError] = useState<string | null>(null);
  const [showCustomFeatForm, setShowCustomFeatForm] = useState<boolean>(false);

  // Sync initial barcode if provided dynamically
  React.useEffect(() => {
    if (!product && initialBarcode) {
      setFormData(prev => ({
        ...prev,
        barcode: initialBarcode
      }));
    }
  }, [initialBarcode, product]);

  // Tier Discounts UI State (Carton & Box)
  const [newTierUnit, setNewTierUnit] = useState<'carton' | 'box'>('carton');
  const [newTierQty, setNewTierQty] = useState<number | ''>('');
  const [newTierDiscount, setNewTierDiscount] = useState<number | ''>('');

  const handleAddTier = () => {
    const qty = Number(newTierQty);
    const pct = Number(newTierDiscount);
    if (!qty || qty <= 0 || !pct || pct <= 0) return;

    const newTier: WholesaleTierDiscount = {
      unit: newTierUnit,
      minQuantity: qty,
      minCartons: newTierUnit === 'carton' ? qty : undefined,
      discountPercentage: pct,
      discountPercent: pct,
      label: `خرید بالای ${qty} ${newTierUnit === 'carton' ? 'کارتن' : 'باکس'} (${pct}٪ تخفیف)`
    };

    setFormData(prev => ({
      ...prev,
      tierDiscounts: [...(prev.tierDiscounts || []), newTier]
    }));

    setNewTierQty('');
    setNewTierDiscount('');
  };

  const handleRemoveTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tierDiscounts: (prev.tierDiscounts || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddCartonPresets = () => {
    const presets: WholesaleTierDiscount[] = [
      { unit: 'carton', minQuantity: 3, minCartons: 3, discountPercentage: 2, discountPercent: 2, label: '۳ تا ۴ کارتن (۲٪ تخفیف)' },
      { unit: 'carton', minQuantity: 5, minCartons: 5, discountPercentage: 4, discountPercent: 4, label: '۵ تا ۹ کارتن (۴٪ تخفیف)' },
      { unit: 'carton', minQuantity: 10, minCartons: 10, discountPercentage: 7, discountPercent: 7, label: '۱۰ کارتن به بالا (۷٪ تخفیف تجاری)' }
    ];
    setFormData(prev => {
      const boxTiers = (prev.tierDiscounts || []).filter(t => t.unit === 'box' || t.label?.includes('باکس'));
      return { ...prev, tierDiscounts: [...boxTiers, ...presets] };
    });
  };

  const handleAddBoxPresets = () => {
    const presets: WholesaleTierDiscount[] = [
      { unit: 'box', minQuantity: 3, discountPercentage: 2, discountPercent: 2, label: 'خرید بالای ۳ باکس (۲٪ تخفیف)' },
      { unit: 'box', minQuantity: 5, discountPercentage: 4, discountPercent: 4, label: 'خرید بالای ۵ باکس (۴٪ تخفیف)' },
      { unit: 'box', minQuantity: 10, discountPercentage: 6, discountPercent: 6, label: 'خرید بالای ۱۰ باکس (۶٪ تخفیف)' }
    ];
    setFormData(prev => {
      const cartonTiers = (prev.tierDiscounts || []).filter(t => t.unit === 'carton' || (!t.unit && !t.label?.includes('باکس')));
      return { ...prev, tierDiscounts: [...cartonTiers, ...presets] };
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontendDomain = getFrontendDomain();

  // Catalog Features Available
  const availableFeaturesList: ProductFeatureItem[] = useMemo(() => {
    const base = features && features.length > 0 ? features : INITIAL_PRODUCT_FEATURES;
    const combined = [...base];
    for (const df of dynamicFeatures) {
      if (!combined.some(f => f.id === df.id || f.nameFa === df.nameFa)) {
        combined.push(df);
      }
    }
    return combined;
  }, [features, dynamicFeatures]);

  // Add Catalog Feature to Product
  const handleAddCatalogFeature = (feat: ProductFeatureItem) => {
    setFormData(prev => {
      const currentList = prev.appliedFeatures || [];
      if (currentList.some(item => item.featureId === feat.id || item.id === feat.id)) {
        return prev;
      }
      let defaultValue = '';
      if (feat.options && feat.options.length > 0) {
        defaultValue = feat.options[0];
      } else if (feat.id === 'feat-tar') {
        defaultValue = prev.tar ? prev.tar.replace(/[^0-9.]/g, '') || prev.tar : '6';
      } else if (feat.id === 'feat-nicotine') {
        defaultValue = prev.nicotine ? prev.nicotine.replace(/[^0-9.]/g, '') || prev.nicotine : '0.5';
      } else if (feat.id === 'feat-format') {
        defaultValue = prev.packSize || 'کینگ سایز (King Size)';
      } else if (feat.id === 'feat-flavor') {
        defaultValue = prev.flavor || 'توتون خالص طبیعی (Original)';
      } else if (feat.id === 'feat-filter') {
        defaultValue = prev.filterType || 'فیلتر کربن فعال (Active Charcoal)';
      } else if (feat.id === 'feat-origin') {
        defaultValue = prev.origin || 'سوئیس اصل (Duty Free)';
      }

      const newFeature: ProductAppliedFeature = {
        id: feat.id,
        featureId: feat.id,
        nameFa: feat.nameFa,
        nameEn: feat.nameEn,
        value: defaultValue,
        unit: feat.unit,
      };

      const updated = [...currentList, newFeature];
      const next = { ...prev, appliedFeatures: updated };

      // Synchronize core fields
      if (feat.id === 'feat-tar') next.tar = `${defaultValue} ${feat.unit || 'mg'}`.trim();
      if (feat.id === 'feat-nicotine') next.nicotine = `${defaultValue} ${feat.unit || 'mg'}`.trim();
      if (feat.id === 'feat-format') next.packSize = defaultValue;
      if (feat.id === 'feat-flavor') next.flavor = defaultValue;
      if (feat.id === 'feat-filter') next.filterType = defaultValue;
      if (feat.id === 'feat-origin') next.origin = defaultValue;

      return next;
    });
  };

  // Remove Feature
  const handleRemoveFeature = (featureId: string) => {
    setFormData(prev => {
      const updated = (prev.appliedFeatures || []).filter(
        item => item.id !== featureId && item.featureId !== featureId
      );
      return { ...prev, appliedFeatures: updated };
    });
  };

  // Update Feature Value
  const handleUpdateFeatureValue = (featureId: string, newValue: string) => {
    setFormData(prev => {
      const updated = (prev.appliedFeatures || []).map(item => {
        if (item.id === featureId || item.featureId === featureId) {
          return { ...item, value: newValue };
        }
        return item;
      });

      const next = { ...prev, appliedFeatures: updated };

      // Synchronize core fields
      if (featureId === 'feat-tar') {
        const u = updated.find(i => i.id === 'feat-tar' || i.featureId === 'feat-tar')?.unit || 'mg';
        next.tar = `${newValue} ${u}`.trim();
      }
      if (featureId === 'feat-nicotine') {
        const u = updated.find(i => i.id === 'feat-nicotine' || i.featureId === 'feat-nicotine')?.unit || 'mg';
        next.nicotine = `${newValue} ${u}`.trim();
      }
      if (featureId === 'feat-format') next.packSize = newValue;
      if (featureId === 'feat-flavor') next.flavor = newValue;
      if (featureId === 'feat-filter') next.filterType = newValue;
      if (featureId === 'feat-origin') next.origin = newValue;

      return next;
    });
  };

  // Add Custom Feature with Full Fields & DB Persistence
  const handleAddCustomFeature = async () => {
    if (!customFeatName.trim()) {
      setCustomFeatError('لطفاً نام مشخصه فنی را به فارسی وارد کنید.');
      return;
    }
    setCustomFeatError(null);
    setIsAddingCustomFeat(true);

    try {
      const generatedEn = customFeatNameEn.trim() || 
        customFeatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') ||
        `feat_${Date.now()}`;

      const parsedOptions = customFeatOptions
        ? customFeatOptions.split(/[,،\n]/).map(s => s.trim()).filter(Boolean)
        : undefined;

      const newFeatItem: ProductFeatureItem = {
        id: `feat-${Date.now()}`,
        nameFa: customFeatName.trim(),
        nameEn: generatedEn,
        type: customFeatType,
        unit: customFeatUnit.trim() || undefined,
        options: parsedOptions,
        description: customFeatHelpText.trim() || undefined,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };

      // 1. Save to Database if checkbox is checked
      if (customFeatSaveToDb) {
        try {
          if (onAddFeature) {
            await onAddFeature(newFeatItem);
          } else {
            const savedFromDb = await attributesApi.create({
              nameFa: newFeatItem.nameFa,
              nameEn: newFeatItem.nameEn,
              type: newFeatItem.type,
              unit: newFeatItem.unit,
              description: newFeatItem.description,
            });
            if (savedFromDb?.id) {
              newFeatItem.id = String(savedFromDb.id);
            }
          }
        } catch (apiErr) {
          console.warn('Direct API attribute save fallback:', apiErr);
        }
      }

      // 2. Add to dynamic features so it appears in the system selector
      setDynamicFeatures(prev => [...prev, newFeatItem]);

      // 3. Apply to current product
      const appliedValue = customFeatValue.trim() || (parsedOptions && parsedOptions[0]) || 'ندارد';
      const appliedItem: ProductAppliedFeature = {
        id: newFeatItem.id,
        featureId: newFeatItem.id,
        nameFa: newFeatItem.nameFa,
        nameEn: newFeatItem.nameEn,
        value: appliedValue,
        unit: newFeatItem.unit,
      };

      setFormData(prev => {
        const nextList = [...(prev.appliedFeatures || []).filter(af => af.nameFa !== appliedItem.nameFa), appliedItem];
        const next = { ...prev, appliedFeatures: nextList };

        // Synchronize core fields if matches
        if (newFeatItem.nameFa.includes('قطران') || newFeatItem.nameEn === 'tar') {
          next.tar = `${appliedValue} ${newFeatItem.unit || 'mg'}`.trim();
        }
        if (newFeatItem.nameFa.includes('نیکوتین') || newFeatItem.nameEn === 'nicotine') {
          next.nicotine = `${appliedValue} ${newFeatItem.unit || 'mg'}`.trim();
        }
        if (newFeatItem.nameFa.includes('سایز') || newFeatItem.nameEn.includes('size')) {
          next.packSize = appliedValue;
        }
        if (newFeatItem.nameFa.includes('طعم') || newFeatItem.nameEn.includes('flavor')) {
          next.flavor = appliedValue;
        }
        if (newFeatItem.nameFa.includes('فیلتر') || newFeatItem.nameEn.includes('filter')) {
          next.filterType = appliedValue;
        }
        if (newFeatItem.nameFa.includes('کشور') || newFeatItem.nameEn.includes('origin')) {
          next.origin = appliedValue;
        }

        return next;
      });

      // Reset form
      setCustomFeatName('');
      setCustomFeatNameEn('');
      setCustomFeatType('text');
      setCustomFeatUnit('');
      setCustomFeatValue('');
      setCustomFeatOptions('');
      setCustomFeatHelpText('');
      setCustomFeatError(null);
      setShowCustomFeatForm(false);
    } catch (err: any) {
      setCustomFeatError(err?.message || 'خطا در ثبت مشخصه فنی در دیتابیس.');
    } finally {
      setIsAddingCustomFeat(false);
    }
  };

  // Real-time Yoast SEO Calculation
  const seoReport: ProductYoastSeoReport = useMemo(() => {
    return calculateProductYoastSeo(formData);
  }, [formData]);

  // Handle title change & auto-generate slug if empty
  const handleNameFaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const next = { ...prev, nameFa: val };
      if (!prev.focusKeyword || prev.focusKeyword === prev.nameFa) {
        next.focusKeyword = val;
      }
      if (!prev.metaTitle || prev.metaTitle === prev.nameFa) {
        next.metaTitle = val ? `${val} | خرید عمده از انبار تهران` : '';
      }
      return next;
    });
  };

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => {
      const next = { ...prev, nameEn: val };
      if (!prev.slug || prev.slug.startsWith('prod-')) {
        const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (generatedSlug) {
          next.slug = generatedSlug;
        }
      }
      return next;
    });
  };

  // Image Upload Handling
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('لطفاً فقط فایل تصویری (JPG, PNG, WebP) انتخاب کنید.');
      return;
    }
    setImageFileName(file.name);
    setImageFileSize(`${(file.size / 1024).toFixed(0)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Key Takeaways list
  const handleAddTakeaway = () => {
    if (!newTakeawayInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      keyTakeaways: [...(prev.keyTakeaways || []), newTakeawayInput.trim()]
    }));
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyTakeaways: (prev.keyTakeaways || []).filter((_, i) => i !== index)
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.nameFa || !formData.nameFa.trim()) {
      setValidationError('نام فارسی کالا الزامی است.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      const fallbackSlug = (formData.nameEn || formData.nameFa || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      formData.slug = fallbackSlug || `product-${Date.now()}`;
    }

    setIsSaving(true);

    try {
      const completeProduct: CigaretteProduct = {
        id: formData.id || `prod_${Date.now()}`,
        nameFa: formData.nameFa.trim(),
        nameEn: formData.nameEn?.trim() || '',
        brand: formData.brand?.trim() || 'وینستون',
        category: (formData.category || 'cigarettes') as CigaretteCategory,
        origin: formData.origin?.trim() || 'سوئیس اصل',
        tar: formData.tar?.trim() || '6 mg',
        nicotine: formData.nicotine?.trim() || '0.5 mg',
        packSize: formData.packSize?.trim() || 'کینگ سایز',
        packagingType: formData.packagingType?.trim() || 'باکس هارد',
        manufacturer: formData.manufacturer?.trim() || 'دخانیات بین‌الملل',
        cartonPrice: Number(formData.cartonPrice) || 0,
        boxPrice: Number(formData.boxPrice) || 0,
        packPrice: Number(formData.packPrice) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        boxesPerCarton: Number(formData.boxesPerCarton) || 50,
        packsPerBox: Number(formData.packsPerBox) || 10,
        stockCartons: Number(formData.stockCartons) || 0,
        stockBoxes: Number(formData.stockBoxes) || 0,
        moq: typeof formData.moq === 'number' ? formData.moq : (Number(formData.moq) || 0),
        moqBox: typeof formData.moqBox === 'number' ? formData.moqBox : (Number(formData.moqBox) || 0),
        image: formData.image || '',
        barcode: formData.barcode?.trim() || '',
        flavor: formData.flavor?.trim() || 'ساده',
        badge: formData.badge || 'بار تازه',
        priceTrend: formData.priceTrend || 'stable',
        lastPriceUpdate: new Date().toLocaleDateString('fa-IR'),
        hologram: formData.hologram || 'شرکتی اصل',
        description: formData.description || '',
        excerpt: formData.excerpt || '',
        slug: formData.slug || `prod-${Date.now()}`,
        isAvailable: formData.isAvailable !== false,
        isFeatured: Boolean(formData.isFeatured),
        hasCarton: formData.hasCarton !== false,
        hasBox: formData.hasBox !== false,
        hasPack: Boolean(formData.hasPack),
        isBoxOnly: Boolean(formData.isBoxOnly),
        isPosOnly: Boolean(formData.isPosOnly),
        tierDiscounts: formData.tierDiscounts || [],
        focusKeyword: formData.focusKeyword?.trim() || '',
        metaTitle: formData.metaTitle?.trim() || formData.nameFa || '',
        metaDescription: formData.metaDescription?.trim() || formData.excerpt || '',
        keyTakeaways: formData.keyTakeaways || [],
        seoScore: seoReport.overallScore,
        cigaretteSize: formData.cigaretteSize || formData.packSize || 'king_size',
        filterType: formData.filterType || 'white',
        appliedFeatures: formData.appliedFeatures || []
      };

      await Promise.resolve(onSave(completeProduct));
      try {
        localStorage.removeItem('sevin_product_draft');
      } catch {}
    } catch (err: any) {
      console.error(err);
      setValidationError(err?.message || 'خطا در ثبت نهایی و پردازش اطلاعات محصول در دیتابیس.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative" dir="rtl">
      {/* Top Floating Saving Indicator */}
      {isSaving && (
        <div className="fixed inset-x-0 top-0 z-50 bg-blue-600 text-white py-2.5 px-4 shadow-xl flex items-center justify-center gap-3 text-xs font-black animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>در حال ثبت نهایی محصول و ارسال اطلاعات به پایگاه‌داده انبار و صندوق... لطفاً صبر کنید.</span>
        </div>
      )}

      {/* Draft Restoration Banner */}
      {hasDraft && !product && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl shadow-xs flex items-center justify-between text-xs font-bold" dir="rtl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>پیش‌نویس ذخیره‌شده‌ای از فرم ثبت محصول قبلی شما در مرورگر موجود است. آیا مایل به بارگذاری آن هستید؟</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
            >
              بارگذاری پیش‌نویس
            </button>
            <button
              type="button"
              onClick={handleClearDraft}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              حذف پیش‌نویس
            </button>
          </div>
        </div>
      )}


      
      {/* TOP ACTION BAR - Matching BlogManagementPanel */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs sticky top-28 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="بازگشت به فهرست محصولات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {isEditing ? `ویرایش محصول: «${formData.nameFa || 'کالای بدون عنوان'}»` : 'ثبت و تعریف کالای جدید در کاتالوگ و انبار'}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                seoReport.status === 'good'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : seoReport.status === 'ok'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                سئو: {formatNumberFa(seoReport.overallScore)}٪
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تنظیمات کاتالوگ فروشگاهی، قیمت عمده/باکس، ادیتور پیشرفته TinyMCE و آنالیز لحظه‌ای Yoast SEO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-3.5 sm:px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>
              {isSaving
                ? 'در حال ثبت نهایی در انبار...'
                : (isEditing ? 'ذخیره تغییرات محصول' : 'ثبت نهایی در انبار')}
            </span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button type="button" onClick={() => setValidationError(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN 2-COLUMN GRID (Matching BlogManagementPanel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ======================================================== */}
        {/* MAIN COLUMN (2 Cols) - Forms, TinyMCE, Yoast SEO */}
        {/* ======================================================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: BASIC INFORMATION & SLUG */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                اطلاعات اصلی و شناسه تجاری کالا
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name FA */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  نام فارسی کالا: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameFa || ''}
                  onChange={handleNameFaChange}
                  placeholder="مثلاً: سیگار وینستون لایت سوئیس اصل (Winston Light)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نام لاتین / انگلیسی کالا (English Name):
                </label>
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={handleNameEnChange}
                  placeholder="Winston Blue / Light Swiss"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Slug URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  پیوند یکتا (Slug URL):
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                  placeholder="winston-light-swiss"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1" dir="ltr">
                  URL: {frontendDomain}/product/{formData.slug || 'slug-url'}
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  برند سازنده:
                </label>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="وینستون، کنت، مارلبرو..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                {/* Brand quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {COMMON_BRANDS.slice(0, 5).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, brand: b }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-bold transition-colors"
                    >
                      {b.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کشور سازنده / مبدا بار:
                </label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="سوئیس اصل، ترکیه، ایران..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                {/* Origin quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {COMMON_ORIGINS.slice(0, 4).map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, origin: o }))}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-bold transition-colors"
                    >
                      {o.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-slate-500" />
                  <span>بارکد اختصاصی کالا (Barcode):</span>
                </label>
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="مثلاً: 7622210609384"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Cigarette Size (سایز سیگار دیتابیس) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  سایز و اندازه سیگار (Cigarette Size):
                </label>
                <select
                  value={formData.cigaretteSize || formData.packSize || 'king_size'}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cigaretteSize: e.target.value,
                    packSize: e.target.value 
                  }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {CIGARETTE_SIZE_CHOICES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  {CIGARETTE_SIZE_CHOICES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cigaretteSize: c.value, packSize: c.value }))}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        (formData.cigaretteSize === c.value || formData.packSize === c.value)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Type (نوع فیلتر انتخابی دیتابیس) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع فیلتر (Filter Type):
                </label>
                <select
                  value={formData.filterType || 'white'}
                  onChange={(e) => setFormData(prev => ({ ...prev, filterType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  {FILTER_TYPE_CHOICES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 flex-wrap mt-1.5">
                  {FILTER_TYPE_CHOICES.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, filterType: f.value }))}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        formData.filterType === f.value
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {f.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tar & Nicotine */}
              <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    میزان قطران (Tar):
                  </label>
                  <input
                    type="text"
                    value={formData.tar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tar: e.target.value }))}
                    placeholder="مثلاً: 6 mg"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    میزان نیکوتین (Nicotine):
                  </label>
                  <input
                    type="text"
                    value={formData.nicotine || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nicotine: e.target.value }))}
                    placeholder="مثلاً: 0.5 mg"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Short Excerpt */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  خلاصه و معرفی کوتاه محصول (Excerpt):
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="توضیح مختصر ۱ الی ۲ خطی برای نمایش در کارت‌های کاتالوگ و نتایج گوگل..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & WAREHOUSE INVENTORY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                قیمت‌گذاری عمده، سطوح فروش و موجودی انبار جنت‌آباد
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Carton Price */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  قیمت هر کارتن (تومان):
                </label>
                <input
                  type="number"
                  value={formData.cartonPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cartonPrice: Number(e.target.value) }))}
                  placeholder="15500000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-black focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  {formData.cartonPrice ? `${formatNumberFa(formData.cartonPrice)} تومان` : '۰ تومان'}
                </p>
              </div>

              {/* Box Price */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  قیمت هر باکس / جین (تومان):
                </label>
                <input
                  type="number"
                  value={formData.boxPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, boxPrice: Number(e.target.value) }))}
                  placeholder="310000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-black focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  {formData.boxPrice ? `${formatNumberFa(formData.boxPrice)} تومان` : '۰ تومان'}
                </p>
              </div>

              {/* Pack Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  قیمت تک هر پاکت (تومان):
                </label>
                <input
                  type="number"
                  value={formData.packPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, packPrice: Number(e.target.value) }))}
                  placeholder="35000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 font-bold mt-1">
                  {formData.packPrice ? `${formatNumberFa(formData.packPrice)} تومان` : 'اختیاری'}
                </p>
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-black text-amber-900 mb-1.5">
                  قیمت خرید فاکتور / تمام‌شده (تومان):
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  placeholder="14000000"
                  className="w-full bg-amber-50/60 border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <p className="text-[10px] text-amber-700 font-bold mt-1">
                  {formData.purchasePrice ? `${formatNumberFa(formData.purchasePrice)} تومان (سود حسابداری)` : '۰ تومان'}
                </p>
              </div>

              {/* Stock Cartons */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                  <span>موجودی انبار (کارتن):</span>
                </label>
                <input
                  type="number"
                  value={formData.stockCartons ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockCartons: Number(e.target.value) }))}
                  placeholder="10"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Stock Boxes */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-indigo-600" />
                  <span>موجودی فله انبار (باکس):</span>
                </label>
                <input
                  type="number"
                  value={formData.stockBoxes ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockBoxes: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Boxes Per Carton */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تعداد باکس در هر کارتن:
                </label>
                <input
                  type="number"
                  value={formData.boxesPerCarton ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, boxesPerCarton: Number(e.target.value) }))}
                  placeholder="50"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* MOQ Carton */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  حداقل سفارش عمده (MOQ کارتن):
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.moq ?? 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, moq: Number(e.target.value) || 0 }))}
                  placeholder="0 (بدون حداقل)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {Number(formData.moq) === 0 ? 'بدون محدودیت حداقل (حتی ۰ کارتن)' : `حداقل ${formatNumberFa(Number(formData.moq))} کارتن`}
                </p>
              </div>

              {/* MOQ Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  حداقل سفارش عمده (MOQ باکس):
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.moqBox ?? 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, moqBox: Number(e.target.value) || 0 }))}
                  placeholder="0 (بدون حداقل)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {Number(formData.moqBox) === 0 ? 'بدون محدودیت حداقل (حتی ۰ باکس)' : `حداقل ${formatNumberFa(Number(formData.moqBox))} باکس`}
                </p>
              </div>
            </div>

            {/* TIERED WHOLESALE DISCOUNTS (CARTON & BOX) */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      جدول تخفیف تیراژ بنکداری و عمده‌فروشی (کارتن و باکس)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تعیین درصد تخفیف بر اساس حجم خرید کارتن یا تعداد باکس (مثلاً ۳ باکس سفارش بده روبه‌رو ۲٪ تخفیف)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddCartonPresets}
                    className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    + الگوی کارتن (۳، ۵، ۱۰)
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBoxPresets}
                    className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                  >
                    + الگوی باکس (۳، ۵، ۱۰)
                  </button>
                </div>
              </div>

              {/* Add New Tier Form Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-end gap-2.5">
                <div className="w-28 shrink-0">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع واحد:</label>
                  <select
                    value={newTierUnit}
                    onChange={(e) => setNewTierUnit(e.target.value as 'carton' | 'box')}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="carton">کارتن پلمپ</option>
                    <option value="box">باکس (جین)</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    حداقل سفارش ({newTierUnit === 'carton' ? 'کارتن' : 'باکس'}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثلاً ۳"
                    value={newTierQty}
                    onChange={(e) => setNewTierQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex-1 min-w-[100px]">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">درصد تخفیف (٪):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.5"
                      max="99"
                      step="0.5"
                      placeholder="مثلاً ۲"
                      value={newTierDiscount}
                      onChange={(e) => setNewTierDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700 focus:outline-none focus:border-emerald-500 text-left pl-6"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">٪</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddTier}
                  disabled={!newTierQty || !newTierDiscount}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black transition-colors flex items-center gap-1 shrink-0 h-[34px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت پله تخفیف</span>
                </button>
              </div>

              {/* Existing Tiers List */}
              {(!formData.tierDiscounts || formData.tierDiscounts.length === 0) ? (
                <div className="text-center py-3.5 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  هنوز هیچ پله تخفیفی ثبت نشده است. می‌توانید با فرم بالا یا دکمه‌های الگو، شرایط تخفیف کارتن و باکس را مشخص کنید.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {formData.tierDiscounts.map((tier, idx) => {
                    const isBox = tier.unit === 'box' || (!tier.unit && tier.label?.includes('باکس'));
                    const qty = tier.minQuantity ?? tier.minCartons ?? 1;
                    const pct = tier.discountPercentage ?? tier.discountPercent ?? 0;

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              isBox ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isBox ? 'حجم باکس' : 'حجم کارتن'}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              خرید بالای {formatNumberFa(qty)} {isBox ? 'باکس' : 'کارتن'}
                            </span>
                          </div>
                          <div className="text-xs font-black text-emerald-600 flex items-center gap-1">
                            <span>{formatNumberFa(pct)}٪ تخفیف بنکداری</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                          title="حذف این پله تخفیف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sales Channel Flags (has_carton, has_box, has_pack, is_box_only, is_pos_only) */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-2.5">
                کانال‌ها و سطوح فروش مجاز در سامانه (هماهنگ با صندوق POS و وب‌سایت):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. has_carton */}
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  formData.hasCarton !== false && !formData.isBoxOnly
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.hasCarton !== false && !formData.isBoxOnly}
                    disabled={Boolean(formData.isBoxOnly)}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hasCarton: e.target.checked,
                      isBoxOnly: e.target.checked ? false : prev.isBoxOnly
                    }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block">فروش کارتنی فعال باشد</span>
                    <span className="text-[11px] opacity-75 block">امکان سفارش بر مبنای کارتن مادر ۵۰ باکسی</span>
                  </div>
                </label>

                {/* 2. has_box */}
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  formData.hasBox !== false
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.hasBox !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasBox: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block">فروش باکسی (جین ۱۰تایی) فعال باشد</span>
                    <span className="text-[11px] opacity-75 block">امکان سفارش عمده بر مبنای باکس و جین</span>
                  </div>
                </label>

                {/* 3. has_pack */}
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  Boolean(formData.hasPack)
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.hasPack)}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasPack: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block">امکان فروش پاکتی (تک‌فروشی)</span>
                    <span className="text-[11px] opacity-75 block">فروش دانه‌ای تک‌پاکت ویژه مشتریان خرده</span>
                  </div>
                </label>

                {/* 4. is_box_only */}
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  Boolean(formData.isBoxOnly)
                    ? 'bg-purple-50/70 border-purple-200 text-purple-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isBoxOnly)}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isBoxOnly: e.target.checked,
                      hasCarton: e.target.checked ? false : prev.hasCarton
                    }))}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block">فقط فروش باکسی (فاقد کارتن مادر)</span>
                    <span className="text-[11px] opacity-75 block">کالای فاقد کارتن مادر؛ سفارش فقط به صورت باکس</span>
                  </div>
                </label>

                {/* 5. is_pos_only */}
                <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  Boolean(formData.isPosOnly)
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPosOnly)}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPosOnly: e.target.checked }))}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block">مختص فروش حضوری صندوق (POS Only)</span>
                    <span className="text-[11px] opacity-75 block">مخفی در سایت آنلاین؛ فقط در نرم‌افزار صندوق انبار</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: TECHNICAL SPECIFICATIONS & PRODUCT FEATURES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    مشخصات فنی و شناسنامه استاندارد دود
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    انتخاب، تنظیم و افزودن ویژگی‌های فنی و استانداردهای دود از لیست سامانه یا ثبت ویژگی جدید
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-black">
                  {formatNumberFa((formData.appliedFeatures || []).length)} ویژگی فعال
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomFeatForm(!showCustomFeatForm)}
                  className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ویژگی دلخواه جدید</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Selector Bar from Available System Features */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>انتخاب ویژگی‌های کالا از سامانه:</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  برای افزودن هر ویژگی به این محصول، روی آن کلیک کنید:
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {availableFeaturesList.map((feat) => {
                  const isAdded = (formData.appliedFeatures || []).some(
                    item => item.featureId === feat.id || item.id === feat.id
                  );
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => {
                        if (!isAdded) {
                          handleAddCatalogFeature(feat);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                          : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 shadow-2xs hover:scale-[1.02]'
                      }`}
                      title={feat.description || feat.nameFa}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span>{feat.nameFa}</span>
                      {isAdded ? (
                        <span className="text-[10px] text-emerald-600 font-normal">
                          (فعال)
                        </span>
                      ) : (
                        feat.unit && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            [{feat.unit}]
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Feature Add Form (Collapsible with Full EAV Attributes) */}
            {showCustomFeatForm && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/95 to-indigo-50/60 border border-purple-200/90 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-purple-950">
                        ثبت مشخصه فنی جدید در سامانه و انتساب به این محصول
                      </h4>
                      <p className="text-[11px] text-purple-700/80">
                        مشخصه را تعریف کنید؛ این ویژگی به همراه متادیتا در دیتابیس سامانه ثبت شده و بلافاصله به این کالا متصل می‌شود.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomFeatForm(false);
                      setCustomFeatError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {customFeatError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{customFeatError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* نام فارسی */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      نام ویژگی (فارسی) <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={customFeatName}
                      onChange={(e) => setCustomFeatName(e.target.value)}
                      placeholder="مثلاً: درصد رطوبت، مونوکسید کربن، طعم..."
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  {/* نام انگلیسی / کلید لاتین */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      شناسه لاتین / کلید سیستمی (اختیاری):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={customFeatNameEn}
                      onChange={(e) => setCustomFeatNameEn(e.target.value)}
                      placeholder="مثلاً: carbon_monoxide یا moisture"
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  {/* نوع داده */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      نوع فیلد و داده (Data Type):
                    </label>
                    <select
                      value={customFeatType}
                      onChange={(e) => setCustomFeatType(e.target.value as any)}
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs cursor-pointer"
                    >
                      <option value="text">متن ساده (Text)</option>
                      <option value="number">مقداری / عددی (Number)</option>
                      <option value="select">انتخابی / چندگزینه‌ای (Select)</option>
                      <option value="badge">برچسب / وضعیت بله‌خیر (Badge/Boolean)</option>
                    </select>
                  </div>

                  {/* مقدار ویژگی برای این محصول */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      مقدار ویژگی برای این کالا:
                    </label>
                    <input
                      type="text"
                      value={customFeatValue}
                      onChange={(e) => setCustomFeatValue(e.target.value)}
                      placeholder="مثلاً: ۱۳٪ یا کپسول دوتایی یخ یا ۵"
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  {/* واحد سنجش */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-800">
                        واحد سنجش (اختیاری):
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        {['mg', 'درصد', 'گرم', 'میلی‌متر', 'عدد', 'نخ', 'باکس'].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setCustomFeatUnit(u)}
                            className="px-1.5 py-0.5 rounded bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 cursor-pointer font-medium"
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={customFeatUnit}
                      onChange={(e) => setCustomFeatUnit(e.target.value)}
                      placeholder="mg، درصد، میلی‌متر، گرم..."
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  {/* توضیحات راهنما */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      توضیحات راهنما (Help Text):
                    </label>
                    <input
                      type="text"
                      value={customFeatHelpText}
                      onChange={(e) => setCustomFeatHelpText(e.target.value)}
                      placeholder="توضیح کوتاه استاندارد جهت نمایش در کاتالوگ"
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                {/* اگر نوع انتخابی باشد: فیلد گزینه‌های انتخابی */}
                {customFeatType === 'select' && (
                  <div className="p-3 bg-white/80 rounded-xl border border-purple-200 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-800">
                      گزینه‌های انتخابی (با کاما یا ویرگول جدا کنید):
                    </label>
                    <input
                      type="text"
                      value={customFeatOptions}
                      onChange={(e) => setCustomFeatOptions(e.target.value)}
                      placeholder="مثلاً: کینگ سایز، اسلیم، سوپر اسلیم، نانو یا قرمز، آبی، مشکی"
                      className="w-full bg-white border border-purple-200 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      این گزینه‌ها برای انتخاب سریع مقدار ویژگی به عنوان دکمه‌های پیشنهادی نمایش داده می‌شوند.
                    </p>
                  </div>
                )}

                {/* گزینه‌های ذخیره و دکمه‌ها */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-purple-200/60">
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-950 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={customFeatSaveToDb}
                      onChange={(e) => setCustomFeatSaveToDb(e.target.checked)}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded cursor-pointer"
                    />
                    <Database className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>ذخیره دائمی در بانک ویژگی‌های پایگاه‌داده سامانه (جهت انتخاب برای سایر کالاها)</span>
                  </label>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomFeatForm(false);
                        setCustomFeatError(null);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white transition-colors cursor-pointer"
                    >
                      انصراف
                    </button>

                    <button
                      type="button"
                      disabled={isAddingCustomFeat}
                      onClick={handleAddCustomFeature}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isAddingCustomFeat ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>در حال ذخیره در دیتابیس...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>افزودن و ذخیره در دیتابیس</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Features List */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>ویژگی‌های فنی انتخاب‌شده و تنظیم مقادیر:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  می‌توانید مقادیر را تغییر دهید یا از گزینه‌های پیشنهادی سریع استفاده کنید.
                </span>
              </div>

              {(!formData.appliedFeatures || formData.appliedFeatures.length === 0) ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  هیچ ویژگی فعالی برای این کالا تعریف نشده است. از نوار بالا روی ویژگی‌های مورد نظر کلیک کنید تا اضافه شوند.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {formData.appliedFeatures.map((item) => {
                    const catalogDef = availableFeaturesList.find(
                      f => f.id === item.featureId || f.id === item.id
                    );
                    const hasOptions = catalogDef && catalogDef.options && catalogDef.options.length > 0;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-xs font-black text-slate-900">
                              {item.nameFa}
                            </span>
                            {item.nameEn && (
                              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline" dir="ltr">
                                {item.nameEn}
                              </span>
                            )}
                            {item.unit && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                                {item.unit}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(item.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="حذف این ویژگی از کالا"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Clickable Quick Option Pills if available */}
                        {hasOptions && (
                          <div className="flex flex-wrap gap-1.5">
                            {catalogDef.options!.map((opt) => {
                              const isSelected = item.value === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleUpdateFeatureValue(item.id, opt)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Editable Value Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleUpdateFeatureValue(item.id, e.target.value)}
                            placeholder={`مقدار ${item.nameFa}`}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          />
                          {item.unit && (
                            <span className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono rounded-xl shrink-0">
                              {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: TINYMCE WYSIWYG RICH TEXT EDITOR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>نقد و بررسی و توضیحات جامع محصول (ویرایشگر بصری TinyMCE):</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                شامل جداول، هدینگ‌ها، مشخصات بسته‌بندی و نقل‌قول
              </span>
            </div>

            <TinyMceEditor
              value={formData.description || ''}
              onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
              placeholder="نقد و بررسی کامل، ویژگی‌های کام‌دهی، تاریخچه برند و مشخصات اصالت کارتن را در اینجا با استانداردهای ویرایش بنویسید..."
              minHeight="380px"
            />
          </div>

          {/* SECTION 5: KEY TAKEAWAYS / BULLETS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-black text-slate-900">
              ویژگی‌های کلیدی و برجسته محصول (Google Rich Snippets):
            </label>
            <p className="text-[11px] text-slate-500">
              این نکات در کادر مشخصات سریع صفحه کالا و نتایج موتورهای جستجو قرار می‌گیرند.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTakeawayInput}
                onChange={(e) => setNewTakeawayInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTakeaway(); } }}
                placeholder="مثلاً: فیلتر زغالی دو لایه با کاهش بوی نامطبوع و کام‌دهی روان..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن نکته</span>
              </button>
            </div>

            {/* List of Takeaways */}
            <div className="space-y-1.5 pt-1">
              {(formData.keyTakeaways || []).map((takeaway, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{takeaway}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 6: YOAST SEO ANALYSIS ENGINE FOR PRODUCTS        */}
          {/* ======================================================== */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            
            {/* SEO Header & Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>آنالیز هوشمند سئو و پیش‌نمایش گوگل (Yoast SEO)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                      استاندارد ووکامرس ۲۰۲۶
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    بررسی فاکتورهای سرچ خریداران عمده و آمادگی ایندکس اسکیما کالا (Google Product Schema)
                  </p>
                </div>
              </div>

              {/* Live Score Badge */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
                seoReport.status === 'good'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : seoReport.status === 'ok'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                  : 'bg-red-50/80 border-red-200 text-red-800'
              }`}>
                <div className="text-right">
                  <div className="text-[10px] font-bold opacity-80">درجه سئو محصول</div>
                  <div className="text-xs font-black">
                    {seoReport.status === 'good' ? '🟢 عالی (سبز)' : seoReport.status === 'ok' ? '🟠 متوسط (نارنجی)' : '🔴 ضعیف (قرمز)'}
                  </div>
                </div>
                <div className="text-lg font-black font-mono border-r pr-3 border-current/20">
                  {formatNumberFa(seoReport.overallScore)}<span className="text-xs font-normal">/۱۰۰</span>
                </div>
              </div>
            </div>

            {/* Focus Keyphrase Field */}
            <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
              <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>کلمه کلیدی کانونی محصول (Focus Keyphrase):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  واژه‌ای که می‌خواهید محصول در سرچ خریداران رتبه ۱ باشد
                </span>
              </label>
              <input
                type="text"
                value={formData.focusKeyword || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                placeholder="مثلاً: خرید عمده سیگار وینستون لایت اصل یا قیمت کارتن وینستون"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* GOOGLE SERP PREVIEW BOX */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-600" />
                    <span>پیش‌نمایش در صفحه اول نتایج جستجوی گوگل (Google Snippet):</span>
                  </label>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-700">دامنه فرانت:</span>
                    <span className="font-mono text-xs text-emerald-900" dir="ltr">{frontendDomain}</span>
                  </div>
                </div>

                {/* Device Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setSeoSnippetTab('desktop')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      seoSnippetTab === 'desktop'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>دسکتاپ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoSnippetTab('mobile')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      seoSnippetTab === 'mobile'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>موبایل</span>
                  </button>
                </div>
              </div>

              {/* Snippet Card */}
              <div className={`border border-slate-200 rounded-2xl bg-white p-4 shadow-xs transition-all ${
                seoSnippetTab === 'mobile' ? 'max-w-md mx-auto ring-4 ring-slate-100' : 'w-full'
              }`}>
                {/* Domain Breadcrumb */}
                <div className="flex items-center gap-2 mb-1 text-slate-800 text-[11px]" dir="ltr">
                  <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700 text-[9px] font-bold uppercase">
                    {(frontendDomain || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 truncate text-slate-700 font-sans">
                    <span className="font-semibold text-slate-900">{frontendDomain}</span>
                    <span className="text-slate-400"> › product › {formData.slug || 'slug-url'}</span>
                  </div>
                </div>

                {/* Blue Link Heading */}
                <div className="mt-1">
                  <h4 className="text-sm sm:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                    {formData.metaTitle || formData.nameFa || 'نام محصول در نتایج موتورهای جستجوی گوگل'}
                  </h4>
                </div>

                {/* Snippet Description */}
                <div className="mt-1.5 text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                  <span className="text-emerald-700 font-mono text-[11px] ml-1.5 font-bold">
                    {formData.cartonPrice ? `${formatNumberFa(formData.cartonPrice)} تومان` : 'قیمت روز'} —
                  </span>
                  <span>
                    {formData.metaDescription || formData.excerpt || 'توضیحات متای این محصول در اینجا نمایش داده می‌شود تا خریداران ترغیب به کلیک روی لینک وبسایت شما شوند...'}
                  </span>
                </div>
              </div>
            </div>

            {/* SEO Meta Title & Meta Description Inputs with Character Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* SEO Meta Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-700">
                    عنوان متای سئو (Meta Title):
                  </label>
                  <span className={`text-[10px] font-bold ${
                    seoReport.titleLength >= 35 && seoReport.titleLength <= 65
                      ? 'text-emerald-600'
                      : seoReport.titleLength > 65
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>
                    {formatNumberFa(seoReport.titleLength)} / ۶۵ کاراکتر
                  </span>
                </div>

                <input
                  type="text"
                  value={formData.metaTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder={formData.nameFa || 'عنوان متای بهینه‌شده برای نتایج سرپ گوگل...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      seoReport.titleLength >= 35 && seoReport.titleLength <= 65
                        ? 'bg-emerald-500'
                        : seoReport.titleLength > 65
                        ? 'bg-red-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, (seoReport.titleLength / 65) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  در صورت خالی بودن، از نام فارسی کالا استفاده می‌شود. (طول ایده‌آل: ۳۵ تا ۶۵ کاراکتر)
                </p>
              </div>

              {/* SEO Meta Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-700">
                    توضیحات متای سئو (Meta Description):
                  </label>
                  <span className={`text-[10px] font-bold ${
                    seoReport.metaDescLength >= 110 && seoReport.metaDescLength <= 160
                      ? 'text-emerald-600'
                      : seoReport.metaDescLength > 160
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>
                    {formatNumberFa(seoReport.metaDescLength)} / ۱۶۰ کاراکتر
                  </span>
                </div>

                <textarea
                  rows={2}
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder={formData.excerpt || 'توضیحات متای جذاب همراه با نام برند و مزایای خرید عمده...'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                />

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      seoReport.metaDescLength >= 110 && seoReport.metaDescLength <= 160
                        ? 'bg-emerald-500'
                        : seoReport.metaDescLength > 160
                        ? 'bg-red-500'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, (seoReport.metaDescLength / 160) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  در صورت خالی بودن، از چکیده کالا استفاده خواهد شد. (طول ایده‌آل: ۱۱۰ تا ۱۶۰ کاراکتر)
                </p>
              </div>
            </div>

            {/* YOAST SEO INTERACTIVE CHECKLIST */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-800">
                    چک‌لیست تحلیلی سئو به سبک Yoast SEO ({formatNumberFa(seoReport.checks.length)} فاکتور)
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSeoFilterStatus('all')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      seoFilterStatus === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    همه ({formatNumberFa(seoReport.checks.length)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeoFilterStatus('good')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      seoFilterStatus === 'good'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>سبز ({formatNumberFa(seoReport.goodCount)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeoFilterStatus('ok')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      seoFilterStatus === 'ok'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>نارنجی ({formatNumberFa(seoReport.okCount)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSeoFilterStatus('bad')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      seoFilterStatus === 'bad'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 hover:bg-red-100 text-red-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>قرمز ({formatNumberFa(seoReport.badCount)})</span>
                  </button>
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {seoReport.checks
                  .filter(c => seoFilterStatus === 'all' || c.status === seoFilterStatus)
                  .map((check) => {
                    const dotColor = check.status === 'good' ? 'bg-emerald-500' : check.status === 'ok' ? 'bg-amber-500' : 'bg-red-500';
                    const bgCard = check.status === 'good' ? 'bg-emerald-50/40 border-emerald-200/60' : check.status === 'ok' ? 'bg-amber-50/40 border-amber-200/60' : 'bg-red-50/40 border-red-200/60';
                    return (
                      <div key={check.id} className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${bgCard}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 mt-1 shadow-xs`} />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="font-black text-slate-800 text-[11px] flex items-center justify-between">
                            <span>{check.title}</span>
                            <span className="text-[10px] font-mono opacity-60">+{formatNumberFa(check.score)} امتیاز</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {check.message}
                          </p>
                          {check.recommendation && (
                            <p className="text-blue-700 text-[10px] font-bold pt-0.5">
                              💡 پیشنهاد: {check.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* SIDEBAR COLUMN (1 Col) - Image Upload & Category/Hologram */}
        {/* ======================================================== */}
        <div className="space-y-6">
          
          {/* CARD 1: FEATURED IMAGE UPLOAD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-black text-slate-900">
              تصویر شاخص محصول (آپلود عکس):
            </label>

            {formData.image ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-100">
                  <img
                    src={formData.image}
                    alt={formData.nameFa || 'تصویر کالا'}
                    className="w-full h-full object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 left-2 p-1.5 rounded-xl bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                    title="حذف و تعویض تصویر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="font-bold truncate">{imageFileName || 'تصویر شاخص کالا'}</span>
                  <span className="text-slate-400 text-[10px]">{imageFileSize}</span>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>انتخاب تصویر دیگر</span>
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-slate-800">
                  برای آپلود عکس کالا کلیک کنید
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  یا تصویر را به این کادر بکشید و رها کنید (PNG, JPG, WebP)
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Direct Image URL input fallback */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                یا آدرس اینترنتی مستقیم عکس (Image URL):
              </label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/product.jpg"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* CARD 1.5: PRODUCT GALLERY IMAGES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-900">
                گالری تصاویر محصول (علاوه بر تصویر شاخص بالا):
              </label>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold font-mono">
                {(formData.images || []).length} تصویر
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="آدرس تصویر گالری..."
                  value={newGalleryInput}
                  onChange={(e) => setNewGalleryInput(e.target.value)}
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  افزودن
                </button>
              </div>

              <label className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-slate-300">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>آپلود فایل‌های گالری</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {(formData.images || []).length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="bg-red-600 text-white p-1 rounded-lg hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                        title="حذف عکس"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 py-0.2 rounded-md font-mono">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                هیچ تصویر دیگری برای گالری این محصول اضافه نشده است. شما می‌توانید فایل آپلود کرده یا آدرس عکس قرار دهید.
              </div>
            )}
          </div>

          {/* CARD 2: CATEGORY SELECTION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>دسته‌بندی اصلی کالا:</span>
            </label>
            <select
              value={formData.category || 'cigarettes'}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CigaretteCategory }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug || cat.id}>
                  {cat.name} ({cat.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* CARD 3: AUTHENTICITY HOLOGRAM & SEALS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>برچسب هولوگرام و اصالت کالا:</span>
            </label>
            <select
              value={formData.hologram || 'شرکتی اصل'}
              onChange={(e) => setFormData(prev => ({ ...prev, hologram: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {holograms.map((holo) => (
                <option key={holo.id} value={holo.title}>
                  {holo.title} ({holo.securityLevel === 'ultra' ? 'فوق‌امنیتی' : holo.securityLevel === 'high' ? 'امنیت بالا' : 'استاندارد'})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              هولوگرام معتبر در برگه محصول به عنوان نشان تضمین سلامت کالا نمایش داده می‌شود.
            </p>
          </div>

          {/* CARD 4: BADGE & AVAILABILITY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                نشان ویژه / برچسب تجاری (Badge):
              </label>
              <select
                value={formData.badge || 'بار تازه'}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="بار تازه">بار تازه</option>
                <option value="پرفروش">پرفروش بازار</option>
                <option value="وارداتی اصل">وارداتی اصل</option>
                <option value="تخفیف تیراژ">تخفیف تیراژ ویژه</option>
                <option value="موجودی محدود">موجودی محدود</option>
                <option value="جدید">جدید</option>
              </select>
            </div>

            {/* Stock Availability Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <div className="text-xs font-black text-slate-900">وضعیت موجودی در انبار (Active)</div>
                  <div className="text-[10px] text-slate-400">در صورت غیرفعال بودن کالا در فروشگاه «ناموجود» اعلام می‌شود</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isAvailable !== false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Special Offer / Featured Product Toggle (پیشنهاد ویژه دیتابیس) */}
            <div className="pt-2 border-t border-slate-100">
              <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                Boolean(formData.isFeatured)
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    Boolean(formData.isFeatured) ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>پیشنهاد ویژه (Featured Product)</span>
                      {Boolean(formData.isFeatured) && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-200 text-amber-800 rounded">فعال</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      نمایش در اسلایدر و بخش پیشنهادهای شگفت‌انگیز صفحه اصلی
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.isFeatured)}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isFeatured: e.target.checked,
                    badge: e.target.checked && (!prev.badge || prev.badge === 'بار تازه') ? 'پیشنهاد ویژه' : prev.badge
                  }))}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* CARD 5: SEO SUMMARY & TIPS */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black text-white">
                توصیه سئو هوشمند محصولات
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              افزودن نام برند انگلیسی در کنار نام فارسی، درج قیمت واقعی کارتن، مشخص کردن قطران/نیکوتین و نوشتن حداقل ۲۰۰ کلمه نقد در ادیتور TinyMCE، موجب دستیابی به سئو سبز (نمره بالای ۸۵٪) خواهد شد.
            </p>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-white/10">
              <span>فاکتورهای سبز شده:</span>
              <span className="text-emerald-400 font-mono text-xs">{formatNumberFa(seoReport.goodCount)} از {formatNumberFa(seoReport.checks.length)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FLOATING / STICKY ACTION BAR */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between sticky bottom-4 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">
            {isEditing ? 'در حال ویرایش کالا' : 'در حال تعریف کالای جدید'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2.5 active:scale-98 disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>در حال ثبت نهایی و ذخیره‌سازی در انبار...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>{isEditing ? 'ذخیره تغییرات محصول' : 'ثبت نهایی در انبار'}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
};

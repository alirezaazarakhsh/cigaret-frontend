import { useState, useMemo, useCallback } from 'react';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { CigaretteProduct, ProductAppliedFeature, WholesaleTierDiscount } from '../types';
import { ProductFeatureItem } from '../components/product-manage/types';

export const useProductEditor = (product: CigaretteProduct | null, initialBarcode?: string, initialFormValues?: any) => {
  const {
    values: formData,
    setValues: setFormData,
    hasDraft,
    clear: clearFormPersistence,
  } = useFormPersistence<any>('sevin_product_draft', initialFormValues, !product);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // تمام توابع handle... که در کامپوننت اصلی بود باید اینجا تعریف شوند
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  // مثال برای انتقال یک تابع (باید همه منتقل شوند)
  const handleRemoveGalleryImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  return {
    formData,
    setFormData,
    updateField,
    isSaving,
    setIsSaving,
    validationError,
    setValidationError,
    hasDraft,
    clearFormPersistence,
    handleRemoveGalleryImage,
    // سایر توابع...
  };
};


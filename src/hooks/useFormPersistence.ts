import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React hook to sync form field values to localStorage based on a unique form key.
 * Returns current state, change handlers, and a clear method for successful submission or navigation.
 */
export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  initialValues: T,
  enabled: boolean = true
) {
  const [values, setValues] = useState<T>(() => {
    if (!enabled) return initialValues;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...initialValues, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading form persistence draft:', e);
    }
    return initialValues;
  });

  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setHasDraft(true);
      }
    } catch {}
  }, [key, enabled]);

  // Auto-save values to localStorage on change
  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(key, JSON.stringify(values));
    } catch (e) {
      console.error('Error saving form persistence draft:', e);
    }
  }, [key, values, enabled]);

  // Universal change handler for input, textarea, select, or custom field objects
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: any; type?: string; checked?: boolean } }
  ) => {
    const target = e.target;
    const name = target.name;
    const value = 'type' in target && target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    if (name) {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const clear = useCallback(() => {
    isSubmittedRef.current = true;
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
    } catch (e) {
      console.error('Error clearing form persistence:', e);
    }
  }, [key]);

  // Clear data when navigating away (unmounting) without successful submission
  useEffect(() => {
    return () => {
      if (!isSubmittedRef.current) {
        try {
          localStorage.removeItem(key);
        } catch {}
      }
    };
  }, [key]);

  return {
    values,
    state: values,
    setValues,
    handleChange,
    setFieldValue,
    hasDraft,
    clear,
  };
}

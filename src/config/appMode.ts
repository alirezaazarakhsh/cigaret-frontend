/**
 * تنظیمات نحوه استقرار و معماری فروش اسکریپت (Commercial Distribution Modes)
 * 
 * این ماژول به شما اجازه می‌دهد پروژه را در ۳ حالت مختلف به مشتریان عرضه کنید:
 * 1. 'full_suite': فروشگاه اینترنتی آنلاین + سامانه جامع صندوق و حسابداری (حالت پیش‌فرض)
 * 2. 'pos_only': فقط سامانه صندوق فروشگاهی، بارکدخوان، انبارداری و حسابداری (مخصوص مشتریانی که فقط نرم‌افزار صندوق می‌خواهند)
 * 3. 'online_store_only': فقط وب‌سایت فروشگاه آنلاین، سبد خرید و پیش‌فاکتور (مخصوص مشتریانی که فقط سایت می‌خواهند)
 */

export type AppDeploymentMode = 'full_suite' | 'pos_only' | 'online_store_only';

// بررسی حالت استقرار از طریق متغیر محیطی VITE_APP_MODE یا مقدار ذخیره‌شده
export const getAppDeploymentMode = (): AppDeploymentMode => {
  if (typeof window !== 'undefined') {
    // امکان تست فوری از طریق پارامتر URL: ?mode=pos_only یا localStorage
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get('app_mode') as AppDeploymentMode | null;
    if (queryMode && ['full_suite', 'pos_only', 'online_store_only'].includes(queryMode)) {
      return queryMode;
    }

    const savedMode = localStorage.getItem('sevin_app_deployment_mode') as AppDeploymentMode | null;
    if (savedMode && ['full_suite', 'pos_only', 'online_store_only'].includes(savedMode)) {
      return savedMode;
    }
  }

  // مقدار ENV پیش‌فرض در زمان بیلد (برای مشتری صندوق: VITE_APP_MODE=pos_only)
  const envMode = (import.meta as any).env?.VITE_APP_MODE as AppDeploymentMode | undefined;
  if (envMode && ['full_suite', 'pos_only', 'online_store_only'].includes(envMode)) {
    return envMode;
  }

  return 'full_suite';
};

export const isPosOnlyMode = (): boolean => getAppDeploymentMode() === 'pos_only';
export const isStoreOnlyMode = (): boolean => getAppDeploymentMode() === 'online_store_only';
export const isFullSuiteMode = (): boolean => getAppDeploymentMode() === 'full_suite';

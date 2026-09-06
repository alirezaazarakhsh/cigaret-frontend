export type AzarakhshSectionId =
  | 'kavenegar_sms' 
  | 'zero-to-hero'
  | 'django-config'
  | 'site-settings'
  | 'swagger-redoc'
  | 'auth-users'
  | 'categories'
  | 'products'
  | 'orders'
  | 'shipping'
  | 'blog-tinymce'
  | 'tickets-support'
  | 'visitors'
  | 'slider'
  | 'pos'
  | 'posuser'
  | 'cash-register'
  | 'currency-rates'
  | 'warehouse-contact'
  | 'regular-customers'
  | 'footer-settings'
  | 'notifications'
  | 'pos-products'
  | 'warehouse-stock'
  | 'ledger'
  | 'reports';

export type CodeTab = 'models' | 'admin' | 'serializers' | 'views' | 'urls' | 'notes' | 'services';

export type DocGroup = 'setup' | 'config' | 'auth' | 'catalog' | 'commerce' | 'support';

export interface DocSectionMeta {
  id: AzarakhshSectionId;
  title: string;
  titleEn: string;
  description: string;
  badge?: string;
  iconName: string;
  appFolder?: string;
  group: DocGroup;
  groupTitle: string;
}

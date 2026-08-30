export type AzarakhshSectionId =
  | 'sms' 
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
  | 'visitor-tickets'
  | 'visitors'
  | 'slider'
  | 'pos'
  | 'cash-register'
  | 'currency-rates'
  | 'warehouse-contact'
  | 'regular-customers'
  | 'footer-settings'
  | 'notifications'
  | 'pos-products'
  | 'warehouse-stock'
  | 'ledger'
  | 'reports'
  | 'roles-permissions';

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

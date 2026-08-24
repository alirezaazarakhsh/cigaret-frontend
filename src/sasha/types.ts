export type SashaSectionId = 
  | 'zero-to-hero'
  | 'django-config'
  | 'swagger-redoc'
  | 'auth-users'
  | 'categories'
  | 'products'
  | 'orders'
  | 'shipping'
  | 'blog-tinymce'
  | 'tickets-support'
  | 'visitors';

export type CodeTab = 'models' | 'admin' | 'serializers' | 'views' | 'urls' | 'notes';

export interface DocSectionMeta {
  id: SashaSectionId;
  title: string;
  titleEn: string;
  description: string;
  badge?: string;
  iconName: string;
  appFolder?: string;
}

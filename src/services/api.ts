/**
 * Sevin Wholesale Universal API Layer
 * 
 * Provides unified, typed API services for all sections:
 * - Products (CRUD, Stock Adjustments, Search, Sync)
 * - Orders & Invoices (Submit, Tracking, Status)
 * - Customers & Retail Club (Auth, Profiles, Retail Shops)
 * - Live Prices (Rates, Trends, Broadcast)
 * - POS & In-Person Sales (Receipts, Inventory Logs)
 * - Support & Tickets (Contact, Messages)
 * - Site Settings & Configuration
 */

import { httpClient } from './apiClient';
import { 
  getApiBaseUrl, 
  setApiBaseUrl, 
  getApiToken, 
  setApiToken, 
  getWebAppBaseUrl, 
  setWebAppBaseUrl,
  getCustomerPortalUrl,
  testApiConnection,
  DEFAULT_API_BASE_URL,
  DEFAULT_WEB_APP_URL
} from './apiConfig';
import { 
  CigaretteProduct, 
  OrderInvoice, 
  UserProfile, 
  RetailShopCustomer, 
  PosReceiptInvoice, 
  DjangoCrmConfig 
} from '../types';
import { CIGARETTE_PRODUCTS } from '../data/products';
import { INITIAL_RETAIL_SHOPS } from '../data/retailShops';

// Local storage keys for resilient offline-first fallback
const STORAGE_KEYS = {
  PRODUCTS: 'wholesale_products',
  ORDERS: 'sevin_orders',
  RETAIL_SHOPS: 'sevin_retail_shops',
  POS_RECEIPTS: 'sevin_pos_receipts',
  CURRENT_USER: 'sevin_current_user',
  CRM_CONFIG: 'django_crm_config',
  TICKETS: 'sevin_support_tickets',
};

// ==========================================
// 1. PRODUCTS API
// ==========================================
export const productsApi = {
  /**
   * Fetches all products from backend GET /products/ with fallback to local state
   */
  async getAll(params?: { category?: string; brand?: string; search?: string }): Promise<CigaretteProduct[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.brand && params.brand !== 'all') query.append('brand', params.brand);
    if (params?.search) query.append('search', params.search);

    const endpoint = `/products/${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await httpClient.get<any>(endpoint);

    if (response.success && response.data) {
      const items = Array.isArray(response.data) ? response.data : (response.data.results || []);
      if (items.length > 0) {
        const mappedProducts: CigaretteProduct[] = items.map((item: any, idx: number) => ({
          id: String(item.id || `p-${idx + 1}`),
          nameFa: item.name_fa || item.nameFa || item.title || 'سیگار بدون نام',
          nameEn: item.name_en || item.nameEn || '',
          brand: item.brand || 'مارلبرو',
          category: item.category || 'cigarettes',
          origin: item.origin || 'سوییس',
          tar: item.tar || '8mg',
          nicotine: item.nicotine || '0.6mg',
          cartonPrice: Number(item.carton_price || item.cartonPrice || 0),
          boxPrice: Number(item.box_price || item.boxPrice || 0),
          singlePrice: item.single_price ? Number(item.single_price) : item.singlePrice,
          boxesPerCarton: Number(item.boxes_per_carton || item.boxesPerCarton || 50),
          packsPerBox: Number(item.packs_per_box || item.packsPerBox || 10),
          stockCartons: Number(item.stock_cartons !== undefined ? item.stock_cartons : (item.stockCartons ?? 10)),
          moq: Number(item.moq || 1),
          image: item.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80',
          barcode: item.barcode || '',
          priceTrend: item.price_trend || item.priceTrend || 'stable',
          lastPriceUpdate: item.last_price_update || item.lastPriceUpdate || 'به‌روزرسانی خودکار سرور',
          hologram: item.hologram || 'دخانیات ایران',
          tierDiscounts: item.tier_discounts || item.tierDiscounts,
          description: item.description || '',
          isAvailable: item.is_available !== undefined ? Boolean(item.is_available) : (item.isAvailable ?? true),
        }));

        // Cache for offline resilience
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProducts));
        } catch {}

        return mappedProducts;
      }
    }

    // Fallback: local storage or initial dataset
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return CIGARETTE_PRODUCTS;
  },

  /**
   * Creates a new product on POST /products/
   */
  async create(product: Partial<CigaretteProduct>): Promise<CigaretteProduct> {
    const payload = {
      name_fa: product.nameFa,
      name_en: product.nameEn,
      brand: product.brand,
      category: product.category,
      origin: product.origin,
      carton_price: product.cartonPrice,
      box_price: product.boxPrice,
      pack_price: product.packPrice,
      boxes_per_carton: product.boxesPerCarton || 50,
      packs_per_box: product.packsPerBox || 10,
      stock_cartons: product.stockCartons ?? 10,
      moq: product.moq || 1,
      barcode: product.barcode || '',
      tar: product.tar || '',
      nicotine: product.nicotine || '',
      image: product.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80',
      description: product.description || '',
      hologram: product.hologram || 'دخانیات ایران',
      is_available: product.isAvailable ?? true,
    };

    const newProdId = product.id || `prod_${Date.now()}`;
    const newProductFull: CigaretteProduct = {
      id: newProdId,
      nameFa: product.nameFa || 'محصول جدید',
      nameEn: product.nameEn || '',
      brand: product.brand || 'مارلبرو',
      category: (product.category as any) || 'cigarettes',
      origin: product.origin || 'سوییس',
      tar: product.tar || '8mg',
      nicotine: product.nicotine || '0.6mg',
      cartonPrice: product.cartonPrice || 0,
      boxPrice: product.boxPrice || 0,
      packPrice: product.packPrice,
      boxesPerCarton: product.boxesPerCarton || 50,
      packsPerBox: product.packsPerBox || 10,
      stockCartons: product.stockCartons ?? 10,
      moq: product.moq || 1,
      image: product.image || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80',
      barcode: product.barcode || '',
      priceTrend: 'stable',
      lastPriceUpdate: 'لحظاتی پیش',
      hologram: (product.hologram as any) || 'دخانیات ایران',
      description: product.description || '',
      tierDiscounts: product.tierDiscounts || [],
      isAvailable: product.isAvailable ?? true,
    };

    // Attempt remote POST
    const response = await httpClient.post('/products/', payload);
    if (response.success && response.data) {
      const created = {
        ...newProductFull,
        id: String(response.data.id || newProdId),
      };
      // update local
      updateLocalProductList(created, 'add');
      return created;
    }

    // Local fallback update
    updateLocalProductList(newProductFull, 'add');
    return newProductFull;
  },

  /**
   * Updates an existing product on PUT /products/:id/
   */
  async update(id: string, productData: Partial<CigaretteProduct>): Promise<CigaretteProduct> {
    const payload = {
      name_fa: productData.nameFa,
      name_en: productData.nameEn,
      brand: productData.brand,
      category: productData.category,
      carton_price: productData.cartonPrice,
      box_price: productData.boxPrice,
      pack_price: productData.packPrice,
      stock_cartons: productData.stockCartons,
      is_available: productData.isAvailable,
      barcode: productData.barcode,
    };

    // Attempt remote PUT / PATCH
    await httpClient.patch(`/products/${id}/`, payload).catch(() => {});

    // Update locally
    const currentProducts = getLocalProducts();
    const updated = currentProducts.map(p => p.id === id ? { ...p, ...productData } : p);
    saveLocalProducts(updated);

    return updated.find(p => p.id === id) || (productData as CigaretteProduct);
  },

  /**
   * Deletes a product on DELETE /products/:id/
   */
  async delete(id: string): Promise<boolean> {
    await httpClient.delete(`/products/${id}/`).catch(() => {});
    const currentProducts = getLocalProducts();
    const updated = currentProducts.filter(p => p.id !== id);
    saveLocalProducts(updated);
    return true;
  },

  /**
   * Deducts or increases stock on PATCH /products/:id/stock/
   */
  async updateStock(id: string, newStockCartons: number): Promise<boolean> {
    await httpClient.patch(`/products/${id}/stock/`, { stock_cartons: newStockCartons }).catch(() => {});
    const currentProducts = getLocalProducts();
    const updated = currentProducts.map(p => p.id === id ? { ...p, stockCartons: newStockCartons, isAvailable: newStockCartons > 0 } : p);
    saveLocalProducts(updated);
    return true;
  },

  /**
   * Bulk sync local products to backend (e.g. when connecting backend for the first time)
   */
  async syncBulk(products: CigaretteProduct[]): Promise<{ synced: number; success: boolean }> {
    const response = await httpClient.post('/products/bulk-sync/', { products });
    if (response.success) {
      return { synced: products.length, success: true };
    }
    return { synced: 0, success: false };
  }
};

// ==========================================
// 2. ORDERS & INVOICES API
// ==========================================
export const ordersApi = {
  /**
   * Submits a wholesale proforma or in-person order to POST /orders/
   */
  async submit(order: Partial<OrderInvoice>): Promise<{ success: boolean; trackingCode: string; message: string }> {
    const trackingCode = order.trackingCode || `SVN-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullOrder: OrderInvoice = {
      orderId: order.orderId || `ORD-${Date.now()}`,
      trackingCode,
      createdAt: order.createdAt || new Date().toISOString(),
      customer: order.customer || {
        shopName: 'فروشگاه خریدار',
        shopOwnerName: 'مشتری گرامی',
        shopPhone: '',
        city: 'تهران',
        address: '',
        shippingMethod: 'انبار مرکزی جنت‌آباد',
        notes: '',
      },
      items: order.items || [],
      totalBoxes: order.totalBoxes || 0,
      totalCartons: order.totalCartons || 0,
      subtotal: order.subtotal || 0,
      discountAmount: order.discountAmount || 0,
      shippingCost: order.shippingCost || 0,
      finalTotal: order.finalTotal || 0,
      paymentStatus: order.paymentStatus || 'پیش‌فاکتور رسمی',
      ...order,
    };

    // Send to backend
    const response = await httpClient.post('/orders/', fullOrder);

    // Save locally
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      existing.unshift(fullOrder);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existing));
    } catch {}

    return {
      success: true,
      trackingCode,
      message: response.success 
        ? 'سفارش با موفقیت در پایگاه داده سرور ثبت شد.' 
        : 'پیش‌فاکتور با موفقیت در سامانه ثبت گردید و حواله خروج صادر شد.'
    };
  },

  /**
   * Fetches orders list on GET /orders/
   */
  async getAll(phone?: string): Promise<OrderInvoice[]> {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const response = await httpClient.get<any>(`/orders/${query}`);

    if (response.success && response.data) {
      const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
      if (list.length > 0) return list;
    }

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Tracks an order by tracking code on GET /orders/track/:code/
   */
  async getTracking(trackingCode: string): Promise<any> {
    const response = await httpClient.get(`/orders/track/${encodeURIComponent(trackingCode)}/`);
    if (response.success) return response.data;
    return null;
  }
};

// ==========================================
// 3. CUSTOMERS & RETAIL CLUB API
// ==========================================
export const customersApi = {
  /**
   * Authentication / Login with Phone on POST /auth/login/
   */
  async loginWithPhone(phone: string, role: string = 'customer'): Promise<UserProfile> {
    const payload = { phone, role };
    const response = await httpClient.post('/auth/login-otp/', payload);

    if (response.success && response.data?.user) {
      const user = response.data.user;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      if (response.data.token) {
        setApiToken(response.data.token);
      }
      return user;
    }

    // Default user construct
    const fallbackUser: UserProfile = {
      id: `usr_${Date.now()}`,
      phone,
      fullName: 'مشتری گرامی',
      shopName: 'فروشگاه / سوپرمارکت',
      province: 'تهران',
      city: 'تهران',
      address: '',
      nationalId: '',
      isVerified: false,
      role: role as any,
      orderHistory: [],
      createdAt: new Date().toLocaleDateString('fa-IR'),
      isProfileCompleted: false,
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(fallbackUser));
    return fallbackUser;
  },

  /**
   * Updates profile on PUT /customers/profile/
   */
  async updateProfile(user: UserProfile): Promise<UserProfile> {
    await httpClient.put('/customers/profile/', user).catch(() => {});
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  /**
   * Fetches retail shop customers list on GET /customers/retail-shops/
   */
  async getRetailShops(): Promise<RetailShopCustomer[]> {
    const response = await httpClient.get<any>('/customers/retail-shops/');
    if (response.success && Array.isArray(response.data)) {
      localStorage.setItem(STORAGE_KEYS.RETAIL_SHOPS, JSON.stringify(response.data));
      return response.data;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RETAIL_SHOPS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RETAIL_SHOPS;
  },

  /**
   * Adds or updates a retail shop on POST /customers/retail-shops/
   */
  async saveRetailShop(shop: RetailShopCustomer): Promise<RetailShopCustomer> {
    await httpClient.post('/customers/retail-shops/', shop).catch(() => {});
    const current = await customersApi.getRetailShops();
    const updated = [shop, ...current.filter(s => s.id !== shop.id)];
    localStorage.setItem(STORAGE_KEYS.RETAIL_SHOPS, JSON.stringify(updated));
    return shop;
  }
};

// ==========================================
// 4. LIVE PRICES API
// ==========================================
export const pricesApi = {
  /**
   * Fetches live market prices on GET /prices/live/
   */
  async getLivePrices(): Promise<any[]> {
    const response = await httpClient.get('/prices/live/');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Updates live market price on POST /prices/update/
   */
  async updatePrice(productId: string, cartonPrice: number, boxPrice?: number): Promise<boolean> {
    const response = await httpClient.post('/prices/update/', {
      product_id: productId,
      carton_price: cartonPrice,
      box_price: boxPrice,
    });
    return response.success;
  }
};

// ==========================================
// 5. POS & IN-PERSON RECEIPTS API
// ==========================================
export const posApi = {
  /**
   * Saves POS thermal receipt on POST /pos/receipts/
   */
  async saveReceipt(receipt: PosReceiptInvoice): Promise<PosReceiptInvoice> {
    await httpClient.post('/pos/receipts/', receipt).catch(() => {});
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.POS_RECEIPTS) || '[]');
      saved.unshift(receipt);
      localStorage.setItem(STORAGE_KEYS.POS_RECEIPTS, JSON.stringify(saved));
    } catch {}
    return receipt;
  },

  /**
   * Retrieves POS receipts on GET /pos/receipts/
   */
  async getReceipts(): Promise<PosReceiptInvoice[]> {
    const response = await httpClient.get<any>('/pos/receipts/');
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.POS_RECEIPTS) || '[]');
    } catch {
      return [];
    }
  }
};

// ==========================================
// 6. SITE SETTINGS & CRM CONFIG API
// ==========================================
export const siteSettingsApi = {
  /**
   * Fetches site configuration on GET /site-settings/public-config/
   */
  async getConfig(): Promise<Partial<DjangoCrmConfig> | null> {
    const response = await httpClient.get('/site-settings/public-config/');
    if (response.success && response.data) {
      return response.data;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CRM_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  },

  /**
   * Updates site configuration on POST /site-settings/update/
   */
  async updateConfig(config: Partial<DjangoCrmConfig>): Promise<boolean> {
    const response = await httpClient.post('/site-settings/update/', config);
    try {
      localStorage.setItem(STORAGE_KEYS.CRM_CONFIG, JSON.stringify(config));
    } catch {}
    return response.success;
  }
};

// ==========================================
// HELPER FUNCTIONS FOR LOCAL DATA
// ==========================================
function getLocalProducts(): CigaretteProduct[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return CIGARETTE_PRODUCTS;
}

function saveLocalProducts(products: CigaretteProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch {}
}

function updateLocalProductList(product: CigaretteProduct, action: 'add' | 'update' | 'delete'): void {
  const current = getLocalProducts();
  let updated: CigaretteProduct[] = [];
  if (action === 'add') {
    updated = [product, ...current.filter(p => p.id !== product.id)];
  } else if (action === 'update') {
    updated = current.map(p => p.id === product.id ? product : p);
  } else if (action === 'delete') {
    updated = current.filter(p => p.id !== product.id);
  }
  saveLocalProducts(updated);
}

// ==========================================
// UNIFIED MASTER API EXPORT
// ==========================================
export const api = {
  config: {
    getBaseUrl: getApiBaseUrl,
    setBaseUrl: setApiBaseUrl,
    getToken: getApiToken,
    setToken: setApiToken,
    getWebAppUrl: getWebAppBaseUrl,
    setWebAppUrl: setWebAppBaseUrl,
    getCustomerPortalUrl,
    testConnection: testApiConnection,
    DEFAULT_BASE_URL: DEFAULT_API_BASE_URL,
    DEFAULT_WEB_APP_URL,
  },
  products: productsApi,
  orders: ordersApi,
  customers: customersApi,
  prices: pricesApi,
  pos: posApi,
  siteSettings: siteSettingsApi,
  client: httpClient,
};

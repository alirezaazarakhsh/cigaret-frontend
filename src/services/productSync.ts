/**
 * Real-time Product Sync Service
 * Ensures instant multi-device, multi-tab, and background live synchronization
 * between Windows POS, Mobile Web App, and Django Cloud Database.
 */

import { CigaretteProduct } from '../types';
import { productsApi } from './api';
import { djangoDatabaseStore } from './djangoApi';

const BROADCAST_CHANNEL_NAME = 'sevin_products_sync_channel';

/**
 * Broadcasts product updates across all tabs, windows, and POS instances
 */
export function broadcastProductSync(products: CigaretteProduct[], updatedProduct?: CigaretteProduct): void {
  // 1. Local DOM CustomEvent (current window)
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('sevin-products-changed', {
          detail: { products, product: updatedProduct, timestamp: Date.now() },
        })
      );
    } catch {}
  }

  // 2. Cross-tab / Cross-window BroadcastChannel
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.postMessage({
        type: 'PRODUCTS_UPDATED',
        products,
        product: updatedProduct,
        timestamp: Date.now(),
      });
      channel.close();
    } catch {}
  }

  // 3. LocalStorage fallback triggers 'storage' event across other windows
  try {
    localStorage.setItem('wholesale_products', JSON.stringify(products));
    localStorage.setItem('sovin_django_products', JSON.stringify(products));
    localStorage.setItem('sevin_last_products_sync', String(Date.now()));
  } catch {}
}

/**
 * Hook or listener helper to subscribe to real-time product updates
 */
export function subscribeToProductSync(
  onUpdate: (products: CigaretteProduct[]) => void
): () => void {
  let isSubscribed = true;
  let channel: BroadcastChannel | null = null;

  // 1. Local DOM CustomEvent
  const handleCustomEvent = (e: any) => {
    if (!isSubscribed) return;
    if (e?.detail?.products && Array.isArray(e.detail.products)) {
      onUpdate(e.detail.products);
    } else {
      const stored = djangoDatabaseStore.getProducts();
      if (stored && stored.length > 0) onUpdate(stored);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('sevin-products-changed', handleCustomEvent);
  }

  // 2. BroadcastChannel for cross-tab / cross-window
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (!isSubscribed) return;
        if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.products)) {
          djangoDatabaseStore.setProducts(event.data.products);
          onUpdate(event.data.products);
        }
      };
    } catch {}
  }

  // 3. Storage Event (different tab/window on same browser)
  const handleStorageEvent = (e: StorageEvent) => {
    if (!isSubscribed) return;
    if (e.key === 'wholesale_products' || e.key === 'sovin_django_products' || e.key === 'sevin_last_products_sync') {
      try {
        const stored = djangoDatabaseStore.getProducts();
        if (stored && stored.length > 0) onUpdate(stored);
      } catch {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
  }

  // 4. Background live polling for remote changes (every 25 seconds) + on focus/visibility
  const performSilentRemoteSync = async () => {
    if (!isSubscribed) return;
    try {
      const remoteProducts = await productsApi.getAll();
      if (Array.isArray(remoteProducts) && remoteProducts.length > 0 && isSubscribed) {
        djangoDatabaseStore.setProducts(remoteProducts);
        onUpdate(remoteProducts);
      }
    } catch {}
  };

  const handleVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      performSilentRemoteSync();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleVisibilityChange);
  }

  // Background interval every 25 seconds for cross-device live update
  const intervalId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      performSilentRemoteSync();
    }
  }, 25000);

  // Return cleanup unsubscribe function
  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('sevin-products-changed', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleVisibilityChange);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
  };
}

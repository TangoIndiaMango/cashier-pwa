// src/hooks/useStore.ts
import { useEffect, useState } from 'react';
import { LocalApi } from '../lib/api/localApi';
import type { LocalProduct, LocalTransaction } from '../lib/db/schema';
import { SyncManager } from '../lib/sync/syncManager';
import { useOnlineStatus } from './useOnlineStatus';

export function useStore(storeId: string) {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();
  const syncManager = SyncManager.getInstance(storeId);
  // const recentTimeStamp = new Date().toISOString();

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Load from local DB if offline
      const localProducts = await LocalApi.getAllProducts();
      setProducts(localProducts);
      console.log('Loaded local products');

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      await syncManager.sync();
      loadProducts()
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  useEffect(() => {
    triggerSync();
  }, [isOnline])

  const createTransaction = async (data: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced'>) => {
    try {
      await LocalApi.createTransaction(data);
      await loadProducts();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createTransaction,
    refreshProducts: loadProducts,
    triggerSync,
  }
}
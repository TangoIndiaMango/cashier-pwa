// src/hooks/useStore.ts
import { useEffect, useState } from 'react';
import { LocalApi } from '../lib/api/localApi';
import { LocalCustomer, type LocalProduct, type LocalTransaction } from '../lib/db/schema';
import { SyncManager } from '../lib/sync/syncManager';
import { useOnlineStatus } from './useOnlineStatus';

export function useStore() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [customers, setCustomers] = useState<LocalCustomer[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();
  const syncManager = SyncManager.getInstance();
  // const recentTimeStamp = new Date().toISOString();

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Load from local DB if offline
      const localProducts = await LocalApi.getAllProducts();
      setProducts(localProducts);
      console.log('Loaded local products');

      // Load customers
      const localCustomers = await LocalApi.getCustomers();
      setCustomers(localCustomers);
      console.log('Loaded local customers');

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

  const updateAvailableQuantity = (productCode: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_code === productCode
          ? {
            ...product,
            available_quantity:
              product.available_quantity >= quantity
                ? product.available_quantity - quantity
                : product.available_quantity
          }
          : product
      )
    );
  };


  useEffect(() => {
    triggerSync();
  }, [])

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
    customers,
    loading,
    error,
    createTransaction,
    refreshProducts: loadProducts,
    triggerSync,
    updateAvailableQuantity,
  }
}
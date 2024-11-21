// src/hooks/useStore.ts
import { useEffect, useState } from "react";
import { LocalApi } from "../lib/api/localApi";
import {
  LocalProduct,
  LocalCustomer,
  LocalDiscount,
  LocalPaymentMethod,
  LocalTransaction,
} from "../lib/db/schema";
import { SyncManager } from "../lib/sync/syncManager";
import { useOnlineStatus } from "./useOnlineStatus";
import { LocalApiMethods } from "@/lib/api/localMethods";
import { TransactionSync } from "@/types/trxType";

export function useStore() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [discounts, setDiscounts] = useState<LocalDiscount[]>([]);
  const [failedTrx, setFailedTrx] = useState<TransactionSync[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod[]>([]);
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();
  const syncManager = SyncManager.getInstance();

  // Load products from local DB
  const loadProducts = async () => {
    try {
      setLoading(true);
      const localProducts = await LocalApi.getAllProducts();
      setProducts(localProducts);
      console.log("Loaded local products");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Load customers from local DB
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const localCustomers = await LocalApi.getCustomers();
      setCustomers(localCustomers);
      console.log("Loaded local customers");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const localPaymentMethods = await LocalApiMethods.getAllPaymentMethods();
      setPaymentMethod(localPaymentMethods);
      console.log("Loaded local payment methods");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const localDiscounts = await LocalApiMethods.getDiscounts();
      setDiscounts(localDiscounts);
      console.log("Loaded local discounts");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadFailedTrx  = async () => {
    try {
      setLoading(true);
      const failedTrx = await LocalApiMethods.getFailedSyncTrx();
      setFailedTrx(failedTrx);
      console.log("Loaded local failed transactions");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger sync when online or manually
  const triggerSync = async () => {
    try {
      setLoading(true);
      await syncManager.sync();
      // Load data sequentially to prevent race conditions
      await loadProducts();
      await loadCustomers();
      await loadPaymentMethods();
      await loadDiscounts();
      await loadFailedTrx();
    } catch (error) {
      console.error("Sync failed:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger sync when online or manually
  const triggerFetch = async () => {
    try {
      setLoading(true);
      await syncManager.refresh()
      // Load data sequentially to prevent race conditions
      await loadProducts();
      await loadFailedTrx();
      await loadCustomers();
      await loadPaymentMethods();
      await loadDiscounts();
    } catch (error) {
      console.error("Sync failed:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Update product quantity after purchase
  const updateAvailableQuantity = (ean: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.ean === ean
          ? {
            ...product,
            available_quantity: Math.max(Number(product?.available_quantity )- quantity, 0)
          }
          : product
      )
    );
  };

  // Check if the app is online and trigger sync
  // useEffect(() => {
  //   const syncIfNeed = async () => {
  //     if (isOnline) {
  //       try {
  //         const shouldSync = await syncManager.shouldSync()
  //         if (shouldSync) {
  //           console.log("Syncing data...");
  //           await syncManager.sync();
  //         }
  //       } catch (error) {
  //         console.error("Error checking sync status or triggering sync:", error);
  //       }
  //     }
  //   }
  //   syncIfNeed()
  // }, [isOnline]);

  useEffect(() => {
    triggerFetch();
  }, [syncManager.shouldSync]);

  const createTransaction = async (
    data: Omit<LocalTransaction, "id" | "createdAt" | "synced">
  ) => {
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
    discounts,
    paymentMethod,
    customers,
    loading,
    error,
    failedTrx,
    triggerSync,
    triggerFetch,
    updateAvailableQuantity,
    createTransaction,
  };
}

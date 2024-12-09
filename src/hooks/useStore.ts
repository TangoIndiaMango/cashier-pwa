import { useEffect, useState, useCallback } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { SyncManager } from "../lib/sync/syncManager";
import { LocalApi } from "../lib/api/localApi";
import { LocalApiMethods } from "@/lib/api/localMethods";
import {
  LocalProduct,
  LocalDiscount,
  LocalPaymentMethod,
  LocalCustomer,
  LocalBranch,
  LocalTransaction,
  db
} from "../lib/db/schema";
import { TransactionSync } from "@/types/trxType";
import toast from "react-hot-toast";

export function useStore() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [discounts, setDiscounts] = useState<LocalDiscount[]>([]);
  const [failedTrx, setFailedTrx] = useState<TransactionSync[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod[]>([]);
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [branches, setBranches] = useState<LocalBranch[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();
  const SHOULD_FETCH = 30 * 60 * 1000

  const syncManager = SyncManager.getInstance();

  const refreshDB = async () => {
    await db.open();
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const triggerFetch = async () => {
    try {
      setLoading(true);
      await refreshDB();
      await syncManager.refresh();
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error("Fetch failed:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  const triggerLocalFetch = async () => {
    try {
      setLoading(true);
      await refreshDB();
      const [
        localProducts,
        localFailedTrx,
        localCustomers,
        localPaymentMethods,
        localBranches,
        localDiscounts
      ] = await Promise.all([
        LocalApi.getAllProducts(),
        LocalApiMethods.getFailedSyncTrx(),
        LocalApi.getCustomers(),
        LocalApiMethods.getAllPaymentMethods(),
        LocalApiMethods.getBranches(),
        LocalApiMethods.getDiscounts()
      ]);

      setProducts(localProducts);
      setFailedTrx(localFailedTrx);
      setCustomers(localCustomers);
      setPaymentMethod(localPaymentMethods);
      setBranches(localBranches);
      setDiscounts(localDiscounts);
      console.log("Loaded local data");
    } catch (error) {
      console.error("Local fetch failed:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  const triggerSync = async () => {
    try {
      setLoading(true);
      await syncManager.sync();
      await triggerLocalFetch();
      toast.success("Synced successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      setError(error as Error);
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOnline) {
      const now = Date.now();
      if (!lastSyncTime || now - lastSyncTime >= SHOULD_FETCH) {
        triggerFetch();
      }
    }
  }, [lastSyncTime, SHOULD_FETCH])

  useEffect(() => {
    triggerLocalFetch();
  }, []);

  const updateAvailableQuantity = useCallback((ean: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.ean === ean
          ? {
            ...product,
            available_quantity: Math.max(Number(product?.available_quantity) - quantity, 0)
          }
          : product
      )
    );
  }, []);

  const createTransaction = async (
    data: Omit<LocalTransaction, "id" | "createdAt" | "synced">
  ) => {
    try {
      await LocalApi.createTransaction(data);
      await triggerLocalFetch();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  return {
    products,
    discounts,
    paymentMethod,
    branches,
    customers,
    loading,
    error,
    failedTrx,
    triggerSync,
    triggerFetch,
    updateAvailableQuantity,
    createTransaction,
    triggerLocalFetch,
  };
}


import { LocalApiMethods } from "@/lib/api/localMethods";
import { delay } from "@/lib/utils";
import { TransactionSync } from "@/types/trxType";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LocalApi } from "../lib/api/localApi";
import {
  LocalBranch,
  LocalCustomer,
  LocalDiscount,
  LocalPaymentMethod,
  LocalProduct,
  LocalTransaction
} from "../lib/db/schema";
import { SyncManager } from "../lib/sync/syncManager";
import { getDbInstance } from "@/lib/db/db";
import { redirect } from "react-router-dom";

export function useStore() {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [discounts, setDiscounts] = useState<LocalDiscount[]>([]);
  const [failedTrx, setFailedTrx] = useState<TransactionSync[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod[]>([]);
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [branches, setBranches] = useState<LocalBranch[]>([]);
  const [unsyncedTrx, setUnsyncedTrx] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // const [errorShown, setErrorShown] = useState(false);
  // const { isOnline } = useOnlineStatus();
  // const SHOULD_FETCH = 30 * 60 * 1000

  const syncManager = SyncManager.getInstance();

  const refreshDB = async () => {
    const db = getDbInstance()
    await delay(2)
    await db.openDatabase()
  };

  const triggerFetch = async () => {
    try {
      setLoading(true);
      await refreshDB();
      await syncManager.refresh();
      await triggerLocalFetch();
    } catch (error) {
      console.error("Fetch failed:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  const triggerLocalFetch = async () => {
    try {
      const sessionId = sessionStorage.getItem("sessionId")

      if (!sessionId) {
        // toast.error("No session ID found, you'll be redirected to login again.");
        console.log("Reidrect to login, no sessionId")
        redirect('/login');
        return null;
      }
      setLoading(true);
      await refreshDB();
      const [
        localProducts,
        localFailedTrx,
        localCustomers,
        localPaymentMethods,
        localBranches,
        localDiscounts,
        localunsyncedTrx,
      ] = await Promise.all([
        LocalApi.getAllProducts(),
        LocalApiMethods.getFailedSyncTrx(sessionId),
        LocalApi.getCustomers(),
        LocalApiMethods.getAllPaymentMethods(),
        LocalApiMethods.getBranches(),
        LocalApiMethods.getDiscounts(),
        LocalApi.getUnsynedTransactions(sessionId),
      ]);

      setProducts(localProducts);
      setFailedTrx(localFailedTrx);
      setCustomers(localCustomers);
      setPaymentMethod(localPaymentMethods);
      setBranches(localBranches);
      setDiscounts(localDiscounts);
      setUnsyncedTrx(localunsyncedTrx);
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

  // useEffect(() => {
  //   if (isOnline) {
  //     triggerFetch();
  //   }
  // }, [])

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
      const sessionId = sessionStorage.getItem('sessionId');

      if (!sessionId) {
        toast.error("No session ID found, please login again.");
        redirect('/login');
        return;
      }
      await LocalApi.createTransaction(data, sessionId);
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
    unsyncedTrx,
    loading,
    error,
    failedTrx,
    triggerSync,
    triggerFetch,
    updateAvailableQuantity,
    createTransaction,
    setLoading,
    triggerLocalFetch,
  };
}


import { LocalApiMethods } from "@/lib/api/localMethods";
import { closeDB, getDbInstance } from "@/lib/db/db";
import { TransactionSync } from "@/types/trxType";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
import { delay } from "@/lib/utils";

export function useStore() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [discounts, setDiscounts] = useState<LocalDiscount[]>([]);
  const [failedTrx, setFailedTrx] = useState<TransactionSync[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<LocalPaymentMethod[]>([]);
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [branches, setBranches] = useState<LocalBranch[]>([]);
  const [unsyncedTrx, setUnsyncedTrx] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add debounce for notifications
  const toastDebounceRef = useRef<NodeJS.Timeout>();
  const showErrorToast = useCallback((message: string) => {
    if (toastDebounceRef.current) {
      clearTimeout(toastDebounceRef.current);
    }
    toastDebounceRef.current = setTimeout(() => {
      toast.error(message);
    }, 300);
  }, []);

  const handleCriticalError = useCallback(() => {
    showErrorToast("Something went wrong. Redirecting to home page.");
    navigate('/');
  }, [navigate]);

  const refreshDB = async () => {
    try {
      await delay(1);
      const db = await getDbInstance();

      if (!db.isOpen()) {
        console.error("Database failed to initialize");
        // toast.error("Database connection failed");
        return false;
      }
      return true;
    } catch (error) {
      console.error("DB refresh failed:", error);
      // toast.error("Failed to connect to database");
      return false;
    }
  };

  const triggerLocalFetch = async () => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      showErrorToast("No session ID found, please login again.");
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const dbOpened = await refreshDB();
      if (!dbOpened) return;

      // Load products first most important
      const productResults = await LocalApi.getAllProducts();
      if (productResults?.length) {
        setProducts(productResults);
      } else {
        console.warn("No products loaded from database");
      }

      const [
        failedTrxResults,
        customerResults,
        paymentResults,
        branchResults,
        discountResults,
        unsyncedResults
      ] = await Promise.all([
        LocalApiMethods.getFailedSyncTrx(sessionId),
        LocalApi.getCustomers(),
        LocalApiMethods.getAllPaymentMethods(),
        LocalApiMethods.getBranches(),
        LocalApiMethods.getDiscounts(),
        LocalApi.getUnsynedTransactions(sessionId),
      ]);

      setFailedTrx(failedTrxResults || []);
      setCustomers(customerResults || []);
      setPaymentMethod(paymentResults || []);
      setBranches(branchResults || []);
      setDiscounts(discountResults || []);
      setUnsyncedTrx(unsyncedResults || []);

    } catch (error) {
      console.error("Local fetch failed:", error);
      showErrorToast("Failed to load some data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // Add an initialization effect
  useEffect(() => {
    const initializeStore = async () => {
      const dbOpened = await refreshDB();
      if (dbOpened) {
        await triggerLocalFetch();
      }
    };

    initializeStore();
  }, []);

  const triggerFetch = async () => {
    try {
      setLoading(true);
      await refreshDB();
      await syncManager.refresh();
      await triggerLocalFetch();
    } catch (error) {
      console.error("Fetch failed:", error);
      setError(error as Error);
      handleCriticalError();
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setLoading(true);
      await syncManager.sync();
      await triggerLocalFetch();
      toast.success("Successfully synced with the server.");
    } catch (error) {
      console.error("Sync failed:", error);
      setError(error as Error);
      handleCriticalError();
    } finally {
      setLoading(false);
    }
  }

  // Add cleanup on unmount
  useEffect(() => {
    let mounted = true;

    const cleanup = async () => {
      if (mounted) {
        await closeDB();
      }
    };

    return () => {
      mounted = false;
      cleanup().catch(console.error);
    };
  }, []);

  // Add debounced refresh
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      triggerLocalFetch();
    }, 1000);
  }, []);

  // Cleanup refresh timeout
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const syncManager = SyncManager.getInstance();

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
        navigate('/login');
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
    triggerLocalFetch: debouncedRefresh,
    refreshDB, // Expose this for components that need to ensure DB connection
  };
}


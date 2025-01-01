// src/lib/sync/syncManager.ts
import toast from "react-hot-toast";
import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { db } from "../db/schema";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { parse } from "papaparse";

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private paymentMethodsFetched: boolean = false;
  private discountsFetched: boolean = false;
  private failedTrxFetched: boolean = false;
  private syncWindow: number = 30 * 60 * 1000; // 30 minutes
  private userInfo = JSON?.parse(localStorage?.getItem("user") || "{}");
  private storeId =
    Array.isArray(this.userInfo?.store) && this.userInfo?.store.length > 0
      ? String(this.userInfo.store[0].id || 1) : String(this.userInfo.store.store_id || 1);

  private constructor() { }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // async scheduleSync() {
  //   const delay = 30 * 60 * 1000; // 30 minutes
  //   setInterval(async () => {
  //     try {
  //       console.log("Starting scheduled sync...");
  //       await this.sync();
  //       console.log("Scheduled sync completed successfully");
  //     } catch (error) {
  //       console.error("Scheduled sync failed:", error);
  //     }
  //   }, delay);
  // }

  async shouldSync(): Promise<boolean> {
    try {
      const lastSyncProduct = await db.products.orderBy("lastSyncAt").last();
      const lastSyncTimestamp = lastSyncProduct?.lastSyncAt || new Date(0);
      const now = new Date();
      const timeElapsed = now.getTime() - lastSyncTimestamp.getTime();
      return timeElapsed >= this.syncWindow;
    } catch (error) {
      console.error("Error checking sync status:", error);
      return true; // Default to requiring sync on error
    }
  }

  async refresh() {
    try {
      console.log("Starting fetch...");
      await this.syncProducts();
      await this.syncCustomers();
      await this.syncPaymentMethods();
      await this.syncDiscounts();
      await this.syncFailedTrx();
      await this.syncBranches(this.storeId);

      console.log("Fetching completed.");
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }


  async sync(): Promise<void> {
    if (this.syncInProgress) {
      toast.success("Sync already in progress, skipping...");
      console.log("Sync already in progress, skipping...");
      return;
    }

    try {
      this.syncInProgress = true;
      console.log("Starting sync process...");
      await this.syncTransactions();
      await this.syncFailedTrx();
      await this.syncProducts();
      await this.syncCustomers();
      await this.syncPaymentMethods();
      await this.syncBranches(this.storeId);
      await this.syncDiscounts();
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProducts() {
    const remoteProducts = await RemoteApi.fetchStoreProducts();
    // console.log("Products to Sync", remoteProducts);
    await db.transaction("rw", db.products, async () => {
      for (const product of remoteProducts) {
        await db.products.put({
          ...product,
          lastSyncAt: new Date(),
        });
      }
    });
  }

  private async syncCustomers() {
    const remoteCustomers = await RemoteApi.fetchCustomer();
    await db.transaction("rw", db.customers, async () => {
      for (const customer of remoteCustomers) {
        await db.customers.put(customer);
      }
    });
  }

  private async syncTransactions() {
    const unsynedTransactions = await LocalApi.getUnsynedTransactions();
    if (unsynedTransactions.length === 0) return;
    console.log("Transactions to Sync", unsynedTransactions);
    const batchSize = 10;

    for (let i = 0; i < unsynedTransactions.length; i += batchSize) {
      const batch = unsynedTransactions.slice(i, i + batchSize);

      const transactiontoSync = batch.map((transaction) => {
        return {
          id: transaction.id,
          firstname: transaction?.customer?.firstname || null,
          lastname: transaction?.customer?.lastname || null,
          gender: transaction?.customer?.gender || null,
          age: transaction?.customer?.age || null,
          phoneno: transaction?.customer?.phoneno || null,
          email: transaction?.customer?.email || null,
          country: null,
          state: null,
          city: null,
          address: null,
          apply_loyalty_point:
            Number(transaction.loyaltyPoints) > 0 ? true : false,
          apply_credit_note_point:
            Number(transaction.creditNotePoints) > 0 ? true : false,
          payable_amount: transaction.payableAmount, //after discount
          exact_total_amount: transaction.originalTotal, //total amount before before any discount
          payment_type: "cash",
          discount_id: transaction?.discount?.id || null,
          created_at: dayjs(transaction.createdAt).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          loyalty_point_value: transaction.loyaltyPoints,
          credit_note_used: transaction.creditNotePoints,
          payment_methods: transaction.paymentMethods.map((method) => {
            return {
              mode_of_payment_id: method.mode_of_payment_id,
              amount: method.amount,
              mode_of_payment_pos_id: method.mode_of_payment_pos_id || "",
            };
          }),
          status: transaction.status,
          payment_status: "Completed",
          total_price: transaction.payableAmount, //after discount
          receipt_no: transaction.recieptNo,
          products: transaction.items.map((item: any) => {
            return {
              id: item.id,
              new_price: item.discountPrice.toFixed(2),
              ean: item.ean,
              quantity_ordered: item.quantity,
              color: item.color || "red",
              size: item.size || "XL",
              total: item.retail_price,
              discount_id: item?.discount?.id || null,
            };
          }),
        };
      });

      console.log("Transaction to Sync", transactiontoSync);

      // Generate random syncId
      const syncId = `${Math.floor(Date.now() / 1000)}_SYNC`;
      try {
        // Send to remote API for syncing
        const response = await RemoteApi.syncTransactions(
          transactiontoSync as any,
          syncId
        );

        const { successful_transaction, failed_transaction } =
          response?.data || {};

        const successfulCount = successful_transaction || 0;
        const failedCount = failed_transaction || 0;

        // Show success or failure message
        if (failedCount > 0) {
          console.error("Sync failed:", response?.message);
          toast.error(response?.message); // Show error with failed count
        } else {
          console.log("Transactions synced successfully.");
          toast.success(`Successfully synced ${successfulCount} transactions.`);
        }

        // Mark all transactions as synced regardless of success/failure
        await db.transaction("rw", db.transactions, async () => {
          for (const tx of transactiontoSync) {
            await LocalApi.markTransactionSynced(tx.id as string);
          }
        });
      } catch (error) {
        console.error("Failed to sync transactions:", error);
        toast.error("Failed to sync transactions, please try again.");
      }
    }

    // retrieve failed transactions
    // try {
    //     const failedTransactions = await RemoteApi.getFailedTransactions();
    //     if (failedTransactions.length > 0) {
    //         const csv = parse(failedTransactions);
    //         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    //         saveAs(blob, 'failed_transactions.csv');
    //     }
    // } catch (error) {
    //     console.error("Failed to fetch failed transactions:", error);
    //     toast.error("Failed to retrieve failed transactions.");
    // }
  }

  async syncSingleTransaction(transaction: any) {
    // const syncId = `${Math.floor(Date.now() / 1000)}_SYNC`
    const syncId = `${transaction.sync_session_id}`;

    try {
      const response = await RemoteApi.syncTransactions(
        [transaction?.transaction_data],
        syncId
      );
      const { successful_transaction, failed_transaction } =
        response?.data || {};

      const successfulCount = successful_transaction || 0;
      const failedCount = failed_transaction || 0;

      if (failedCount > 0) {
        console.error("Sync failed:", response?.message);
        toast.error(response?.message); // Show error with failed count
      } else {
        console.log("Transactions synced successfully.");
        toast.success(`Successfully synced ${successfulCount} transactions.`);
      }
    } catch (error) {
      console.error("Failed to sync transactions:", error);
      toast.error("Failed to sync transactions, please try again.");
    }
  }

  private async syncPaymentMethods() {
    if (this.paymentMethodsFetched) {
      console.log("Payment methods already synced");
      return;
    }
    const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();
    await db.transaction("rw", db.paymentMethods, async () => {
      for (const method of remotePaymentMethods) {
        await db.paymentMethods.put(method);
      }
    });
    this.paymentMethodsFetched = true;
  }

  private async syncDiscounts() {
    if (this.discountsFetched) {
      console.log("Discounts already synced");
      return;
    }

    const remoteDiscounts = await RemoteApi.fetchDiscounts();
    await db.transaction("rw", db.discounts, async () => {
      for (const discount of remoteDiscounts) {
        await db.discounts.put(discount);
      }
    });
    this.discountsFetched = true;
  }

  private async DownloadFailedTrx() {
    const failedTransactions = await RemoteApi.fetchFailedTransactions();
    if (failedTransactions.length > 0) {
      const csv = parse(failedTransactions);
      const blob = new Blob([csv as any], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "failed_transactions.csv");
    }
  }

  private async syncFailedTrx() {
    if (this.failedTrxFetched) {
      console.log("Failed trx already synced");
      return;
    }

    const remoteTrx = await RemoteApi.fetchFailedTransactions();
    // console.log(remoteTrx?.data)
    await db.transaction("rw", db.failedSyncTransactions, async () => {
      for (const trx of remoteTrx.data) {
        await db.failedSyncTransactions.put(trx);
      }
    });
    this.failedTrxFetched = true;
  }

  async syncBranches(soterId: string | number) {
    const remoteBranches = await RemoteApi.fetchPos(soterId);
    await db.transaction("rw", db.branches, async () => {
      for (const branch of remoteBranches) {
        await db.branches.put(branch);
      }
    });
  }
}

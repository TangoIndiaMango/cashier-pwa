// src/lib/sync/syncManager.ts
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { parse } from "papaparse";
import toast from "react-hot-toast";
import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { getDbInstance } from "../db/db";
import { delay } from "../utils";
import { LocalApiMethods } from "../api/localMethods";


const db = getDbInstance()

const createFailedTransaction = (
  transaction: any,
  syncId: string,
  error: string,
  formattedTransaction?: any
) => ({
  id: transaction.id,
  sync_session_id: syncId,
  customer_name: `${transaction?.customer?.firstname} ${transaction?.customer?.lastname}`,
  customer_email: transaction?.customer?.email || `${transaction?.customer?.firstname}${transaction?.customer?.lastname}@prelp.com`,
  receipt_no: String(transaction.recieptNo),
  payment_methods: transaction.paymentMethods,
  products: transaction.items.map(item => ({
    id: item.id,
    ean: item.ean,
    size: item.size || "",
    color: item.color || "",
    total: item.retail_price,
    new_price: item?.discountPrice?.toString() || "",
    discount_id: item?.discount?.id || null,
    quantity_ordered: item.quantity
  })),
  exact_total_amount: transaction.originalTotal,
  total: transaction.payableAmount?.toString(),
  transaction_data: formattedTransaction ? JSON.stringify(formattedTransaction) : null,
  error_message: error,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private syncWindow: number = 30 * 60 * 1000; // 30 minutes

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
      return true;
    }
  }

  async refresh() {
    try {
      console.log("Starting fetch...");
      await this.syncData()
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
      await delay(1)
      await this.syncData()
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncData() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      toast.error("Session ID is not available. Please log in.");
      return;
    }

    await Promise.all([
      this.syncProducts(sessionId),
      this.syncCustomers(sessionId),
      this.syncPaymentMethods(sessionId),
      this.syncDiscounts(sessionId),
      this.syncFailedTrx(sessionId),
      this.syncBranches(sessionId),
      this.sessionIDinDb(sessionId),
    ]);
  }

  private async syncProducts(sessionId: string) {
    const remoteProducts = await RemoteApi.fetchStoreProducts();
    await db.transaction("rw", db.products, async () => {
      for (const product of remoteProducts) {
        await db.products.put({
          ...product,
          lastSyncAt: new Date(),
          sessionId,
        });
      }
    });
  }

  private async syncCustomers(sessionId: string) {
    const remoteCustomers = await RemoteApi.fetchCustomer();
    await db.transaction("rw", db.customers, async () => {
      for (const customer of remoteCustomers) {
        await db.customers.put({ ...customer, sessionId });
      }
    });
  }

  private async syncPaymentMethods(sessionId: string) {
    const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();
    await db.transaction("rw", db.paymentMethods, async () => {
      for (const method of remotePaymentMethods) {
        await db.paymentMethods.put({ ...method, sessionId });
      }
    });
  }

  private async syncDiscounts(sessionId: string) {
    const remoteDiscounts = await RemoteApi.fetchDiscounts();
    await db.transaction("rw", db.discounts, async () => {
      for (const discount of remoteDiscounts) {
        await db.discounts.put({ ...discount, sessionId });
      }
    });
  }

  private async syncFailedTrx(sessionId: string) {
    const remoteTrx = await RemoteApi.fetchFailedTransactions();
    await db.transaction("rw", db.failedSyncTransactions, async () => {
      for (const trx of remoteTrx.data) {
        await db.failedSyncTransactions.put({ ...trx, sessionId });
      }
    });
  }

  private async syncBranches(sessionId: string) {
    const remoteBranches = await RemoteApi.fetchPos();
    await db.transaction("rw", db.branches, async () => {
      for (const branch of remoteBranches) {
        await db.branches.put({ ...branch, sessionId });
      }
    });
  }

  private async sessionIDinDb(sessionId: string) {
    await db.transaction("rw", db.sessionIds, async () => {
      await db.sessionIds.put({ sessionId });
    })
  }

  private async DownloadFailedTrx() {
    const failedTransactions = await RemoteApi.fetchFailedTransactions();
    if (failedTransactions.length > 0) {
      const csv = parse(failedTransactions);
      const blob = new Blob([csv as any], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "failed_transactions.csv");
    }
  }

  private async syncTransactions() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      toast.error("Session ID is not available. Please log in.");
      return;
    }

    const unsynedTransactions = await LocalApi.getUnsynedTransactions(String(sessionId));
    if (unsynedTransactions.length === 0) {
      toast.success("No transactions to sync");
      return;
    }

    console.log("Transactions to Sync", unsynedTransactions);
    const batchSize = 10;

    for (let i = 0; i < unsynedTransactions.length; i += batchSize) {
      const batch = unsynedTransactions.slice(i, i + batchSize);
      const syncId = `${Math.floor(Date.now() / 1000)}_SYNC`;
      const failedTransactions: any[] = [];

      for (const transaction of batch) {
        const formattedTransaction = {
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
          payable_amount: transaction.payableAmount as any, //after discount
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
              amount: method.amount as any,
              mode_of_payment_pos_id: method.mode_of_payment_pos_id || "",
            };
          }),
          status: transaction.status,
          payment_status: "Completed",
          total_price: transaction.payableAmount, //after discount
          receipt_no: transaction.recieptNo as string,
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
          sync_status: "pending", // Initial status
          sync_attempts: 0, // Track retry attempts
          error_message: ""
        };

        try {
          const response = await RemoteApi.syncTransactions([formattedTransaction as any], syncId);
          const { successful_transaction, failed_transaction } = response?.data || {};

          if (failed_transaction > 0) {
            failedTransactions.push(
              createFailedTransaction(
                transaction, 
                syncId, 
                response?.message || "Sync failed",
                formattedTransaction
              )
            );
          } else {
            await db.transactions.update(transaction.id, { 
              synced: "true", 
              sessionId: String(sessionId) 
            });
          }
        } catch (error) {
          failedTransactions.push(
            createFailedTransaction(
              transaction,
              syncId,
              error instanceof Error ? error.message : String(error),
              formattedTransaction
            )
          );
        }
      }

      if (failedTransactions.length > 0) {
        await LocalApiMethods.createFailedTrx(String(sessionId), failedTransactions);
      }
    }
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

}

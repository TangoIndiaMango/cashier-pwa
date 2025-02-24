// src/lib/sync/syncManager.ts
import { Transaction } from "@/types/type";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { parse } from "papaparse";
import toast from "react-hot-toast";
import { LocalApi } from "../api/localApi";
import { LocalApiMethods } from "../api/localMethods";
import { RemoteApi } from "../api/remoteApi";
import { getDbInstance } from "../db/db";
import { delay } from "../utils";

// interface FormattedTransaction {
//   id: string;
//   receipt_no: string;
//   customer_id: string | null;
//   customer_name: string;
//   customer_email: string;
//   customer_phone: string;
//   payment_methods: any[];
//   products: Array<{
//     id: string;
//     ean: string;
//     size: string;
//     color: string;
//     total: number;
//     new_price: string;
//     discount_id: string | null;
//     quantity_ordered: number;
//   }>;
//   exact_total_amount: number;
//   total: string;
//   created_at: string;
//   updated_at: string;
// }

const getDB = async () => {
  const db = await getDbInstance();
  return db;
};

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private syncWindow: number = 30 * 60 * 1000; // 30 minutes
  // private networkStatus: boolean = navigator.onLine;

  private constructor() {
    //   window.addEventListener('online', this.handleOnline.bind(this));
  }

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

  // private handleOnline = async () => {
  //   this.networkStatus = true;
  //   console.log("Connection restored, checking for failed transactions...");
  //   const sessionId = sessionStorage.getItem("sessionId");
  //   if (sessionId) {
  //     await this.syncFailedTrx(sessionId);
  //   }
  // }

  async shouldSync(): Promise<boolean> {
    try {
      const db = await getDB();
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
      toast.error('Refresh failed: ' + error);
    }
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) {
      toast.success("Sync already in progress, skipping...");
      return;
    }

    try {
      this.syncInProgress = true;
      await this.syncTransactions();
      await delay(1);
      await this.syncData();
    } catch (error) {
      console.error("Sync failed:", error);
      // toast.error('Sync failed: ' + error);
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

    // const db = await getDB();

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
    const db = await getDB();
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
    const db = await getDB();
    const remoteCustomers = await RemoteApi.fetchCustomer();

    await db.transaction("rw", db.customers, async () => {
      for (const customer of remoteCustomers) {
        await db.customers.put({ ...customer, sessionId });
      }
    });
  }

  private async syncPaymentMethods(sessionId: string) {
    const db = await getDB();
    const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();

    await db.transaction("rw", db.paymentMethods, async () => {
      for (const method of remotePaymentMethods) {
        await db.paymentMethods.put({ ...method, sessionId });
      }
    });
  }

  private async syncDiscounts(sessionId: string) {
    const db = await getDB();
    const remoteDiscounts = await RemoteApi.fetchDiscounts();

    await db.transaction("rw", db.discounts, async () => {
      for (const discount of remoteDiscounts) {
        await db.discounts.put({ ...discount, sessionId });
      }
    });
  }

  private async syncFailedTrx(sessionId: string) {
    const db = await getDB();
    const remoteTrx = await RemoteApi.fetchFailedTransactions();

    await db.transaction("rw", db.failedSyncTransactions, async () => {
      for (const trx of remoteTrx.data) {
        await db.failedSyncTransactions.put({ ...trx, sessionId });
      }
    });
  }

  private async syncBranches(sessionId: string) {
    const db = await getDB();
    const remoteBranches = await RemoteApi.fetchPos();

    await db.transaction("rw", db.branches, async () => {
      for (const branch of remoteBranches) {
        await db.branches.put({ ...branch, sessionId });
      }
    });
  }

  private async sessionIDinDb(sessionId: string) {
    const db = await getDB();
    await db.transaction("rw", db.sessionIds, async () => {
      await db.sessionIds.put({ sessionId });
    });
  }

  private async DownloadFailedTrx() {
    const failedTransactions = await RemoteApi.fetchFailedTransactions();
    if (failedTransactions.length > 0) {
      const csv = parse(failedTransactions);
      const blob = new Blob([csv as any], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `failed_transactions_${dayjs().format('YYYY-MM-DD_HH-mm')}.csv`);
    }
  }

  private createFailedTransaction(
    formattedTransaction: any,
    sessionId: string,
    syncId: string,
    error: string
  ) {

    return {
      ...formattedTransaction,
      sync_session_id: syncId,
      transaction_data: JSON.stringify({
        ...formattedTransaction,
        created_at: new Date().toISOString(),
        sync_session_id: syncId
      }),
      sessionId: sessionId,
      error_message: error,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private async syncTransactions() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      toast.error("Session ID is not available. Please log in.");
      return;
    }

    const unsynedTransactions = await LocalApi.getUnsynedTransactions(sessionId);
    if (unsynedTransactions.length === 0) {
      toast.success("No transactions to sync");
      return;
    }

    const batchSize = 10;
    for (let i = 0; i < unsynedTransactions.length; i += batchSize) {
      const batch = unsynedTransactions.slice(i, i + batchSize);
      const syncId = `${Math.floor(Date.now() / 1000)}_SYNC`;

      for (const transaction of batch) {
        const formattedTransaction = this.formatTransaction(transaction) as unknown as Transaction;
        try {
          const response = await RemoteApi.syncTransactions([formattedTransaction], syncId);
          if (!response || !response.data) {
            throw new Error("Invalid response from server");
          }
          const { failed_transaction = 0 } = response?.data || {};

          if (failed_transaction > 0) {
            await LocalApiMethods.createFailedTrx(sessionId, [
              this.createFailedTransaction(formattedTransaction, sessionId, syncId, response?.message || "Sync failed")
            ]);
          } else {
            await LocalApi.markTransactionSynced(transaction.id, sessionId);
            toast.success(`${response?.data?.message}`);
          }
        } catch (error) {
          console.error("Transaction sync failed:", error);
          await LocalApiMethods.createFailedTrx(sessionId, [
            this.createFailedTransaction(
              formattedTransaction,
              sessionId,
              syncId,
              error instanceof Error ? error.message : String(error)
            )
          ]);
        }
      }
    }
  }

  private formatTransaction(transaction: any) {
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
  }

  async syncSingleTransaction(transaction: any) {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      toast.error("Session ID is not available. Please log in.");
      return;
    }
    console.log(transaction.sessionId, sessionId)
    // Verify the transaction belongs to this session
    // if (transaction.sessionId !== String(sessionId)) {
    //   toast.error("Unauthorized: Transaction belongs to another session");
    //   return;
    // }

    const syncId = transaction.sync_session_id;
    const db = await getDB();

    try {
      let transactionData;
      try {
        transactionData = typeof transaction.transaction_data === 'string'
          ? JSON.parse(transaction.transaction_data)
          : transaction.transaction_data;
      } catch (parseError) {
        console.error("Invalid transaction data format:", parseError);
        toast.error("Invalid transaction data format");
        return;
      }

      if (!transactionData || !transactionData.id) {
        toast.error("Invalid transaction data");
        return;
      }

      const response = await RemoteApi.syncTransactions([transactionData], syncId);
      const { successful_transaction, failed_transaction } = response?.data || {};

      if (failed_transaction > 0) {
        toast.error(response?.message || "Sync failed");
        return;
      }

      // Use a single transaction for all DB operations
      await db.transaction('rw', [db.failedSyncTransactions, db.transactions], async () => {
        // Remove from failed transactions
        await db.failedSyncTransactions
          .where({
            id: transaction.id,
            sessionId: String(sessionId)
          })
          .delete();

        // Update original transaction
        await db.transactions
          .where({
            id: transactionData.id,
            sessionId: String(sessionId)
          })
          .modify({ synced: "true" });
      });

      toast.success(`${successful_transaction} transaction(s) synced successfully`);
      await this.syncFailedTrx(sessionId);

    } catch (error) {
      console.error("Sync failed:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Network error, please check your connection";

      toast.error(errorMessage);

      await LocalApiMethods.updateFailedTrx(
        sessionId,
        transaction.id,
        {
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
          sync_attempts: (transaction.sync_attempts || 0) + 1
        }
      );
    }
  }
}


/**
 * 
 * public async syncFailedTrx(sessionId: string) {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      const failedTransactions = await LocalApiMethods.getFailedSyncTrx(sessionId);
      
      if (failedTransactions.length > 0) {
        toast.info(`Attempting to sync ${failedTransactions.length} failed transaction(s)`);
        
        for (const transaction of failedTransactions) {
          try {
            const transactionData = JSON.parse(transaction.transaction_data);
            const response = await RemoteApi.syncTransactions([transactionData], transaction.sync_session_id);
            
            if (response?.data?.successful_transaction > 0) {
              await LocalApiMethods.removeFailedTrx(sessionId, transaction.id);
              toast.success(`Transaction ${transaction.id} synced successfully`);
            }
          } catch (error) {
            console.error(`Failed to sync transaction ${transaction.id}:`, error);
            // Update error message and increment sync attempts
            await LocalApiMethods.updateFailedTrx(
              sessionId,
              transaction.id,
              {
                error_message: error instanceof Error ? error.message : String(error),
                updated_at: new Date().toISOString(),
                sync_attempts: (transaction.sync_attempts || 0) + 1
              }
            );
          }
            }
    } finally {
      this.syncInProgress = false;
    }
  }
 */

// src/lib/sync/syncManager.ts
import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { db } from "../db/schema";

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private paymentMethodsFetched: boolean = false;
  private discountsFetched: boolean = false;
  private syncWindow: number = 30 * 60 * 1000; // 5 minutes


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
      const lastSyncProduct = await db.products.orderBy('lastSyncAt').last();
      const lastSyncTimestamp = lastSyncProduct?.lastSyncAt || new Date(0);
      const now = new Date();
      const timeElapsed = now.getTime() - lastSyncTimestamp.getTime();
      return timeElapsed >= this.syncWindow;
    } catch (error) {
      console.error("Error checking sync status:", error);
      return true; // Default to requiring sync on error
    }
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) {
      console.log("Sync already in progress, skipping...");
      return;
    }

    try {
      this.syncInProgress = true;
      console.log("Starting sync process...");
      await this.syncProducts()
      await this.syncCustomers()
      await this.syncTransactions()
      await this.syncPaymentMethods()
      await this.syncDiscounts()

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProducts() {
    const remoteProducts = await RemoteApi.fetchStoreProducts();
    await db.transaction('rw', db.products, async () => {
      for (const product of remoteProducts) {
        await db.products.put({
          ...product,
          lastSyncAt: new Date()
        });
      }
    });
  }

  private async syncCustomers() {
    const remoteCustomers = await RemoteApi.fetchCustomer();
    await db.transaction('rw', db.customers, async () => {
      for (const customer of remoteCustomers) {
        await db.customers.put(customer);
      }
    });
  }

  private async syncTransactions() {
    const unsynedTransactions = await LocalApi.getUnsynedTransactions();
    if (unsynedTransactions.length === 0) return;
    console.log("Transactions to Sync", unsynedTransactions);
    // Process transactions in smaller batches
    const batchSize = 10;
    for (let i = 0; i < unsynedTransactions.length; i += batchSize) {
      const batch = unsynedTransactions.slice(i, i + batchSize);
      // TODO: SYNC LOCAL TRANSACTION
      const transactiontoSync = batch.map((transaction) => {
        return {
          country: null,
          state: null,
          city: null,
          address: null,
          apply_loyalty_point: false,
          apply_credit_note_point: false,
          payable_amount: transaction.totalAmount, //dicounted price
          exact_total_amount: transaction.totalAmount, // i think should be the exact total amount
          payment_type: '',
          payment_methods: transaction.paymentMethods.map((method) => {
            return {
              mode_of_payment_id: method.mode_of_payment_id,
              amount: method.amount,
              mode_of_payment_pos_id: 1
            }
          }),
          status: transaction.status,
          payment_status: transaction.status,
          total_price: transaction.totalAmount,
          receipt_no: transaction.id,
          discount_id: transaction?.discount?.id || "",
          products: transaction.items.map((item: any) => {
            return {
              id: item.id,
              new_price: item.discountPrice,
              ean: item.ean,
              quantity_ordered: item.quantity,
              color: item.color || "red",
              size: item.size || "XL",
              total: item.retail_price,
              discount_id: item?.discount?.id || ""
            }
          }),
          firstname: transaction?.customer?.firstname || null,
          lastname: transaction?.customer?.lastname || null,
          gender: transaction?.customer?.gender || null,
          age: transaction?.customer?.age || null,
          phoneno: transaction?.customer?.phoneno || null,
          email: transaction?.customer?.email || null
        }
      })
      console.log("Transaction to Sync", transactiontoSync);
      // return;
      // generate randomId
      const syncId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await RemoteApi.syncTransactions(batch as any, syncId);
      await db.transaction('rw', db.transactions, async () => {
        for (const tx of batch) {
          await LocalApi.markTransactionSynced(tx.id as string);
        }
      });
    }
  }

  private async syncPaymentMethods() {
    if (this.paymentMethodsFetched) {
      console.log("Payment methods already synced");
      return;
    }
    const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();
    await db.transaction('rw', db.paymentMethods, async () => {
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
    await db.transaction('rw', db.discounts, async () => {
      for (const discount of remoteDiscounts) {
        await db.discounts.put(discount);
      }
    });
    this.discountsFetched = true;
  }
}
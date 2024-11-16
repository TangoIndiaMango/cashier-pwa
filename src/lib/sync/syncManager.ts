// src/lib/sync/syncManager.ts
import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { db } from "../db/schema";

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private paymentMethodsFetched: boolean = false;
  private discountsFetched: boolean = false;
  private syncWindow: number = 5 * 60 * 1000; // 5 minutes

  private constructor() { }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Sync interval method (30 minutes)
  async scheduleSync() {
    const delay = 30 * 60 * 1000; // 30 minutes
    setInterval(() => {
      console.log("Syncing...");
      this.sync();
      console.log("Synced, Check Database");
    }, delay);
  }

  async shouldSync(): Promise<boolean> {
    const lastSyncProduct = await db.products.orderBy('lastSyncAt').last();
    const lastSyncTimestamp = lastSyncProduct?.lastSyncAt || new Date(0);

    const now = new Date();
    const timeElapsed = now.getTime() - lastSyncTimestamp.getTime();
    return timeElapsed >= this.syncWindow;
  }

  // Sync logic that syncs all data including products, customers, and transactions
  async sync(): Promise<void> {
    if (this.syncInProgress) {
      console.log("Sync is already in progress, skipping this interval...");
      return;
    }

    try {
      const shouldSync = await this.shouldSync();
      if (!shouldSync) {
        console.log("No sync needed. Data is up to date.");
        return;
      }

      this.syncInProgress = true;
      console.log("Starting Syncing...");

      // Sync products, customers, and transactions
      await this.syncProducts();
      await this.syncCustomers();
      await this.syncTransactions();

      // Sync payment methods and discounts only when needed
      if (!this.paymentMethodsFetched) await this.syncPaymentMethods();
      if (!this.discountsFetched) await this.syncDiscounts();

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync products
  private async syncProducts() {
    const remoteProducts = await RemoteApi.fetchStoreProducts();
    console.log("Fetched remote products");

    await db.transaction('rw', db.products, async () => {
      for (const product of remoteProducts) {
        await db.products.put(product);
      }
    });
    console.log("Synced Products with Local DB");
  }

  // Sync customers
  private async syncCustomers() {
    const remoteCustomers = await RemoteApi.fetchCustomer();
    console.log("Fetched remote customers");

    await db.transaction('rw', db.customers, async () => {
      for (const customer of remoteCustomers) {
        await db.customers.put(customer);
      }
    });
    console.log("Synced Customers with Local DB");
  }

  // Sync transactions (unsynced local transactions)
  private async syncTransactions() {
    const unsynedTransactions = await LocalApi.getUnsynedTransactions();
    console.log("Unsynced Transactions", unsynedTransactions)
    if (unsynedTransactions.length > 0) {
      // TODO: SYNC LOCAL TRANSACTION
      const transactiontoSync = unsynedTransactions.map((transaction) => {
        return {
          country: null,
          state: null,
          city: null,
          address: null,
          apply_loyalty_point: false,
          apply_credit_note_point: false,
          payable_amount: '',
          exact_total_amount: transaction.totalAmount,
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
          products: transaction.items.map((item: any) => {
            return {
              id: item.productId,
              new_price: item.unitPrice,
              ean: item.productCode,
              quantity_ordered: item.quantity,
              color: item.color || "red",
              size: item.size || "XL",
              total: item.totalPrice,
              discount_id: item.discountId || 1
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

      console.log("Transaction to Sync", transactiontoSync)
      return;
      await RemoteApi.syncTransactions(unsynedTransactions as any);

      // Mark transactions as synced
      await db.transaction('rw', db.transactions, async () => {
        for (const tx of unsynedTransactions) {
          await LocalApi.markTransactionSynced(tx.id as string);
        }
      });
    }
  }

  async syncPaymentMethods() {
    const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();
    if (!this.paymentMethodsFetched) {
      await db.transaction('rw', db.paymentMethods, async () => {
        for (const method of remotePaymentMethods) {
          await db.paymentMethods.put(method);
        }
      });
      this.paymentMethodsFetched = true;
      console.log("Fresh Synced Payment Methods with Local DB");
      return
    }
    console.log("Already Synced Payment Methods with Local DB");
  }

  // Fetch and cache discounts
  async syncDiscounts() {
    const remoteDiscounts = await RemoteApi.fetchDiscounts();
    if (!this.discountsFetched) {
      await db.transaction('rw', db.discounts, async () => {
        for (const discount of remoteDiscounts) {
          await db.discounts.put(discount);
        }
      });
      this.discountsFetched = true;
      console.log("Fresh Synced Discounts with Local DB");
      return
    }
    console.log("Already Synced Discounts with Local DB");
  }
}

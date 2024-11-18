// src/lib/sync/syncManager.ts
import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { db } from "../db/schema";

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private paymentMethodsFetched: boolean = false;
  private discountsFetched: boolean = false;
  private syncWindow: number = 5 * 60 * 1000; // 5 minutes
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  };

  private constructor() { }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `${operationName} attempt ${attempt} failed:`,
          error
        );

        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      throw new Error(
        `Last error: ${lastError}`
      );
    }
    throw new Error(
      `${operationName} failed after ${this.retryConfig.maxRetries} attempts.`
    );
  }

  async scheduleSync() {
    const delay = 30 * 60 * 1000; // 30 minutes
    setInterval(async () => {
      try {
        console.log("Starting scheduled sync...");
        await this.sync();
        console.log("Scheduled sync completed successfully");
      } catch (error) {
        console.error("Scheduled sync failed:", error);
      }
    }, delay);
  }

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
      const shouldSync = await this.shouldSync();
      if (!shouldSync) {
        console.log("No sync needed. Data is up to date.");
        return;
      }

      this.syncInProgress = true;
      console.log("Starting sync process...");

      // Use Promise.allSettled to handle partial failures
      const results = await Promise.allSettled([
        this.syncProducts(),
        this.syncCustomers(),
        this.syncTransactions(),
        this.syncPaymentMethods(),
        this.syncDiscounts()
      ]);

      // Log results of each operation
      results.forEach((result, index) => {
        const operations = ['Products', 'Customers', 'Transactions', 'PaymentMethods', 'Discounts'];
        if (result.status === 'fulfilled') {
          console.log(`${operations[index]} sync completed successfully`);
        } else {
          console.error(`${operations[index]} sync failed:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProducts() {
    return this.retryOperation(async () => {
      const remoteProducts = await RemoteApi.fetchStoreProducts();
      await db.transaction('rw', db.products, async () => {
        for (const product of remoteProducts) {
          await db.products.put({
            ...product,
            lastSyncAt: new Date()
          });
        }
      });
    }, 'Products sync');
  }

  private async syncCustomers() {
    return this.retryOperation(async () => {
      const remoteCustomers = await RemoteApi.fetchCustomer();
      await db.transaction('rw', db.customers, async () => {
        for (const customer of remoteCustomers) {
          await db.customers.put(customer);
        }
      });
    }, 'Customers sync');
  }

  private async syncTransactions() {
    return this.retryOperation(async () => {
      const unsynedTransactions = await LocalApi.getUnsynedTransactions();
      if (unsynedTransactions.length === 0) return;

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
            discount_id: transaction.discount.id || "",
            products: transaction.items.map((item: any) => {
              return {
                id: item.productId,
                new_price: item.unitPrice,
                ean: item.productCode,
                quantity_ordered: item.quantity,
                color: item.color || "red",
                size: item.size || "XL",
                total: item.totalPrice,
                discount_id: item.discount.id || ""
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
        return;
        await RemoteApi.syncTransactions(batch as any);
        await db.transaction('rw', db.transactions, async () => {
          for (const tx of batch) {
            await LocalApi.markTransactionSynced(tx.id as string);
          }
        });
      }
    }, 'Transactions sync');
  }

  private async syncPaymentMethods() {
    if (this.paymentMethodsFetched) {
      console.log("Payment methods already synced");
      return;
    }

    return this.retryOperation(async () => {
      const remotePaymentMethods = await RemoteApi.fetchPaymentMethod();
      await db.transaction('rw', db.paymentMethods, async () => {
        for (const method of remotePaymentMethods) {
          await db.paymentMethods.put(method);
        }
      });
      this.paymentMethodsFetched = true;
    }, 'Payment methods sync');
  }

  private async syncDiscounts() {
    if (this.discountsFetched) {
      console.log("Discounts already synced");
      return;
    }

    return this.retryOperation(async () => {
      const remoteDiscounts = await RemoteApi.fetchDiscounts();
      await db.transaction('rw', db.discounts, async () => {
        for (const discount of remoteDiscounts) {
          await db.discounts.put(discount);
        }
      });
      this.discountsFetched = true;
    }, 'Discounts sync');
  }
}
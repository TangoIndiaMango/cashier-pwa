import { LocalApi } from "../api/localApi";
import { RemoteApi } from "../api/remoteApi";
import { db } from "../db/schema";


export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress: boolean = false;
  private storeId: string;

  private constructor(storeId: string) {
    this.storeId = storeId;
  }

  static getInstance(storeId: string): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager(storeId);
    }
    return SyncManager.instance;
  }

  async scheduleSync(): Promise<void> {
    // const now = new Date();
    // const midnight = new Date(
    //   now.getFullYear(),
    //   now.getMonth(),
    //   now.getDate() + 1,
    //   0, 0, 0
    // );
    // const timeUntilMidnight = midnight.getTime() - now.getTime();

    // setTimeout(() => {
    //   this.sync();
    //   // Schedule next sync
    //   this.scheduleMidnightSync();
    // }, timeUntilMidnight);

    const delay = 5 * 60 * 1000;
    setInterval(() => {
      console.log("Syncing...");
      this.sync();
      console.log("Synced, Check Database");

    }, delay);
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) {
      console.log("Sync is already in progress, skipping this interval...");
      return;
    }

    try {
      console.log("Starting Syncing...");
      this.syncInProgress = true;

      // 1. Get last sync timestamp
      const lastSyncProduct = await db.products
        .orderBy('lastSyncAt')
        .last();
      const lastSyncTimestamp = lastSyncProduct?.lastSyncAt.toISOString() || new Date(0).toISOString();
      console.log("Last Sync Timestamp", lastSyncTimestamp)

      // 2. Sync products
      const remoteProducts = await RemoteApi.fetchStoreProducts(
        this.storeId,
        lastSyncTimestamp
      );
      console.log("Sync BAckend Products", remoteProducts)

      // 3. Update local products
      await db.transaction('rw', db.products, async () => {
        for (const product of remoteProducts) {
          const localProduct = await db.products.get(product.id);

          if (!localProduct || localProduct.version < product.version) {
            await db.products.put(product);
          }
        }
      });
      console.log("Synced Products with Local DB", remoteProducts)


      // 4. Sync unsynced transactions
      const unsynedTransactions = await LocalApi.getUnsynedTransactions();
      console.log("Unsynced Transactions", unsynedTransactions)
      if (unsynedTransactions.length > 0) {
        await RemoteApi.syncTransactions(this.storeId, unsynedTransactions);

        // Mark transactions as synced
        await db.transaction('rw', db.transactions, async () => {
          for (const tx of unsynedTransactions) {
            await LocalApi.markTransactionSynced(tx.id);
          }
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      // Implement retry logic or notification system
    } finally {
      this.syncInProgress = false;
    }
  }
}
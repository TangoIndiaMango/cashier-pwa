// src/lib/api/localApi.ts
import { db } from '../db/schema';
import type { LocalProduct, LocalTransaction } from '../db/schema';

export class LocalApi {
  // Product Operations
  static async getAllProducts(): Promise<LocalProduct[]> {
    return db.products.toArray();
  }

  static async getProductById(id: string): Promise<LocalProduct | undefined> {
    return db.products.get(id);
  }

  static async getProductByBarcode(barcode: string): Promise<LocalProduct | undefined> {
    return db.products.where({ barcode }).first();
  }

  static async updateProductQuantity(id: string, quantityChange: number): Promise<void> {
    await db.transaction('rw', db.products, async () => {
      const product = await db.products.get(id);
      if (!product) throw new Error('Product not found');
      
      if (product.currentQuantity + quantityChange < 0) {
        throw new Error('Insufficient quantity');
      }

      await db.products.update(id, {
        currentQuantity: product.currentQuantity + quantityChange,
        isModified: true,
        version: product.version + 1
      });
    });
  }

  // Transaction Operations
  static async createTransaction(transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.transaction('rw', [db.transactions, db.products], async () => {
      // Update product quantities
      for (const item of transaction.items) {
        await this.updateProductQuantity(item.productId, -item.quantity);
      }

      // Create transaction
      await db.transactions.add({
        ...transaction,
        id,
        createdAt: new Date(),
        synced: 'false'
      });
    });

    return id;
  }

  static async getUnsynedTransactions(): Promise<LocalTransaction[]> {
    return await db.transactions.where('synced').equals('false').toArray();

  }

  static async markTransactionSynced(id: string): Promise<void> {
    await db.transactions.update(id, { synced: 'true' });
  }
}
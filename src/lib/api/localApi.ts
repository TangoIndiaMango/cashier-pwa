// src/lib/api/localApi.ts
import { db } from '../db/schema';
import type { LocalCustomer, LocalProduct, LocalTransaction } from '../db/schema';

export class LocalApi {
  // Product Operations
  static async getAllProducts(): Promise<LocalProduct[]> {
    return db.products.toArray();
  }

  static async getProductById(id: string): Promise<LocalProduct | undefined> {
    return db.products.get(id);
  }

  static async getProductByBrandName(brand_name: string): Promise<LocalProduct | undefined> {
    return db.products.where({ brand_name }).first();
  }

  static async getProductByCode(product_code: string): Promise<LocalProduct | undefined> {
    return db.products.where({ product_code }).first();
  }

  static async getProductByBrandID(brandId: string): Promise<LocalProduct | undefined> {
    return db.products.where({ brandId }).first();
  }

  static async updateProductQuantity(product_code: string, quantityChange: number): Promise<void> {
    await db.transaction('rw', db.products, async () => {

      const product = await db.products.where("product_code").equals(String(product_code)).first();

      if (!product) throw new Error('Product not found');

      if (product.available_quantity + quantityChange < 0) {
        throw new Error('Insufficient quantity');
      }

      await db.products.update(product.id, {
        available_quantity: product.available_quantity + quantityChange,
        // isModified: true,
        // version: product.version + 1
      });
    });
  }

  // Transaction Operations
  static async createTransaction(transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.transaction('rw', [db.transactions, db.products], async () => {
      // Update product quantities
      for (const item of transaction.items) {
        console.log("create transaction", item)
        await this.updateProductQuantity(item.productCode, -item.quantity);
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

  static async getCustomers(): Promise<LocalCustomer[]> {
    return await db.customers.toArray();
  }

  static async getAllTransactions(): Promise<LocalTransaction[]> {
    return await db.transactions.toArray();
  }
}
// src/lib/api/localApi.ts
import { useApplyPoints } from '@/hooks/useApplyPoints';
import toast from 'react-hot-toast';
import type { LocalCustomer, LocalProduct, LocalTransaction } from '../db/schema';
import { db } from '../db/schema';
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

  static async getProductByCode(product_code: string): Promise<LocalProduct[] | undefined> {
    return db.products.where({ product_code }).toArray();
  }

  static async getProductByBrandID(brandId: string): Promise<LocalProduct | undefined> {
    return db.products.where({ brandId }).first();
  }

  static async updateProductQuantity(ean: string, quantityChange: number): Promise<void> {
    await db.transaction('rw', db.products, async () => {

      const product = await db.products.where("ean").equals(String(ean)).first();

      if (!product) throw new Error('Product not found');

      console.log(`Current quantity: ${product.available_quantity}`);
      console.log(`Quantity change: ${quantityChange}`);
  
      if (product.available_quantity + quantityChange < 0) {
        throw new Error('Insufficient quantity');
      }
  
      const newQuantity = product.available_quantity - quantityChange;
      console.log(`Updated quantity: ${newQuantity}`);

      const updated = await db.products.update(product.id, {
        available_quantity: newQuantity,
        isModified: true,
        // version: product.version + 1
      });
      if (updated) {
        console.log(`Product quantity updated successfully for EAN ${ean}. New quantity: ${newQuantity}`);
      } else {
        console.log('Failed to update product quantity');
      }
    });
  }

  // Transaction Operations
  static async createTransaction(transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced'>): Promise<string> {
    const id = crypto.randomUUID();
    console.log(transaction)
    console.log(transaction?.customer?.phoneno, "Here's the customertrans")
    await this.updateCustomerCreditNote(transaction?.customer?.phoneno)
    await this.updateCustomerLoyaltyPoints(transaction?.customer?.phoneno)

    try {
      await db.transaction('rw', [db.transactions, db.products], async () => {
        for (const item of transaction.items) {
          console.log('Updating product:', item)
          console.log(item.ean, item.quantity)
          await this.updateProductQuantity(item.ean!, item.quantity);
        }
        // console.log("After updating quantity", transaction)
        await db.transactions.add({
          ...transaction,
          id,
          createdAt: new Date(),
          synced: 'false',
        });
      });

      return id;

    } catch (error) {
      console.error('Transaction creation failed:', error);
      toast.error('Transaction failed. Please try again later ' + error);
      throw new Error('Transaction failed. Please try again later.');
    }
  }


  static async deleteAllTransactions(): Promise<void> {
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.clear();
    });
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

  static async updateCustomerLoyaltyPoints(customerPhoneno: string): Promise<void> {
    const { newLoyaltyPoints } = useApplyPoints.getState();
    await db.transaction('rw', db.customers, async () => {
      const customer = await db.customers.where("phoneno").equals(customerPhoneno).first();

      if (!customer) throw new Error('Customer not found');

      await db.customers.update(customer?.id, {
        loyalty_points: newLoyaltyPoints,
      });
    });
  }

  static async updateCustomerCreditNote(customerPhoneno: string): Promise<void> {
    const { newCreditNotePoints } = useApplyPoints.getState();
    await db.transaction('rw', db.customers, async () => {
      const customer = await db.customers.where("phoneno").equals(customerPhoneno).first();

      if (!customer) throw new Error('Customer not found');

      await db.customers.update(customer?.id, {
        credit_note_balance: newCreditNotePoints,
      });
    });
  }

  static async getAllTransactions(): Promise<LocalTransaction[]> {
    return await db.transactions.toArray();
  }
}
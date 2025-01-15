// src/lib/api/localApi.ts
import { useApplyPoints } from '@/hooks/useApplyPoints';
import toast from 'react-hot-toast';
import type { LocalCustomer, LocalProduct, LocalTransaction } from '../db/schema';

import { redirect } from 'react-router-dom';
import { getDbInstance } from '../db/db';
// import { db } from '../db/schema';
const db = getDbInstance()
export class LocalApi {
  // Product Operations
  static async getAllProducts(sessionId: string): Promise<LocalProduct[]> {
    return db.products.where("sessionId").equals(String(sessionId)).toArray();
  }

  static async getProductById(id: string, sessionId: string): Promise<LocalProduct | undefined> {
    return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.id === id).first();
  }

  static async getProductByBrandName(brand_name: string, sessionId: string): Promise<LocalProduct | undefined> {
    return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.brand_name === brand_name).first();
  }

  static async getProductByCode(product_code: string, sessionId: string): Promise<LocalProduct[] | undefined> {

    return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.product_code === product_code).toArray();
  }

  static async getProductByBrandID(brandId: string, sessionId: string): Promise<LocalProduct | undefined> {

    return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.brand_id === brandId).first();
  }

  static async updateProductQuantity(ean: string, quantityChange: number, sessionId: string): Promise<void> {

    await db.transaction('rw', db.products, async () => {

      const product = await db.products.where("sessionId").equals(String(sessionId)).and((product) => product.ean === ean).first();

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
  static async createTransaction(transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced' | "sessionId">, sessionId: string): Promise<string> {

    const id = crypto.randomUUID()

    if (!sessionId) {
      toast.error("Please login again, no SessionID found")
      redirect('/login')
      return ""
    }

    console.log(transaction)
    console.log(transaction?.customer?.phoneno, "Here's the customertrans")
    await this.updateCustomerCreditNote(transaction?.customer)
    await this.updateCustomerLoyaltyPoints(transaction?.customer)

    try {
      await db.transaction('rw', [db.transactions, db.products], async () => {
        for (const item of transaction.items) {
          console.log('Updating product:', item)
          console.log(item.ean, item.quantity)
          await this.updateProductQuantity(item.ean!, item.quantity, sessionId);
        }
        // console.log("After updating quantity", transaction)
        await db.transactions.add({
          ...transaction,
          id,
          createdAt: new Date(),
          synced: 'false',
          sessionId: sessionId
        });
      });

      return id;

    } catch (error) {
      console.error('Transaction creation failed:', error);
      toast.error('Transaction failed. Please try again later ' + error);
      throw new Error('Transaction failed. Please try again later.');
    }
  }

  static async deleteAllTransactions(sessionId: string): Promise<void> {
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.where('sessionId').equals(String(sessionId)).delete();
    });
  }

  static async getUnsynedTransactions(sessionId: string): Promise<LocalTransaction[]> {

    return await db.transactions.where('sessionId').equals(String(sessionId)).and((transaction) => transaction.synced === 'false').toArray();
  }

  static async markTransactionSynced(id: string, sessionId: string): Promise<void> {

    await db.transactions.update(id, { synced: 'true', sessionId });
  }

  static async getCustomers(sessionId: string): Promise<LocalCustomer[]> {

    return await db.customers.where("sessionId").equals(String(sessionId)).toArray();
  }

  static async updateOrCreateCustomer(customerInfo: LocalCustomer, points: number, type: "credit_note_balance" | "loyalty_points"): Promise<void> {
    const sessionId = sessionStorage.getItem('sessionId');
    await db.transaction('rw', db.customers, async () => {
      let customer = await db.customers.where("sessionId").equals(String(sessionId)).and((cust) => cust.phoneno === customerInfo.phoneno).first();
      if (!customer) {
        customer = await db.customers.add({
          phoneno: customerInfo.phoneno,
          credit_note_balance: type === "credit_note_balance" ? points : 0,
          firstname: customerInfo.firstname,
          lastname: customerInfo.lastname,
          id: Date.now(),
          email: customerInfo.email || `${customerInfo.firstname}+${customerInfo.firstname}@prlerp.com`,
          age: null,
          gender: "",
          country: "",
          state: "",
          city: "",
          address: "",
          loyalty_points: type === "loyalty_points" ? points : 0
        });

      } else {
        const updateData = type === "loyalty_points" ? { loyalty_points: points } : { credit_note_balance: points }
        await db.customers.update(customer?.id, updateData);
      }
    });
  }
  static async updateCustomerLoyaltyPoints(customerInfo: LocalCustomer): Promise<void> {
    const { newLoyaltyPoints } = useApplyPoints.getState();
    await this.updateOrCreateCustomer(customerInfo, newLoyaltyPoints, "loyalty_points");
  }

  static async updateCustomerCreditNote(customerInfo: LocalCustomer): Promise<void> {
    const { newCreditNotePoints } = useApplyPoints.getState();
    await this.updateOrCreateCustomer(customerInfo, newCreditNotePoints, "credit_note_balance");
  }

  static async getAllTransactions(sessionId: string): Promise<LocalTransaction[]> {

    return await db.transactions.where("sessionId").equals(String(sessionId)).toArray();
  }

  static async clearSessionData(sessionId: string) {

    // it can only take 6 diffferent tables at a time
    await db.transaction('rw', db.transactions, db.customers, db.branches, db.products, async () => {
      await db.transactions.where('sessionId').equals(String(sessionId)).delete();
      await db.customers.where("sessionId").equals(String(sessionId)).delete();
      await db.products.where("sessionId").equals(String(sessionId)).delete();
      await db.branches.where("sessionId").equals(String(sessionId)).delete();
    })

    await db.transaction('rw', db.discounts, db.paymentMethods, db.failedSyncTransactions, db.sessionIds, async () => {
      await db.discounts.where('sessionId').equals(String(sessionId)).delete()
      await db.paymentMethods.where('sessionId').equals(String(sessionId)).delete()
      await db.failedSyncTransactions.where('sessionId').equals(String(sessionId)).delete()
      await db.sessionIds.where('sessionId').equals(String(sessionId)).delete()
    })
    db.sessionId = ""
  }
}
// src/lib/api/localApi.ts
import { useApplyPoints } from '@/hooks/useApplyPoints';
import toast from 'react-hot-toast';
import type { LocalCustomer, LocalProduct, LocalTransaction } from '../db/schema';

import { redirect } from 'react-router-dom';
import { getDbInstance } from '../db/db';
import { LocalApiMethods } from './localMethods';
// import { db } from '../db/schema';



export class LocalApi {
  private static async getDB() {
    const db = await getDbInstance();
    return db;
  }

  // Product Operations
  // static async getAllProducts(sessionId: string): Promise<LocalProduct[]> {
  //   return db.products.where("sessionId").equals(String(sessionId)).toArray();
  // }
  static async getAllProducts(): Promise<LocalProduct[]> {
    const db = await this.getDB();
    return db.products.toArray();
  }

  // static async getProductById(id: string, sessionId: string): Promise<LocalProduct | undefined> {
  //   return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.id === id).first();
  // }
  static async getProductById(id: string): Promise<LocalProduct | undefined> {
    const db = await this.getDB();
    return db.products.get(id);
  }

  // static async getProductByBrandName(brand_name: string, sessionId: string): Promise<LocalProduct | undefined> {
  //   return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.brand_name === brand_name).first();
  // }
  static async getProductByBrandName(brand_name: string): Promise<LocalProduct | undefined> {
    const db = await this.getDB();
    return db.products.where({ brand_name }).first();
  }

  // static async getProductByCode(product_code: string, sessionId: string): Promise<LocalProduct[] | undefined> {

  //   return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.product_code === product_code).toArray();
  // }
  static async getProductByCode(product_code: string): Promise<LocalProduct[] | undefined> {
    const db = await this.getDB();
    return db.products.where({ product_code }).toArray();
  }

  // static async getProductByBrandID(brandId: string, sessionId: string): Promise<LocalProduct | undefined> {

  //   return db.products.where("sessionId").equals(String(sessionId)).and((product) => product.brand_id === brandId).first();
  // }
  static async getProductByBrandID(brandId: string): Promise<LocalProduct | undefined> {
    const db = await this.getDB();
    return db.products.where({ brandId }).first();
  }

  static async updateProductQuantity(ean: string, quantityChange: number): Promise<void> {
    const db = await this.getDB();

    await db.transaction('rw', db.products, async () => {
      // const product = await db.products.where("sessionId").equals(String(sessionId)).and((product) => product.ean === ean).first();
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
  static async createTransaction(transaction: Omit<LocalTransaction, "id" | "createdAt" | "synced" | "sessionId">, sessionId: string): Promise<string> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const syncId = `${Math.floor(Date.now() / 1000)}_CREATE`;

    if (!sessionId) {
      toast.error("Please login again, no SessionID found");
      redirect('/login');
      return "";
    }

    try {
      console.log(transaction);
      await this.updateCustomerCreditNote(transaction?.customer);
      await this.updateCustomerLoyaltyPoints(transaction?.customer);

      await db.transaction('rw', [db.transactions, db.products], async () => {
        for (const item of transaction.items) {
          console.log('Updating product:', item);
          await this.updateProductQuantity(item.ean!, item.quantity);
        }
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

      const formattedTransaction = {
        id: id,
        syncId: syncId,
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
      };

      const failedTransaction = {
        ...formattedTransaction,
        transaction_data: JSON.stringify({
          ...formattedTransaction,
          created_at: new Date().toISOString(),
          sync_session_id: syncId
        }),
        sessionId: sessionId,
        error_message: error instanceof Error ? error.message : String(error),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await LocalApiMethods.createFailedTrx(sessionId, [failedTransaction]);
      throw error;
    }
  }

  static async checkIfCustomerExists(customerInfo: Partial<LocalCustomer>): Promise<boolean> {
    const db = await this.getDB();
    const customerByEmail = await db.customers.where("email").equals(String(customerInfo.email)).first();
    const customerByPhone = await db.customers.where("phoneno").equals(String(customerInfo.phoneno)).first();

    return customerByEmail !== undefined || customerByPhone !== undefined;
  }

  static async createNewCustomerInfo(customerInfo: Partial<LocalCustomer>): Promise<void> {
    const db = await this.getDB();

    await db.transaction('rw', db.customers, async () => {
      const customerExists = await this.checkIfCustomerExists(customerInfo);
      if (customerExists) {
        throw new Error("Customer with provided phone number or email already exists.");
      }

      await db.customers.add({
        phoneno: String(customerInfo.phoneno),
        credit_note_balance: 0,
        firstname: String(customerInfo.firstname) || "N/A",
        lastname: String(customerInfo.lastname) || "N/A",
        id: customerInfo.id || Date.now(),
        email: customerInfo.email?.toLowerCase() || `${customerInfo.firstname?.toLowerCase()}${customerInfo.lastname?.toLowerCase()}@prlerp.com`,
        age: null,
        gender: "",
        country: "",
        state: "",
        city: "",
        address: "",
        loyalty_points: 0
      });
    });
  }

  static async deleteAllTransactions(sessionId: string): Promise<void> {
    const db = await this.getDB();
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.where('sessionId').equals(String(sessionId)).delete();
    });
  }

  static async getUnsynedTransactions(sessionId: string): Promise<LocalTransaction[]> {
    const db = await this.getDB();

    return await db.transactions.where('sessionId').equals(String(sessionId)).and((transaction) => transaction.synced === 'false').toArray();
  }

  static async markTransactionSynced(id: string, sessionId: string): Promise<void> {
    const db = await this.getDB();

    await db.transactions.update(id, { synced: 'true', sessionId });
  }

  // static async getCustomers(sessionId: string): Promise<LocalCustomer[]> {

  //   return await db.customers.where("sessionId").equals(String(sessionId)).toArray();
  // }
  static async getCustomers(): Promise<LocalCustomer[]> {
    const db = await this.getDB();
    return await db.customers.toArray();
  }

  static async updateOrCreateCustomer(customerInfo: LocalCustomer, points: number, type: "credit_note_balance" | "loyalty_points"): Promise<void> {
    // const sessionId = sessionStorage.getItem('sessionId');
    const db = await this.getDB();
    await db.transaction('rw', db.customers, async () => {
      // let customer = await db.customers.where("sessionId").equals(String(sessionId)).and((cust) => cust.phoneno === customerInfo.phoneno).first();
      let customer = await db.customers.where("phoneno").equals(customerInfo.phoneno).first();
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
    const db = await this.getDB();

    return await db.transactions.where("sessionId").equals(String(sessionId)).toArray();
  }

  static async clearSessionData(sessionId: string) {
    const db = await this.getDB();

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
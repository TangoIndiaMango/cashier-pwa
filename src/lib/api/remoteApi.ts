// src/lib/api/remoteApi.ts
import { Transaction } from '@/types/type';
import axios from 'axios';
import { LocalCustomer, LocalDiscount, LocalPaymentMethod, LocalProduct } from '../db/schema';

// type AnyData = any


const api = axios.create({
  baseURL: 'https://peresiana-ecomm-backend.nigeriasbsc.com/public/api/v3',
  headers: {
    'Content-Type': 'application/json'
  }
});

export class RemoteApi {
  static async fetchStoreProducts(): Promise<LocalProduct[]> {
    const response = await api.post('/products/all');
    // console.log(response?.data?.data);
    return response.data?.data.map((item) => ({
      id: item.id,
      product_name: item.product_name,
      retail_price: parseFloat(item.retail_price),
      available_quantity: item.available_quantity,
      product_code: item.product_code,
      brand_name: item.brand_name,
      brand_id: item.brand_id,
      ean: item.ean,
      size: item.size,
      color: item.color
    }));
  }

  static async fetchCustomer(): Promise<LocalCustomer[]> {
    const response = await api.post('/customers/all');
    // console.log(response?.data?.data);
    return response.data?.data.map((item) => ({
      age: item.age,
      credit_note_balance: item.credit_note_balance,
      email: item.email,
      firstname: item.firstname,
      id: item.id,
      lastname: item.lastname,
      loyalty_points: item.loyalty_points,
      phoneno: item.phoneno
    }));
  }
  static async fetchPaymentMethod(): Promise<LocalPaymentMethod[]> {
    const response = await api.get('/mop_customers/all');
    // console.log(response?.data?.data);
    return response.data?.data.map((item) => ({
      id: item.id,
      account_id: item.account_id,
      createdAt: item.createdAt,
      mopID: item.mopID,
      name: item.name,
      slug: item.slug,
      is_active: item.is_active
    }));
  }

  static async fetchDiscounts(): Promise<LocalDiscount> {
    const response = await api.get('/discounts/all');
    // console.log(response?.data?.data);
    return response.data?.data.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      name: item.name,
      discount_type: item.discount_type,
      value: item.value,
      code: item.code,
      value_type: item.value_type,
      status: item.status,
      start_date: item.start_date,
      end_date: item.end_date,
      is_active: item.is_active,
      percentage: item.percentage,
      price: item.price,
      product_id: item.product_id,
      redemption: item.redemption,
      redemption_value: item.redemption_value
    }));
  }

  static async syncTransactions(transactions: Transaction[]): Promise<void> {
    // const mappedTransactions = transactions.map((transaction) => {
    //   return {
    //     firstname: transaction.firstname,
    //     lastname: transaction.lastname,
    //     email: transaction.email,
    //     phoneno: transaction.phoneno,
    //     gender: transaction.gender,
    //     age: transaction.age,
    //     products: transaction.products,
    //     status: transaction.status,
    //     receipt_no: transaction.receipt_no,
    //     apply_loyalty_point: transaction.apply_loyalty_point,
    //     apply_credit_note_point: transaction.apply_credit_note_point,
    //     payable_amount: transaction.payable_amount,
    //     exact_total_amount: transaction.exact_total_amount,
    //     payment_type: transaction.payment_type,
    //     payment_status: transaction.payment_status,
    //     total_price: transaction.total_price,
    //     payment_methods: transaction.payment_methods,
    //   };
    // });

    try {
      await api.post('/sync/transactions', { transactions });
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

}
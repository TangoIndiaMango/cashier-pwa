// src/lib/api/remoteApi.ts
import { Transaction } from '@/types/type';
import axios from 'axios';
import { LocalCustomer, LocalDiscount, LocalPaymentMethod, LocalProduct } from '../db/schema';
import toast from 'react-hot-toast';

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

  static async fetchDiscounts(): Promise<LocalDiscount[]> {
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
      redemption_value: item.redemption_value,
      type: item.type,
    }));
  }

  static async syncTransactions(transactions: Transaction[], syncId: string): Promise<any> {
    try {
      const response = await api.post('/transactions/sync', {
        sync_session_id: syncId,
        transactions
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed:' + error)
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<any> {
    const response = await axios.post('https://www.peresiana-ecomm-backend.nigeriasbsc.com/public/api/v1/auth/login', { email, password });
    return response.data;
  }

  static async fetchFailedTransactions(page?: string | number): Promise<any> {
    const pageNumber = page ? page : 1;
    const response = await api.get(`transactions/un-sync?page=${pageNumber}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      data: response.data.data.data,
      current_page: response.data.current_page,
      per_page: response.data.per_page,
      total: response.data.total
    };
  }

  static async downloadFailedTransactions(params: any): Promise<any> {
    const response = await api.get('transactions/un-sync', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      params
    },);
    return response.data;
  }


  static async fetchPos(storeId: string | number): Promise<any> {
    const response = await api.get(`mop_terminals/${storeId}`);
    // console.log(response?.data?.data);
    return response.data.data;
  }

}
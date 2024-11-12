// src/lib/api/remoteApi.ts
import axios from 'axios';
import { LocalProduct, LocalTransaction } from '../db/schema';

type AnyData = any


const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export class RemoteApi {
  static async fetchStoreProducts(storeId: string, lastSyncTimestamp: string): Promise<LocalProduct[]> {
    const { data } = await api.post('/sync/store-products', {
      storeId,
      lastSyncTimestamp
    });

    return data.updates.map((item: AnyData) => ({
      id: item.product.id,
      name: item.product.name,
      price: Number(item.price),
      currentQuantity: item.currentQuantity,
      sku: item.product.sku,
      barcode: item.product.barcode,
      category: item.product.category,
      version: item.version,
      lastSyncAt: new Date(item.lastSyncAt),
      isModified: false
    }));
  }

  static async syncTransactions(storeId: string, transactions: LocalTransaction[]): Promise<void> {
    await api.post('/sync/transactions', {
      storeId,
      transactions: transactions.map(tx => ({
        totalAmount: tx.totalAmount,
        paymentMethod: tx.paymentMethod,
        items: tx.items
      }))
    });
  }
}
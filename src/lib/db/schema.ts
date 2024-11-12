// src/lib/db/schema.ts
import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  price: number;
  currentQuantity: number;
  sku: string;
  barcode?: string;
  category: string;
  version: number;
  lastSyncAt: Date;
  isModified: boolean;
}

export interface LocalTransaction {
  id: string;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  customerInfo?: string;
  createdAt: Date;
  synced: 'true' | 'false';
  items: LocalTransactionItem[];
}

export interface LocalTransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class StoreDatabase extends Dexie {
  products!: Table<LocalProduct>;
  transactions!: Table<LocalTransaction>;

  constructor() {
    super('StoreDB');

    this.version(1).stores({
      products: 'id, sku, barcode, category, isModified, lastSyncAt',
      transactions: 'id, createdAt, synced'
    });
  }
}

export const db = new StoreDatabase();
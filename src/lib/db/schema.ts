
import { PaymentEntry } from '@/hooks/usePayment';
import Dexie, { Table } from 'dexie';

export interface LocalProduct {
  id: string;
  product_name: string;
  retail_price: number;
  available_quantity: number;
  product_code: string;
  brand_name: string;
  brand_id: string;
  ean: string;
  size: string;
  color: string;
  lastSyncAt: Date;
  isModified: boolean;
}

export interface LocalTransaction {
  id?: string;
  createdAt?: Date;
  totalAmount: number;
  paymentMethods: PaymentEntry[];
  status: string,
  synced?: 'true' | 'false';
  customer: LocalCustomer;
  items: LocalTransactionItem[];
}

export interface LocalTransactionItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  color: string;
  size:string;
}

export interface LocalCustomer {
  age: number | null;
  credit_note_balance: number | null;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  loyalty_points: string;
  phoneno: string;
  gender:string;
}


export class StoreDatabase extends Dexie {
  products!: Table<LocalProduct>;
  transactions!: Table<LocalTransaction>;
  customers!: Table<LocalCustomer>;

  constructor() {
    super('StoreDB');

    this.version(1).stores({
      products: 'id, product_name, product_code, brand_name, brand_id, size, lastSyncAt',
      transactions: 'id, createdAt, synced',
      customers: 'id, firstname, lastname, email, phoneno',
    });
  }
}

export const db = new StoreDatabase();
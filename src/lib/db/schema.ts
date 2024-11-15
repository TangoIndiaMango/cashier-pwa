
import { PaymentEntry } from '@/hooks/usePayment';
import Dexie, { Table } from 'dexie';

export interface LocalPaymentMethod {
  id: string;
  account_id: number;
  createdAt: Date;
  mopID: string;
  name: string;
  slug: string;
  is_active: number;
}
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
  ean: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  color: string;
  size: string;
}

export interface LocalDiscount {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  discount_type: string;
  value: number;
  code: string;
  value_type: number;
  status: number;
  start_date: Date;
  end_date: Date;
  is_active: number;
  percentage: number;
  price: number;
  product_id: string;
  redemption: number;
  redemption_value: number;
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
  gender: string;
}


export class StoreDatabase extends Dexie {
  products!: Table<LocalProduct>;
  transactions!: Table<LocalTransaction>;
  customers!: Table<LocalCustomer>;
  paymentMethods!: Table<LocalPaymentMethod>;
  discounts!: Table<LocalDiscount>;


  constructor() {
    super('StoreDB');

    this.version(1).stores({
      products: 'id, product_name, product_code,ean, brand_name, brand_id, size, lastSyncAt',
      transactions: 'id, createdAt, synced',
      customers: 'id, firstname, lastname, email, phoneno',
      paymentMethods: 'id, account_id, createdAt, mopID, name, slug, is_active',
      discounts: 'id, createdAt, name, discount_type, value, code, value_type, status, start_date, end_date, is_active, percentage, price'
    });
  }
}

export const db = new StoreDatabase();
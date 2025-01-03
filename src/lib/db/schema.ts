import { PaymentEntry } from "@/hooks/usePayment";
import { TransactionSync } from "@/types/trxType";
import Dexie, { Table } from "dexie";

export interface LocalBranch {
  id: number;
  name: string;
  description: string;
  mopID: string;
  slug: string;
  location: string;
  is_active: number;
  is_default: number;
  staff_id: number;
  account_id: number;
  mode_of_payment_id: number;
  terminalID: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  id: string;
  createdAt?: Date;
  recieptNo?: string;
  totalAmount: number;
  originalTotal:number;
  paymentMethods: PaymentEntry[];
  payableAmount: number;
  status: string;
  synced?: "true" | "false";
  customer: LocalCustomer;
  loyaltyPoints: string;
  creditNotePoints: string;
  items: LocalTransactionItem[];
  discount: LocalDiscount;
}

export interface LocalTransactionItem extends Partial<LocalProduct> {
  quantity: number;
  totalPrice: number;
  discount?: LocalDiscount;
}

export interface LocalDiscount {
  type: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  discount_type: string;
  value: number;
  code: string;
  value_type: string;
  status: string;
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
  loyalty_points: number;
  phoneno: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  address: string;
}

export class StoreDatabase extends Dexie {
  products!: Table<LocalProduct>;
  transactions!: Table<LocalTransaction>;
  customers!: Table<LocalCustomer>;
  paymentMethods!: Table<LocalPaymentMethod>;
  discounts!: Table<LocalDiscount>;
  // orderedProduct!: Table<LocalTransactionItem>;
  failedSyncTransactions!: Table<TransactionSync>;
  branches!: Table<LocalBranch>;

  constructor() {
    super("StoreDB");

    this.version(1).stores({
      products:
        "id, product_name, product_code,ean, brand_name, brand_id, size, lastSyncAt",
      transactions: "id, createdAt, synced",
      customers: "id, firstname, lastname, email, phoneno",
      paymentMethods: "id, account_id, createdAt, mopID, name, slug, is_active",
      discounts:
        "id, createdAt, name, discount_type, value, code, value_type, status, start_date, end_date, is_active, percentage, price, type",
      failedSyncTransactions: "id, created_at, sync_session_id",
      branches: "id, name,  location, is_active, is_default, staff_id, account_id, mode_of_payment_id, terminalID"
      // orderedProduct:
      //   "id, product_code, product_name, retail_price, quantity, discount, ean, lastSyncAt, isModified",
    });
  }
}

export const db = new StoreDatabase();

db.open()
  .then(() => {
    console.log("Database opened successfully!");
  })
  .catch((error) => {
    console.error("Failed to open database:", error);
  });

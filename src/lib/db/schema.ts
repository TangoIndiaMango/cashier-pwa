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
  sessionId?: string | null;
}

export interface LocalPaymentMethod {
  id: string;
  account_id: number;
  createdAt: Date;
  mopID: string;
  name: string;
  slug: string;
  is_active: number;
  sessionId?: string | null;
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
  sessionId?: string | null;
}

export interface LocalTransaction {
  id: string;
  createdAt?: Date;
  recieptNo?: string;
  totalAmount: number;
  originalTotal: number;
  paymentMethods: PaymentEntry[];
  payableAmount: number;
  status: string;
  synced?: "true" | "false";
  customer: LocalCustomer;
  loyaltyPoints: string;
  creditNotePoints: string;
  items: LocalTransactionItem[];
  discount: LocalDiscount;
  sessionId: string;
}

export interface LocalTransactionItem extends Partial<LocalProduct> {
  quantity: number;
  totalPrice: number;
  discount?: LocalDiscount;
  sessionId?: string | null;
  discountPrice?:string
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
  sessionId?: string | null;
  discountPrice?: string
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
  sessionId?: string | null;
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
  sessionIds!: Table<{ sessionId: string }>;

  sessionId!: string;
  constructor(sessionId: string) {
    super("StoreDB");
    this.sessionId = sessionId;

    this.version(1).stores({
      products:
        "id, product_name, product_code,ean, brand_name, brand_id, size, lastSyncAt, sessionId",
      transactions: "id, createdAt, synced, sessionId",
      customers: "id, firstname, lastname, email, phoneno, sessionId",
      paymentMethods: "id, account_id, createdAt, mopID, name, slug, is_active, sessionId",
      discounts:
        "id, createdAt, name, discount_type, value, code, value_type, status, start_date, end_date, is_active, percentage, price, type, sessionId",
      failedSyncTransactions: "id, created_at, sync_session_id, sessionId",
      branches: "id, name,  location, is_active, is_default, staff_id, account_id, mode_of_payment_id, terminalID, sessionId",
      sessionIds: "sessionId",
      // orderedProduct:
      //   "id, product_code, product_name, retail_price, quantity, discount, ean, lastSyncAt, isModified",
    });
  }


  async openDatabase() {
    await this.open().then(() => {
      console.log("Database opened successfully!");
    }).catch((error) => {
      console.error("Failed to open database:", error);
    });
  }
}

/**
 * 
 * private async loadSessionIdFromDb() {
    const session = await this.sessionIds.get(1); // Assuming you store one sessionId with key '1'
    if (session) {
      this.sessionId = session.sessionId;
    } else {
      console.warn("No sessionId found in the database");
    }
  }
 */


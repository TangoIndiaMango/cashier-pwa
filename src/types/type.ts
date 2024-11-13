export interface PaymentMethod {
    mode_of_payment_id: string;
    amount: string;
    mode_of_payment_pos_id: string;
}

export interface TransactionProduct {
    id: number;
    new_price: string;
    ean: string;
    quantity_ordered: number;
    color: string;
    size: string;
    total: number;
    discount_id: number;
}

export interface Customer {
    firstname: string;
    lastname: string;
    gender: string | null;
    age: number | null;
    phoneno: string | null;
    email: string;
}

export interface Transaction extends Customer {
    country: string | null;
    state: string | null;
    city: string | null;
    address: string | null;
    apply_loyalty_point: boolean;
    apply_credit_note_point: boolean;
    payable_amount: string;
    exact_total_amount: number;
    payment_type: string;
    payment_methods: PaymentMethod[];
    status: string;
    payment_status: string;
    total_price: number;
    receipt_no: string;
    products: TransactionProduct[];
}

export interface SyncTransactionsResponse {
    transactions: Transaction[];
}

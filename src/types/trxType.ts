export interface PaymentMethod {
    mode_of_payment_id: string;
    amount: number;
    mode_of_payment_pos_id: string;
}

export interface Product {
    id: string;
    new_price: number;
    ean: string;
    quantity_ordered: number;
    color: string;
    size: string;
    total: number;
    discount_id: string;
}

export interface Customer {
    firstname: string | null;
    lastname: string | null;
    gender: string | null;
    age: number | null;
    phoneno: string | null;
    email: string | null;
}

export interface TransactionSync {
    id: string;
    country: string | null;
    state: string | null;
    city: string | null;
    address: string | null;
    apply_loyalty_point: boolean;
    apply_credit_note_point: boolean;
    payable_amount: number;
    exact_total_amount: number;
    payment_type: string;
    payment_methods: PaymentMethod[];
    status: string;
    payment_status: string;
    total_price: number;
    receipt_no: string;
    created_at: string;
    loyalty_point_value: number;
    discount_id: string;
    products: Product[];
    firstname: string | null;
    lastname: string | null;
    gender: string | null;
    age: number | null;
    phoneno: string | null;
    email: string | null;
    error_message?:string;
    sync_session_id?:string;
}

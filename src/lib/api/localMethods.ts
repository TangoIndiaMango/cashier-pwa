import { TransactionSync } from "@/types/trxType";
import { db, LocalDiscount, LocalPaymentMethod } from "../db/schema";

export class LocalApiMethods {

    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        return db.paymentMethods.toArray();
    }

    static async getDiscounts(): Promise<LocalDiscount[]> {
        return db.discounts.toArray();
    }

    static async getFailedSyncTrx(): Promise<TransactionSync[]> {
        return db.failedSyncTransactions.toArray();
    }
}
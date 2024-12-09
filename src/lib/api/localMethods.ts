import { TransactionSync } from "@/types/trxType";
import { db, LocalBranch, LocalDiscount, LocalPaymentMethod } from "../db/schema";

export class LocalApiMethods {

    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        return db.paymentMethods.toArray();
    }

    static async getDiscounts(): Promise<LocalDiscount[]> {
        return db.discounts.toArray();
    }

    static async getFailedSyncTrx(): Promise<TransactionSync[]> {
        const transactions = await db.failedSyncTransactions.toArray();
        return [...transactions].reverse();
    }

    static async getBranches(): Promise<LocalBranch[]> {
        return db.branches.toArray();
    }

    static async getPaymentMethodById(id: string): Promise<LocalPaymentMethod | undefined> {
        return db.paymentMethods.where("id").equals(id).first();
    }
}
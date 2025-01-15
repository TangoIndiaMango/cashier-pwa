import { TransactionSync } from "@/types/trxType";
import { LocalBranch, LocalDiscount, LocalPaymentMethod } from "../db/schema";
import { getDbInstance } from "../db/db";

const db = getDbInstance()

export class LocalApiMethods {

    static async getAllPaymentMethods(sessionId: string): Promise<LocalPaymentMethod[]> {
        return db.paymentMethods.where('sessionId').equals(String(sessionId)).toArray();
    }

    static async getDiscounts(sessionId: string): Promise<LocalDiscount[]> {
        return db.discounts.where('sessionId').equals(String(sessionId)).toArray();
    }

    static async getFailedSyncTrx(sessionId: string): Promise<TransactionSync[]> {
        const transactions = await db.failedSyncTransactions.where('sessionId').equals(String(sessionId)).toArray();
        return [...transactions].reverse();
    }

    static async getBranches(sessionId: string): Promise<LocalBranch[]> {
        return db.branches.where('sessionId').equals(String(sessionId)).toArray();
    }

    static async getPaymentMethodById(id: string, sessionId: string): Promise<LocalPaymentMethod | undefined> {
        return db.paymentMethods.where("sesionId").equals(String(sessionId)).and((paymentMethod) => paymentMethod.id === id).first();
    }
}
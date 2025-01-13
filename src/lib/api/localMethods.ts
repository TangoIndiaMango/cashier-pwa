import { TransactionSync } from "@/types/trxType";
import { LocalBranch, LocalDiscount, LocalPaymentMethod } from "../db/schema";
import { db } from "../utils";

export class LocalApiMethods {

    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        const sessionId = String(db.sessionId)

        return db.paymentMethods.where('sessionId').equals(sessionId).toArray();
    }

    static async getDiscounts(): Promise<LocalDiscount[]> {
        const sessionId = String(db.sessionId)
        return db.discounts.where('sessionId').equals(sessionId).toArray();
    }

    static async getFailedSyncTrx(): Promise<TransactionSync[]> {
        const sessionId = String(db.sessionId)
        const transactions = await db.failedSyncTransactions.where('sessionId').equals(sessionId).toArray();
        return [...transactions].reverse();
    }

    static async getBranches(): Promise<LocalBranch[]> {
        const sessionId = String(db.sessionId)
        return db.branches.where('sessionId').equals(sessionId).toArray();
    }

    static async getPaymentMethodById(id: string): Promise<LocalPaymentMethod | undefined> {
        const sessionId = String(db.sessionId)
        return db.paymentMethods.where("sesionId").equals(sessionId).and((paymentMethod) => paymentMethod.id === id).first();
    }
}
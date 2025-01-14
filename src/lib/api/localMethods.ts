import { TransactionSync } from "@/types/trxType";
import { LocalBranch, LocalDiscount, LocalPaymentMethod } from "../db/schema";
import { LocalApi } from "./localApi";

export class LocalApiMethods extends LocalApi {

    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        await this.initDb();
        const db = this.dbInstance;
        const sessionId = String(this.sessionId)

        return db.paymentMethods.where('sessionId').equals(sessionId).toArray();
    }

    static async getDiscounts(): Promise<LocalDiscount[]> {
        await this.initDb();
        const db = this.dbInstance;
        const sessionId = String(this.sessionId)
        return db.discounts.where('sessionId').equals(sessionId).toArray();
    }

    static async getFailedSyncTrx(): Promise<TransactionSync[]> {
        await this.initDb();
        const db = this.dbInstance;
        const sessionId = String(this.sessionId)
        const transactions = await db.failedSyncTransactions.where('sessionId').equals(sessionId).toArray();
        return [...transactions].reverse();
    }

    static async getBranches(): Promise<LocalBranch[]> {
        await this.initDb();
        const db = this.dbInstance;
        const sessionId = String(this.sessionId)
        return db.branches.where('sessionId').equals(sessionId).toArray();
    }

    static async getPaymentMethodById(id: string): Promise<LocalPaymentMethod | undefined> {
        await this.initDb();
        const db = this.dbInstance;
        const sessionId = String(this.sessionId)
        return db.paymentMethods.where("sesionId").equals(sessionId).and((paymentMethod) => paymentMethod.id === id).first();
    }
}
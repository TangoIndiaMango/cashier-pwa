import { TransactionSync } from "@/types/trxType";
import { LocalBranch, LocalDiscount, LocalPaymentMethod } from "../db/schema";
import { getDbInstance } from "../db/db";

const getDB = async () => await getDbInstance();

export class LocalApiMethods {
    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        const db = await getDB();
        return db.paymentMethods.toArray();
    }

    static async getDiscounts(): Promise<LocalDiscount[]> {
        const db = await getDB();
        return db.discounts.toArray();
    }

    static async createFailedTrx(sessionId: string, transactions: any): Promise<void> {
        const db = await getDB();
        
        await db.transaction("rw", db.failedSyncTransactions, async () => {
            for (const transaction of transactions) {
                await db.failedSyncTransactions.put({ ...transaction, sessionId });
            }
        });
    }

    static async getFailedSyncTrx(sessionId: string): Promise<TransactionSync[]> {
        const db = await getDB();
        const transactions = await db.failedSyncTransactions.where('sessionId').equals(String(sessionId)).toArray();
        return [...transactions].reverse();
    }

    static async getBranches(): Promise<LocalBranch[]> {
        const db = await getDB();
        return db.branches.toArray();
    }

    static async getPaymentMethodById(id: string): Promise<LocalPaymentMethod | undefined> {
        const db = await getDB();
        return db.paymentMethods.where("id").equals(id).first();
    }

    static async updateFailedTrx(sessionId: string, trxId: string, updates: Partial<any>): Promise<void> {
        const db = await getDB();
        
        await db.transaction('rw', db.failedSyncTransactions, async () => {
            const trx = await db.failedSyncTransactions
                .where({
                    id: trxId,
                    sessionId: String(sessionId)
                })
                .first();

            if (!trx) {
                throw new Error('Failed transaction not found or unauthorized');
            }

            await db.failedSyncTransactions
                .where({
                    id: trxId,
                    sessionId: String(sessionId)
                })
                .modify(updates);
        });
    }
}
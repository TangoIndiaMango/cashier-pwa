import { db, LocalPaymentMethod } from "../db/schema";

export class LocalApiMethods {

    static async getAllPaymentMethods(): Promise<LocalPaymentMethod[]> {
        return db.paymentMethods.toArray();
    }

}
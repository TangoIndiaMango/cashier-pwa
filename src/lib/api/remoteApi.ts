// src/lib/api/remoteApi.ts
import { Transaction } from "@/types/type";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LocalCustomer,
  LocalDiscount,
  LocalPaymentMethod,
  LocalProduct,
} from "../db/schema";
import { redirect } from "react-router-dom";
import { getStoreId } from "../utils";
import { LocalApi } from "./localApi";
// https://www.peresiana-ecomm-backend.nigeriasbsc.com/public/api/
// https://prlerp.com/peresianas-BE/public/api/

const baseUrl =
  "https://www.peresiana-ecomm-backend.nigeriasbsc.com/public/api/";

const api = axios.create({
  baseURL: baseUrl + "v3",
  headers: {
    "Content-Type": "application/json",
  },
});

const sessionId = sessionStorage.getItem("sessionId")

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isErrorShown = false

api.interceptors.response.use(
  (response) => {
    isErrorShown = false;
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access. Please log in again.");
      toast.error("Session expired. Please log in again.");
      await LocalApi.clearSessionData(String(sessionId));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      redirect("/login");
    } else {
      console.error("API Error: ", error);
      if (!isErrorShown) {
        toast.error(
          error.response?.data?.message || 
          "An error occurred, please try again."
        );
        isErrorShown = true;
      }
    }
    return Promise.reject(error);
  }
);

export class RemoteApi {
  static async fetchStoreProducts(): Promise<LocalProduct[]> {
    const response = await api.post("/products/all");
    return response.data?.data.map((item) => ({
      id: item.id,
      product_name: item.product_name,
      retail_price: parseFloat(item.retail_price),
      available_quantity: item.available_quantity,
      product_code: item.product_code,
      brand_name: item.brand_name,
      brand_id: item.brand_id,
      ean: item.ean,
      size: item.size,
      color: item.color,
    }));
  }

  static async fetchCustomer(): Promise<LocalCustomer[]> {
    const response = await api.post("/customers/all");
    return response.data?.data.map((item) => ({
      age: item.age,
      credit_note_balance: item.credit_note_balance,
      email: item.email,
      firstname: item.firstname,
      id: item.id,
      lastname: item.lastname,
      loyalty_points: item.loyalty_points,
      phoneno: item.phoneno,
    }));
  }

  static async fetchPaymentMethod(): Promise<LocalPaymentMethod[]> {
    const response = await api.get("/mop_customers/all");
    return response.data?.data.map((item) => ({
      id: item.id,
      account_id: item.account_id,
      createdAt: item.createdAt,
      mopID: item.mopID,
      name: item.name,
      slug: item.slug,
      is_active: item.is_active,
    }));
  }

  static async fetchDiscounts(): Promise<LocalDiscount[]> {
    const response = await api.get("/discounts/all");
    return response.data?.data.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      name: item.name,
      discount_type: item.discount_type,
      value: item.value,
      code: item.code,
      value_type: item.value_type,
      status: item.status,
      start_date: item.start_date,
      end_date: item.end_date,
      is_active: item.is_active,
      percentage: item.percentage,
      price: item.price,
      product_id: item.product_id,
      redemption: item.redemption,
      redemption_value: item.redemption_value,
      type: item.type,
    }));
  }

  static async syncTransactions(
    transactions: Transaction[],
    syncId: string
  ): Promise<any> {
    try {
      const response = await api.post("/transactions/sync", {
        sync_session_id: syncId,
        transactions,
      });
      return response.data;
    } catch (error: any) {
      console.error("Sync failed:", error);
      // toast.error("Sync failed: " + error?.message);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<any> {
    const response = await axios.post(baseUrl + "v1/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  static async fetchFailedTransactions(): Promise<any> {
    const response = await api.get(`transactions/un-sync`);
    return response.data;
  }

  static async downloadFailedTransactions(params: any): Promise<any> {
    const response = await api.get("transactions/un-sync", {
      params,
    });
    return response.data;
  }

  static async fetchPos(): Promise<any> {
    const storeId = getStoreId();
    if (!storeId) {
      toast.error("Store ID not found. Please log in again.");
      redirect("/login");
      return null;
    }
    const response = await api.get(`mop_terminals/${storeId}`);
    // console.log(response.data);
    return response.data.data;
  }

  static async getUserByToken(token: string): Promise<any> {
    const response = await api.get(`user-by-token/${token}`);
    return response.data.data;
  }
  // transactions/receipt-nos
  static async getExistingReceiptNos(): Promise<any> {
    const response = await api.get(`transactions/receipt-nos`);
    return response.data.data;
  }
}


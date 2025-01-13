import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSessionDB } from "./db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//helper function to format to any currency, pass currency as parameter
export function formatCurrency(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(Number(value) || 0).replace("NGN", "₦");
}

export const formatBalance = (balance: number | string) => {
  const bal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
  }).format(Number(balance) || 0);
  return bal.split("NGN")[1];
};

export const generateUniqueIdUsingStoreIDAsPrefix = (storeID: any) => {
  const timestamp = Date.now().toString().slice(-4);
  return `${storeID}/${timestamp}`;
};

export const delay = async (secs = 3) => new Promise((resolve) => setTimeout(resolve, secs * 1000))

export function getStoreId(): string | undefined {
  const userInfo = JSON?.parse(sessionStorage?.getItem("user") || "{}");
  return Array.isArray(userInfo?.store) && userInfo?.store.length > 0
    ? String(userInfo.store[0]?.id)
    : String(userInfo?.store?.store_id);
}

export function getUserInfo() {
  const userInfo = JSON.parse(sessionStorage.getItem("user") || "{}");
  return userInfo
}

export function getStoreInfo() {
  const userInfo = JSON?.parse(sessionStorage?.getItem("user") || "{}");
  return Array.isArray(userInfo?.store) && userInfo?.store.length > 0
    ? userInfo?.store[0]
    : userInfo?.store;
}

export const getSessionID = () => String(sessionStorage.getItem('token'))
export const getSessionId = () => {
  const storeInfo = getStoreInfo()
  const userInfo = getUserInfo()
  const sessionID = getSessionID()
  const storeIdStr = String(storeInfo.store_id || storeInfo.id);
  const firstnameStr = String(userInfo.firstname);
  const phonenoStr = String(userInfo.phoneno);
  const sessionSlice = sessionID.slice(10, 14);
  console.log(storeIdStr, firstnameStr, phonenoStr, sessionSlice)
  const formattedSessionId = storeIdStr + firstnameStr + phonenoStr + sessionSlice;

  return formattedSessionId;
}
export const db = getSessionDB(getSessionId())

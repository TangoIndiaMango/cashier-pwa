import { clsx, type ClassValue } from "clsx";
import toast from "react-hot-toast";
import { redirect } from "react-router-dom";
import { twMerge } from "tailwind-merge";

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

// export const generateUniqueIdUsingStoreIDAsPrefix = (storeID: any) => {
//   const timestamp = Date.now().toString().slice(-4);
//   return `${storeID}/${timestamp}`;
// };

export const generateUniqueIdUsingStoreIDAsPrefix = (storeID: any) => {
  const timestamp = Date.now() % 10000; // 0-9999
  const random = Math.floor(Math.random() * 10); // 0-9
  const counter = (window._idCounter = (window._idCounter || 0) % 100) + 1; // 1-99

  const uniqueNumber = (timestamp * 1000 + random * 100 + counter) % 10000;
  return `${storeID}/${uniqueNumber.toString().padStart(4, '0')}`;
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

export const getSessionID = () => String(sessionStorage.getItem('token'));

export const getSessionId = () => {
  const storeInfo = getStoreInfo();
  const userInfo = getUserInfo();
  const sessionID = getSessionID();
  if (!storeInfo || !userInfo || !sessionID) {
    toast.error("SessionID not found. Please login again");
    redirect("/login");
    return "";
  }
  const storeIdStr = String(storeInfo.store_id || storeInfo.id);
  const firstnameStr = String(userInfo.firstname);
  const phonenoStr = String(userInfo.phoneno);
  const sessionSlice = sessionID.slice(10, 14);
  const uniqueString = String(Math.random().toString(36).slice(3, 9))
  const formattedSessionId = uniqueString + storeIdStr + firstnameStr + phonenoStr + sessionSlice;
  // sessionStorage.setItem('sessionId', formattedSessionId);
  return formattedSessionId;
};

export const getNextRecieptNo = (storeId: any) => {
  // Get the existing receipt number from localStorage
  const existingReceiptNos = localStorage.getItem("existingReceiptNos");
  
  // If we don't have a receipt number yet, start with a base number
  if (!existingReceiptNos) {
    const initialReceiptNo = `1000/1`;
    // Save it for future use
    localStorage.setItem("existingReceiptNos", JSON.stringify(initialReceiptNo));
    return `${storeId}/${initialReceiptNo}`;
  }

  try {
    const lastRecieptNo = JSON.parse(existingReceiptNos);
    const lastRecieptNoArray = lastRecieptNo.split("/");
    
    // If the format is invalid, start fresh but maintain the data we found
    if (lastRecieptNoArray.length < 2) {
      console.warn("Found invalid receipt format:", lastRecieptNo);
      // Use the existing number as left part if possible, or default to 1000
      const leftNo = !isNaN(parseInt(lastRecieptNo)) ? parseInt(lastRecieptNo) : 1000;
      const newReceiptNo = `${leftNo}/1`;
      localStorage.setItem("existingReceiptNos", JSON.stringify(newReceiptNo));
      return `${storeId}/${newReceiptNo}`;
    }

    const leftNo = parseInt(lastRecieptNoArray[0], 10);
    const rightNo = parseInt(lastRecieptNoArray[1], 10);

    // If numbers are invalid, use safe defaults
    if (isNaN(leftNo) || isNaN(rightNo)) {
      const newReceiptNo = "1000/1";
      localStorage.setItem("existingReceiptNos", JSON.stringify(newReceiptNo));
      return `${storeId}/${newReceiptNo}`;
    }

    let nextLeftNo = leftNo;
    let nextRightNo = rightNo + 1;

    if (nextRightNo > 9) {
      nextLeftNo += 1;
      nextRightNo = 1;
    }

    const nextReceiptNo = `${nextLeftNo}/${nextRightNo}`;
    // Save the new receipt number immediately
    localStorage.setItem("existingReceiptNos", JSON.stringify(nextReceiptNo));
    
    return `${storeId}/${nextReceiptNo}`;
  } catch (error) {
    console.warn("Error processing receipt number:", error);
    // If anything goes wrong, create a new receipt number but log it
    const fallbackNo = "1000/1";
    localStorage.setItem("existingReceiptNos", JSON.stringify(fallbackNo));
    return `${storeId}/${fallbackNo}`;
  }
};
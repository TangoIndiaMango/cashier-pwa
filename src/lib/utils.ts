import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//helper function to format to any currency, pass currency as parameter
export function formatCurrency(value: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(Number(value) || 0);
}

export const formatBalance = (balance: number | string) => {
  const bal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
  }).format(Number(balance) || 0);
  return bal.split("NGN")[1];
};

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//helper function to format to any currency, pass currency as parameter
export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value)
}

export const formatBalance = (balance: number) => {
  const bal= new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: 'NGN',
  }).format(balance)
  return bal.split('NGN')[1]
}
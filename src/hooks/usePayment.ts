// hooks/usePayment.ts

import { useState } from 'react';

export interface PaymentEntry {
  mode_of_payment_id: string;
  amount: number;
  mode_of_payment_pos_id?: string
}
export const usePayment = () => {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentEntry[]>([]);

  const handlePaymentSubmit = async (paymentEntries: PaymentEntry[]) => {
    try {
      setPaymentMethod(paymentEntries);
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  };

  return {
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    handlePaymentSubmit,
    setPaymentMethod,
  };
};

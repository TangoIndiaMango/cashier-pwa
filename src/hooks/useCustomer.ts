// hooks/useCustomer.ts
import { useState } from 'react';
import { CustomerDetails } from '@/components/CustomerInfo';
import { LocalCustomer } from '@/lib/db/schema';

export const useCustomer = () => {
  const [customer, setCustomer] = useState<CustomerDetails | LocalCustomer | null>(null);
  // const {newCreditNotePoints, newLoyaltyPoints} = useApplyPoints()
  // console.log(newCreditNotePoints, newLoyaltyPoints)
  const handleAddCustomer = (customerDetails: CustomerDetails) => {
    // if (newLoyaltyPoints > 0) {
    //   customerDetails.loyalty_points = newLoyaltyPoints;
    // }
    // if (newCreditNotePoints > 0) {
    //   customerDetails.credit_note_balance = newCreditNotePoints;
    // }
    setCustomer(customerDetails);
  };

  return {
    customer,
    handleAddCustomer,
    setCustomer,
  };
};

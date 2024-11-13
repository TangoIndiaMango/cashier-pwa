// hooks/useCustomer.ts
import { useState } from 'react';
import { CustomerDetails } from '@/components/CustomerInfo';
import { LocalCustomer } from '@/lib/db/schema';

export const useCustomer = () => {
  const [customer, setCustomer] = useState<CustomerDetails | LocalCustomer | null>(null);

  const handleAddCustomer = (customerDetails: CustomerDetails) => {
    setCustomer(customerDetails);
  };

  return {
    customer,
    handleAddCustomer,
    setCustomer,
  };
};

// hooks/useTransaction.ts
import { useState, useEffect } from 'react';
import { LocalApi } from '@/lib/api/localApi';
import { useStore } from '@/hooks/useStore';
import { LocalTransaction } from '@/lib/db/schema';

export const useTransaction = () => {
  const { createTransaction } = useStore();
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const sessionId = sessionStorage.getItem('sessionId');
  const getAllTransactions = async () => {
    try {
      const transactions = await LocalApi.getAllTransactions(String(sessionId));
      setTransactions(transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const submitTransaction = async (data: Omit<LocalTransaction, 'id' | 'createdAt' | 'synced'>) => {
    try {
      await createTransaction(data);
      await getAllTransactions();
    } catch (err) {
      console.error('Error submitting transaction:', err);
    }
  };

  const deleteTransaction = async () => {
    try {
      await LocalApi.deleteAllTransactions(String(sessionId));
      await getAllTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  useEffect(() => {
    getAllTransactions();
  }, []);

  return { transactions, submitTransaction, deleteTransaction };
};

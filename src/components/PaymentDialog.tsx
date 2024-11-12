// src/components/PaymentDialog.tsx
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentDialogProps {
  total: number;
  onComplete: (paymentMethod: 'CASH' | 'CARD' | 'MOBILE_MONEY') => void;
  onCancel: () => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  total,
  onComplete,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  const handleComplete = () => {
    if (paymentMethod === 'CASH' && cashReceived < total) {
      return; // Show error
    }
    onComplete(paymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between text-xl">
            <span>Total Amount:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="space-y-2">
              <label className="block font-medium">Cash Received</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
              
              {cashReceived >= total && (
                <Alert>
                  <AlertDescription>
                    Change: ${(cashReceived - total).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={paymentMethod === 'CASH' && cashReceived < total}
            >
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

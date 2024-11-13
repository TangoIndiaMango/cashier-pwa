// src/components/Cart.tsx
import React from 'react';
import { LocalTransactionItem } from '../lib/db/schema';
import { formatCurrency } from '@/lib/utils';

interface CartProps {
  items: (LocalTransactionItem & { productName: string })[];
  onUpdateQuantity: (productCode: string, newQuantity: number) => void;
  onRemoveItem: (productCode: string) => void;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="w-full max-w-md p-4 border rounded-lg">
      <h2 className="mb-4 text-xl font-bold">Shopping Cart</h2>
      
      {items.length === 0 ? (
        <p className="text-center text-gray-500">Cart is empty</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.productCode} className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-xs text-gray-600">
                  {formatCurrency(item.unitPrice, 'NGN')} x {item.quantity}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productCode, parseInt(e.target.value))}
                  className="w-16 p-1 border rounded"
                />
                <button
                  onClick={() => onRemoveItem(item.productCode)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total, 'NGN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
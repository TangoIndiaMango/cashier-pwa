// src/components/Cart.tsx
import React from 'react';
import { LocalTransactionItem } from '../lib/db/schema';

interface CartProps {
  items: (LocalTransactionItem & { productName: string })[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="w-full max-w-md border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-500 text-center">Cart is empty</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.productId} className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
                <p className="text-sm text-gray-600">
                  ${item.unitPrice.toFixed(2)} x {item.quantity}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value))}
                  className="w-16 p-1 border rounded"
                />
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
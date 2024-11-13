
import { useState } from 'react';
import { LocalTransactionItem, LocalProduct } from '@/lib/db/schema';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<LocalTransactionItem[]>([]);
  const [total, setTotal] = useState(0);

  const addProductToCart = (product: LocalProduct) => {
    const existingItem = cartItems.find((item) => item.productCode === product.product_code);
    
    if (existingItem) {
      if (existingItem.quantity >= product.available_quantity) {
        alert('Not enough stock available');
        return;
      }
      updateQuantity(existingItem.productCode, existingItem.quantity + 1);
    } else {
      if (product.available_quantity === 0) {
        alert('Product out of stock');
        return;
      }
      setCartItems((prevItems) => [
        ...prevItems,
        {
          productId: product.id,
          productCode: product.product_code,
          productName: product.product_name,
          quantity: 1,
          unitPrice: product.retail_price,
          totalPrice: product.retail_price,
        },
      ]);
    }

    setTotal((prevTotal) => prevTotal + product.retail_price);
  };

  const updateQuantity = (productCode: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.productCode === productCode) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const removeItemFromCart = (productCode: string) => {
    setCartItems((items) => items.filter((item) => item.productCode !== productCode));
  };

  return {
    cartItems,
    setCartItems,
    total,
    addProductToCart,
    updateQuantity,
    setTotal,
    removeItemFromCart,
  };
};

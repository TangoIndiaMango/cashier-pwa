
import { LocalTransactionItem } from '@/lib/db/schema';
import { useState } from 'react';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<LocalTransactionItem[]>([]);
  const [total, setTotal] = useState(0);

  const addProductToCart = (product: Partial<LocalTransactionItem>) => {
    const existingItem = cartItems.find((item) => item.product_code === product.product_code);
    // console.log(existingItem)
    if (existingItem) {
      if (existingItem.quantity >= Number(product.available_quantity)) {
        alert('Not enough stock available');
        return;
      }
      updateQuantity(existingItem.product_code as string, existingItem.quantity + 1);
    } else {
      if (product.available_quantity === 0) {
        alert('Product out of stock');
        return;
      }
      setCartItems((prevItems) => [
        ...prevItems,
        {
          id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          retail_price: product.retail_price,
          totalPrice: product.retail_price,
          color: product.color,
          size: product.size,
          ean: product.ean,
          available_quantity: product.available_quantity,
        },
      ]  as any);
    }

    setTotal((prevTotal) => prevTotal + Number(product.retail_price));
  };

  const updateQuantity = (product_code: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.product_code === product_code) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: Number(item.retail_price) * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const removeItemFromCart = (product_code: string) => {
    setCartItems((items) => items.filter((item) => item.product_code !== product_code));
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

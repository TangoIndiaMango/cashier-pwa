import { LocalTransactionItem } from "@/lib/db/schema";
import { useState } from "react";

export type ICartItem = LocalTransactionItem & { itemTotal?: number };

export type ISetCartItems = (items: ICartItem[]) => ICartItem[] | ICartItem[];

export const useCart = () => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [total, setTotal] = useState(0);

  const addProductToCart = (product: Partial<LocalTransactionItem>) => {
    if (product.available_quantity === 0) {
      alert("Product out of stock");
      return;
    }
    setCartItems(
      (prevItems) =>
        [
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
            discount: product.discount,
          },
        ] as any
    );
    setTotal((prevTotal) => prevTotal + Number(product.retail_price));
  };
  const removeItemFromCart = (product_code: string) => {
    setCartItems((items) =>
      items.filter((item) => item.product_code !== product_code)
    );
  };

  return {
    cartItems,
    setCartItems,
    total,
    addProductToCart,
    // updateQuantity,
    setTotal,
    removeItemFromCart,
  };
};

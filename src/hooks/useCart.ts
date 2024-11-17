import { LocalTransactionItem } from "@/lib/db/schema";
import { useEffect, useState } from "react";
import { useStore } from "./useStore";

export type ICartItem = LocalTransactionItem & { itemTotal?: number };

export type ISetCartItems = (items: ICartItem[]) => ICartItem[] | ICartItem[];

export const useCart = () => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [total, setTotal] = useState(0);
  const { discounts } = useStore();

  useEffect(() => {
    setTotal(
      cartItems.reduce(
        (sum, item: ICartItem) =>
          sum + (item.itemTotal || item.retail_price || 0),
        0
      )
    );
  }, [cartItems]);

  const calcDiscountPriveValue = (product: LocalTransactionItem) => {
    if (!product.discount) return product.retail_price;

    const valueType = product.discount.value_type;

    const value = product.discount.value;

    if (valueType === "percentage") {
      console.log(
        product.retail_price! - (product.retail_price! * value) / 100
      );
      return product.retail_price! - (product.retail_price! * value) / 100;
    } else if (valueType === "naira") {
      console.log(product.retail_price! - value);
      return product.retail_price! - value;
    } else {
      return product.retail_price!;
    }
  };

  const addProductToCart = (product: Partial<LocalTransactionItem>) => {
    if (product.available_quantity === 0) {
      alert("Product out of stock");
      return;
    }

    const retailPrice = calcDiscountPriveValue(product);

    setCartItems((prevItems) => {
      return [
        ...prevItems,
        {
          id: product.id,
          product_code: product.product_code,
          product_name: product.product_name,
          retail_price: retailPrice,
          totalPrice: retailPrice,
          color: product.color,
          size: product.size,
          ean: product.ean,
          available_quantity: product.available_quantity,
          discount: product.discount,
        },
      ] as any;
    });
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
    setTotal,
    removeItemFromCart,
  };
};

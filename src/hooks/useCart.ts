import { LocalTransactionItem } from "@/lib/db/schema";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "./useStore";
import { create } from "zustand";

export type ICartItem = LocalTransactionItem & { discountPrice?: number; id };

export type ISetCartItems = (items: ICartItem[]) => ICartItem[] | ICartItem[];

type State = {
  cartItems: ICartItem[];
};

interface Actions {
  calcDiscountPriveValue: (product: LocalTransactionItem) => number;
  addItemToCart: (product: Partial<LocalTransactionItem>) => void;
  removeItemFromCart: (productCode: string) => void;
  updateCartItem: (product: Partial<LocalTransactionItem>) => void;
  clearCart: () => void;
}

export const useZudCart = create<State & Actions>((set) => ({
  cartItems: [],
  calcDiscountPriveValue(product: LocalTransactionItem) {
    const price = Number(product.retail_price) || 0;

    if (!product.discount) return price;

    const valueType = product.discount.value_type;

    const value = Number(product.discount.value) || 0;

    if (valueType === "percentage") {
      console.log(price! - (price! * value) / 100);
      return price - (value / 100) * price;
    } else if (valueType === "naira") {
      console.log(price! - value);
      return price! - value;
    } else {
      return price!;
    }
  },
  addItemToCart(product: Partial<LocalTransactionItem>) {
    if (product.available_quantity === 0) {
      alert("Product out of stock");
      return;
    }

    set((values) => {
      const exisitingItem = values.cartItems.find(
        (item) => item.product_code === product.product_code
      );

      if (exisitingItem) {
        alert("Product already exist increase quantity");
        return values;
      }

      return {
        ...values,
        cartItems: values.cartItems.concat({
          id: product.id,
          quantity: 1,
          product_code: product.product_code,
          product_name: product.product_name,
          retail_price: product.retail_price,
          discountPrice: values.calcDiscountPriveValue(
            product as LocalTransactionItem
          ),
          color: product.color,
          size: product.size,
          ean: product.ean,
          available_quantity: product.available_quantity,
          discount: product.discount,
        } as any),
      };
    });
  },
  removeItemFromCart(productCode: string) {
    set((values) => ({
      ...values,
      cartItems: values.cartItems.filter(
        (item) => item.product_code !== productCode
      ),
    }));
  },
  updateCartItem(product: Partial<LocalTransactionItem>) {
    set((values) => ({
      ...values,
      cartItems: values.cartItems.map((item) =>
        item.id === product.id
          ? {
              ...item,
              ...product,
              discountPrice: product.discount
                ? values.calcDiscountPriveValue(product as LocalTransactionItem)
                : item.discountPrice,
            }
          : item
      ),
    }));
  },
  clearCart() {
    set({ cartItems: [] });
  },
}));

export const useCart = () => {
  const cartZudApi = useZudCart((state) => state);
  const { discounts } = useStore();
  const [total, setTotal] = useState(0);
  const [cartDiscountCode, setCartDiscountCode] = useState("");

  const handleCartTotalDiscount = useCallback(
    (strict = true) => {
      let discount;

      if (strict) {
        if (!cartDiscountCode) {
          return;
        }

        discount = discounts.find(
          (discountObj) => discountObj.code === cartDiscountCode
        );
      }

      setTotal(
        cartZudApi.cartItems.reduce(
          (sum, item: ICartItem) =>
            sum +
            cartZudApi.calcDiscountPriveValue({
              ...item,
              discount: discount || item.discount,
            }) *
              (item.quantity || 1),
          0
        )
      );
    },
    [cartZudApi.cartItems, cartDiscountCode]
  );

  useEffect(() => {
    handleCartTotalDiscount(false);
  }, [handleCartTotalDiscount]);

  return {
    ...cartZudApi,
    total,
    setTotal,
    cartDiscountCode,
    setCartDiscountCode,
    handleCartTotalDiscount,
  };
};

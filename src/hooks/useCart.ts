import { LocalDiscount, LocalTransactionItem } from "@/lib/db/schema";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "./useStore";
import { create } from "zustand";

export type ICartItem = LocalTransactionItem & { discountPrice?: number; id };

export type ISetCartItems = (items: ICartItem[]) => ICartItem[] | ICartItem[];

type State = {
  cartItems: ICartItem[];
};

interface Actions {
  calcDiscountPriveValue: (product: ICartItem, priceKey?: string) => number;
  addItemToCart: (product: Partial<LocalTransactionItem>) => void;
  removeItemFromCart: (productCode: string) => void;
  updateCartItem: (product: Partial<LocalTransactionItem>) => void;
  clearCart: () => void;
}

type ICartRecords = {
  total: number;
  prevTotal: number;
  discount: LocalDiscount | null;
};

export const useZudCart = create<State & Actions>((set) => ({
  cartItems: [],
  calcDiscountPriveValue(product: ICartItem, priceKey = "retail_price") {
    const price = Number(product[priceKey]) || 0;

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
          discountPrice: values.calcDiscountPriveValue(product as ICartItem),
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
                ? values.calcDiscountPriveValue(product as ICartItem)
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

const defaultCartRecords = {
  total: 0,
  prevTotal: 0,
  discount: null,
};

export const useCart = () => {
  const cartZudApi = useZudCart((state) => state);
  const { discounts } = useStore();
  const [cartDiscountCode, setCartDiscountCode] = useState("");
  const [cartRecords, setCartRecords] =
    useState<ICartRecords>(defaultCartRecords);

  const stateRef = useRef({ discountCode: "" });

  const handleCartTotalDiscount = useCallback(
    (
      cartDiscountCode: string = stateRef.current.discountCode,
      forceUpdate: boolean = false
    ) => {
      let discount: LocalDiscount | null;

      if (cartDiscountCode) {
        discount = discounts.find(
          (discountObj) => discountObj.code === cartDiscountCode
        ) as LocalDiscount | null;

        if (!discount) {
          return alert("Invalid code");
        }
      }

      setCartRecords((values) => ({
        ...values,
        discount,
        prevTotal:
          !forceUpdate &&
          cartDiscountCode &&
          cartDiscountCode === values.discount?.code
            ? values.prevTotal
            : values.total,
        total:
          !forceUpdate &&
          cartDiscountCode &&
          cartDiscountCode === values.discount?.code
            ? values.total
            : cartZudApi.cartItems.reduce(
                (sum, item: ICartItem) =>
                  sum +
                  cartZudApi.calcDiscountPriveValue(
                    {
                      ...item,
                      discount: discount || item.discount,
                    },
                    cartDiscountCode ? "discountPrice" : "retail_price"
                  ) *
                    (item.quantity || 1),
                0
              ),
      }));
    },
    [cartZudApi.cartItems]
  );

  useEffect(() => {
    handleCartTotalDiscount(stateRef.current.discountCode, true);
  }, [handleCartTotalDiscount]);

  return {
    ...cartZudApi,
    clearCart() {
      setCartRecords(defaultCartRecords);
      cartZudApi.clearCart();
    },
    setCartRecords,
    cartDiscountCode,
    setCartDiscountCode(code: string) {
      stateRef.current.discountCode = code;
      setCartDiscountCode(code);
    },
    handleCartTotalDiscount,
    cartRecords,
  };
};
// 4064533026926

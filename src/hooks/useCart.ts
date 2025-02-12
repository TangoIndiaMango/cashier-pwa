import { LocalDiscount, LocalTransactionItem } from "@/lib/db/schema";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "./useStore";
import { create } from "zustand";
import toast from "react-hot-toast";

interface ICartItem extends LocalTransactionItem {
  discountPrice?: number | string;
  quantity: number;
  totalPrice: number;
  discount?: LocalDiscount;
  isModified?: boolean;
}

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
  actualTotal: number,
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
      return price - (value / 100) * price;
    } else if (valueType === "naira") {
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
        (item) => item.ean === product.ean
      );

      if (exisitingItem) {
        // check the available quantity if it is not 0
        if (exisitingItem.available_quantity === 0) {
          toast.error("Product out of stock");
          return values;
        }
        toast.error("Product already in cart. Increase quantity if needed");
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
  removeItemFromCart(ean: string) {
    set((values) => ({
      ...values,
      cartItems: values.cartItems.filter(
        (item) => item.ean !== ean
      ),
    }));
  },
  updateCartItem(product: Partial<LocalTransactionItem>) {
    console.log(product)
    set((values) => ({
      ...values,
      cartItems: values.cartItems.map((item) =>
        item.ean === product.ean
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
  actualTotal: 0,
  total: 0,
  prevTotal: 0,
  discount: null,
};

export const useCart = () => {
  const cartZudApi = useZudCart((state) => state);
  const { discounts } = useStore();
  const [cartDiscountCode, setCartDiscountCode] = useState("");
  const [cartRecords, setCartRecords] = useState<ICartRecords>(defaultCartRecords);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);

  // Keep track of both the current discount code and the applied discount
  const stateRef = useRef({ 
    discountCode: "",
    appliedDiscount: null as LocalDiscount | null 
  });

  const handleCartTotalDiscount = useCallback(
    (
      cartDiscountCode: string = stateRef.current.discountCode,
      forceUpdate: boolean = false
    ) => {
      let discount: LocalDiscount | null = null;

      if (cartDiscountCode) {
        // First check if we already have this discount applied
        if (cartDiscountCode === appliedDiscountCode && !forceUpdate) {
          toast.error("This discount code is already applied");
          return;
        }

        // Look for the discount in our discounts array
        discount = discounts.find(
          (discountObj) => discountObj.code === cartDiscountCode
        ) || null;

        // If we can't find the discount and it's not already applied
        if (!discount && cartDiscountCode !== appliedDiscountCode) {
          toast.error("Invalid discount code");
          return;
        }

        // If this is a forced update and we have an applied code, use the stored discount
        if (forceUpdate && cartDiscountCode === appliedDiscountCode) {
          discount = stateRef.current.appliedDiscount;
        }

        // Store both the code and the discount object
        if (discount) {
          setAppliedDiscountCode(cartDiscountCode);
          stateRef.current.appliedDiscount = discount;
        }
      }

      const currentTotal = cartZudApi.cartItems.reduce(
        (sum, item: ICartItem) =>
          sum + Number(item.retail_price) * (item.quantity || 1),
        0
      );

      setCartRecords((values) => {
        const newTotal = cartZudApi.cartItems.reduce(
          (sum, item: ICartItem) =>
            sum +
            cartZudApi.calcDiscountPriveValue(
              {
                ...item,
                discount: discount || item.discount,
              },
              "retail_price"
            ) *
            (item.quantity || 1),
          0
        );

        return {
          ...values,
          discount,
          actualTotal: currentTotal,
          prevTotal: discount ? currentTotal : 0,
          total: newTotal,
        };
      });
    },
    [cartZudApi.cartItems, discounts, appliedDiscountCode]
  );

  // Clear applied discount code when cart is cleared
  const clearCart = useCallback(() => {
    setCartRecords(defaultCartRecords);
    setAppliedDiscountCode(null);
    stateRef.current = { discountCode: "", appliedDiscount: null };
    cartZudApi.clearCart();
  }, [cartZudApi]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && appliedDiscountCode) {
        handleCartTotalDiscount(appliedDiscountCode, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleCartTotalDiscount, appliedDiscountCode]);

  // Update calculations when cart changes
  useEffect(() => {
    if (appliedDiscountCode) {
      handleCartTotalDiscount(appliedDiscountCode, true);
    } else {
      handleCartTotalDiscount(stateRef.current.discountCode, true);
    }
  }, [handleCartTotalDiscount]);

  return {
    ...cartZudApi,
    clearCart,
    setCartRecords,
    cartDiscountCode,
    setCartDiscountCode(code: string) {
      stateRef.current.discountCode = code;
      setCartDiscountCode(code);
    },
    handleCartTotalDiscount,
    cartRecords,
    appliedDiscountCode,
  };
};
// 4064533026926

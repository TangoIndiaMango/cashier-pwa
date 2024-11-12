// src/pages/pos.tsx
import React, { useState } from "react";
import { ProductSearch } from "../components/ProductSearch";
import { Cart } from "../components/Cart";
import { PaymentDialog } from "../components/PaymentDialog";
import { useStore } from "../hooks/useStore";
import { LocalProduct, LocalTransactionItem } from "../lib/db/schema";
import { useParams } from "react-router-dom";
// import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePWA } from "@/hooks/usePWA";

export default function POSPage() {
  const { id } = useParams();
  // const { isOnline, networkType, effectiveType, downlink, rtt } =
  //   useOnlineStatus();
  // console.log("Online Status:", {
  //   isOnline,
  //   networkType,
  //   effectiveType,
  //   downlink,
  //   rtt
  // });
  const { createTransaction, triggerSync } = useStore(String(id)); // Replace with actual store ID
  const [cartItems, setCartItems] = useState<
    (LocalTransactionItem & { productName: string })[]
  >([]);
  const [showPayment, setShowPayment] = useState(false);
  const { needRefresh, offlineReady, updateServiceWorker } = usePWA();
  const handleProductSelect = (product: LocalProduct) => {
    const existingItem = cartItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.currentQuantity) {
        alert("Not enough stock available");
        return;
      }

      handleUpdateQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.currentQuantity === 0) {
        alert("Product out of stock");
        return;
      }

      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price
        }
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId)
    );
  };

  const handlePaymentComplete = async (
    paymentMethod: "CASH" | "CARD" | "MOBILE_MONEY"
  ) => {
    try {
      const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

      await createTransaction({
        totalAmount: total,
        paymentMethod,
        status: "COMPLETED",
        items: cartItems.map(
          ({ productId, quantity, unitPrice, totalPrice }) => ({
            productId,
            quantity,
            unitPrice,
            totalPrice
          })
        )
      });

      setCartItems([]);
      setShowPayment(false);
      alert("Transaction completed successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h1 className="mb-4 text-2xl font-bold">Point of Sale</h1>
          <ProductSearch onProductSelect={handleProductSelect} />
        </div>

        <div>
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />

          {cartItems.length > 0 && (
            <button
              onClick={() => setShowPayment(true)}
              className="w-full p-4 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>
      <>
        {needRefresh && (
          <div>
            <button onClick={() => updateServiceWorker(true)}>
              Update App
            </button>
          </div>
        )}
        {offlineReady && <div>App is ready to work offline!</div>}

        <button onClick={triggerSync}>Sync Now</button>
      </>

      {showPayment && (
        <PaymentDialog
          total={cartItems.reduce((sum, item) => sum + item.totalPrice, 0)}
          onComplete={handlePaymentComplete}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useStore } from "@/hooks/useStore";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

// type IProps = {
//   barcode: string;
//   setBarcode: React.Dispatch<React.SetStateAction<string>>;

// };

const BarcodeScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [barcode, setBarcode] = useState("");
  const { products, loading, discounts } = useStore();
  const { cartItems, addItemToCart } = useCart();

  const handleonClickBarCode = (scannedBarcode: string) => {
    if (!scannedBarcode) return;

    // setShowAddProduct(true);
    console.log(cartItems);
    const foundProduct = products.find(
      (prod) => prod.ean.toString() === scannedBarcode.toString()
    );
    if (foundProduct) {
      addItemToCart({ ...foundProduct });
    } else {
      toast.error("Product not found");
    }

    // const item = cartItems.find((item) => item.ean === scannedBarcode);

    // if (item) {
    //   addItemToCart(item);
    // } else {
    //   toast.error("Item not found");
    // }
  };

  useEffect(() => {
    let scannedData = "";

    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isScannerActive) return;

      if (event.key === "Enter") {
        setBarcode(scannedData);

        handleonClickBarCode(scannedData);
        setIsScannerActive(false);
        scannedData = "";
      } else {
        scannedData += event.key;
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [isScannerActive]);

  return (
    <div>
      {/* <p>Scanned Barcode: {barcode}</p> */}
      <Button
        size="lg"
        className={`text-white  hover:opacity-80 rounded-lg !border-none ${
          !isScannerActive ? "bg-[#303f9e]" : "!bg-green-500"
        }`}
        onClick={() => setIsScannerActive((prev) => !prev)}
      >
        {isScannerActive ? "Stop Scanning" : "Start Scanning"}
        {/* Scan barcode */}
      </Button>

      <input
        type="text"
        placeholder="Scan here..."
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        readOnly
        className="hidden"
      />
    </div>
  );
};

export default BarcodeScanner;

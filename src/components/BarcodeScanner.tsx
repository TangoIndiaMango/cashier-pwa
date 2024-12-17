import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useStore } from "@/hooks/useStore";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const BarcodeScanner = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [barcode, setBarcode] = useState("");
  const { products } = useStore();
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
      <Button
        size="lg"
        className={`text-white  hover:opacity-80 rounded-lg !border-none w-full ${
          !isScannerActive ? "bg-[#303f9e]" : "!bg-green-500"
        }`}
        onClick={() => setIsScannerActive((prev) => !prev)}
      >
        {isScannerActive ? "Stop Scanning" : "Start Scanning"}
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

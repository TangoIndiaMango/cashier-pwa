import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Dummy data
const dummyProducts = [
  {
    id: 1,
    code: "TS001",
    name: "T-Shirt",
    price: 2500,
    size: "L",
    color: "Blue",
    stock: 50
  },
  {
    id: 2,
    code: "JN001",
    name: "Jeans",
    price: 5000,
    size: "32",
    color: "Black",
    stock: 30
  }
];

const ProductSearchModal = ({ isOpen, onClose, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [amount, setAmount] = useState(1);

  const handleSearch = (code) => {
    console.log(code);
    const product = dummyProducts.find(
      (p) => p.code.toLowerCase() === code.toLowerCase()
    );
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleAdd = () => {
    if (selectedProduct) {
      onAddProduct({
        ...selectedProduct,
        quantity: amount,
        total: selectedProduct.price * amount
      });
      onClose();
      setSelectedProduct(null);
      setAmount(1);
      setSearchTerm("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription className="text-gray-500">
            Search for product using product name
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchTerm);
                }
              }}
              className=""
              placeholder="Type product code and press enter to search"
            />
          </div>

          {selectedProduct && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size</Label>
                  <Input value={selectedProduct.size} disabled />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input value={selectedProduct.color} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    min={1}
                    max={selectedProduct.stock}
                  />
                </div>
                <div>
                  <Label>Items left</Label>
                  <Input value={selectedProduct.stock} disabled />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedProduct}>
            Add Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchModal;

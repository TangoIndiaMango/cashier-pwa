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
import { useStore } from "@/hooks/useStore";
import { LocalProduct } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const ProductSearchModal = ({ isOpen, onClose, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [selectedProduct, setSelectedProduct] = useState<LocalProduct | null>(
    null
  );
  const [filteredProducts, setFilteredProducts] = useState<LocalProduct | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  const { products, loading, updateAvailableQuantity } = useStore();

  // Use debounced value for the search term
  // const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleEnter = () => {
    const filteredProduct = products.find(
      (prod) => prod.ean.toString() === searchTerm.toString()
    );
    if (filteredProduct) {
      setFilteredProducts(filteredProduct);
    } else {
      alert("Product not found");
    }
  };

  const handleAdd = () => {
    if (selectedProduct) {
      onAddProduct({
        ...selectedProduct,
        quantity,
        total: selectedProduct.retail_price * quantity
      });
      updateAvailableQuantity(selectedProduct.product_code, quantity);
      onClose();
      setSelectedProduct(null);
      setQuantity(1);
      setSearchTerm(""); // Clear search term after adding the product
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
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
              className="placeholder:text-gray-500"
              placeholder="Type product code and press enter to search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEnter();
                }
              }}
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="grid gap-2 overflow-auto max-h-40">
              {filteredProducts && (
                <div
                  key={filteredProducts.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedProduct(filteredProducts)}
                >
                  <p className="font-medium">{filteredProducts.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {filteredProducts.brand_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    SKU: {filteredProducts.product_code}
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedProduct && (
            <>
              <div>
                <Label>Product Name</Label>
                <Input value={selectedProduct.product_name} disabled />
              </div>
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
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={selectedProduct.available_quantity}
                  />
                </div>
                <div>
                  <Label>Items Left</Label>
                  <Input disabled value={selectedProduct.available_quantity} />
                </div>
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  value={formatCurrency(selectedProduct.retail_price, "NGN")}
                  disabled
                />
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

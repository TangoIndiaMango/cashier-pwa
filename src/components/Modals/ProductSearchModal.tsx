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
import { LocalTransactionItem } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


const ProductSearchModal = ({
  isOpen,
  onClose,
  onFullfield,
  fileredProduct
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [selectedProduct, setSelectedProduct] =
    useState<Partial<LocalTransactionItem> | null>(null);
  const [filteredProducts, setFilteredProducts] =
    useState<Partial<LocalTransactionItem> | null>(fileredProduct);
  // console.log(fileredProduct);
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { products, loading, discounts } = useStore();

  // console.log(discounts)

  const handleEnter = () => {
    const foundProduct = products.find(
      (prod) => prod.ean.toString() === searchTerm.toString()
    );
    if (foundProduct) {
      setFilteredProducts(foundProduct);
    } else {
      toast.error("Product not found");
    }
  };

  const handleAdd = () => {
    let discountObj;

    if (discount) {
      discountObj = discounts.find(
        (discountObj) => discountObj.code === discount
      );

      if (!discountObj) {
        toast("Invalid discount code");
        setError("Invalid discount code");
        return;
      } else setError(null);
    }

    if (selectedProduct) {
      onFullfield({
        ...selectedProduct,
        discount: discountObj
      });
      onClose();
      setSelectedProduct(null);
      setDiscount("");
      setSearchTerm("");
      toast("Product added successfully");
    }
  };
  // console.log(quantity)

  useEffect(() => {
    setSelectedProduct(fileredProduct);
    setFilteredProducts(fileredProduct);
    setDiscount(fileredProduct?.discount?.code || "");
  }, [isOpen, fileredProduct]);

  // useEffect(() => {
  //   if (selectedProduct)
  //     console.log(
  //       selectedProduct,
  //       discounts.filter((d) => d.type === "discountPerProduct"),

  //       discounts.filter((d) => d.type === "discountOnTotal")
  //     );
  // }, [selectedProduct, discounts]);

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
                  <Label>Price</Label>
                  <Input
                    value={formatCurrency(
                      selectedProduct.retail_price as number,
                      "NGN"
                    )}
                    disabled
                  />
                </div>
                <div>
                  <Label>Items Left</Label>
                  <Input disabled value={selectedProduct.available_quantity} />
                </div>
              </div>
              <div className="w-full">
                <Label>Discount</Label>
                <Input
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter") {
                  //     handleAddDiscount(discount);
                  //   }
                  // }}
                />
                {error ? <div className="text-red-600">{error}</div> : null}
                {loading && <div>Loading discounts...</div>}
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

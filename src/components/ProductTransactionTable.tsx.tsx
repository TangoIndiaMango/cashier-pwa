import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICartItem, ISetCartItems, useCart } from "@/hooks/useCart";
import { useStore } from "@/hooks/useStore";
import { LocalTransactionItem } from "@/lib/db/schema";
import { formatBalance } from "@/lib/utils";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import { ProductDetailsDialog } from "./Modals/ProductDetailsDialog";
import ProductSearchModal from "./Modals/ProductSearchModal";

type CurrentProductType = {
  data: ICartItem[];
  setCartItems: (cartItems: ISetCartItems) => void;
};

export function CurrentProductTable({
  data,
  setCartItems,
}: CurrentProductType) {
  const { addProductToCart, removeItemFromCart } = useCart();
  const { updateAvailableQuantity } = useStore();

  const [selectedProduct, setSelectedProduct] =
    useState<LocalTransactionItem | null>(null);
  const [showEditProd, setShowEditProd] = useState(false);
  const [showViewProd, setShowViewProd] = useState(false);

  // Maintain quantities in local state, not in refs
  const [quantities, setQuantities] = useState<Record<string, number>>(
    data.reduce((acc, product) => {
      acc[product.product_code!] = product.quantity || 1;
      return acc;
    }, {})
  );

  const handleQuantitesChange = useCallback(
    (product: LocalTransactionItem, quantity: number) => {
      if (quantity > product.available_quantity!) {
        alert("Quantity exceeds available stock");
        return;
      }

      setQuantities((prevQuantities) => {
        return {
          ...prevQuantities,
          [product.product_code!]: quantity,
        };
      });

      updateAvailableQuantity(product.product_code!, quantity);
    },
    [updateAvailableQuantity] // Ensures the callback stays memoized with respect to the update function
  );

  useEffect(() => {
    setCartItems((data) =>
      data.map((item) => ({
        ...item,
        quantity: quantities[item.product_code!] || 1,
        itemTotal:
          Number(item.totalPrice || item.retail_price) *
          (quantities[item.product_code!] || 1),
      }))
    );
  }, [setCartItems, quantities]); // We are using memoized data here, so no infinite loop

  const handleEdit = (product: LocalTransactionItem, action: string) => {
    setSelectedProduct(product);
    if (action === "edit") {
      setShowEditProd(true);
    } else {
      setShowViewProd(true);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>A list of your recent products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product Code</TableHead>
            <TableHead className="hidden md:table-cell">Product</TableHead>
            <TableHead className="hidden lg:table-cell">Size</TableHead>
            <TableHead className="hidden lg:table-cell">Color</TableHead>
            <TableHead className="text-right">Amount (NGN)</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total Amount (NGN)</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => {
            const quantity = quantities[product.product_code!] || 1;
            return (
              <TableRow key={product.product_code}>
                <TableCell className="font-medium">
                  {product.product_code}
                </TableCell>
                <TableCell className="capitaliz line-clamp-2 md:line-clamp-none">
                  {product.product_name}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.size || "N/A"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.color || "N/A"}
                </TableCell>
                <TableCell>
                  {product.retail_price?.toLocaleString() || "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <Input
                      type="number"
                      value={Number(quantity)}
                      onChange={(e) =>
                        handleQuantitesChange(product, parseInt(e.target.value))
                      }
                      min={1}
                      max={product.available_quantity}
                      className="w-16 p-1 border rounded"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatBalance(
                    Number(product?.totalPrice) * Number(quantity)
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product, "edit")}
                    >
                      <Edit className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product, "view")}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeItemFromCart(product.product_code as string)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ProductDetailsDialog
        product={selectedProduct}
        open={showViewProd}
        onOpenChange={() => setShowViewProd(!showViewProd)}
      />
      <ProductSearchModal
        isOpen={showEditProd}
        onClose={() => setShowEditProd(false)}
        onAddProduct={addProductToCart}
        fileredProduct={selectedProduct}
      />
    </div>
  );
}

// function getStatusColor(status: string | undefined) {
//   switch (status?.toLowerCase()) {
//     case "completed":
//       return "bg-green-100 text-green-800";
//     case "draft":
//       return "bg-yellow-100 text-yellow-800";
//     case "failed":
//       return "bg-red-100 text-red-800";
//     default:
//       return "bg-gray-100 text-gray-800";
//   }
// }

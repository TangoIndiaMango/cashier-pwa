import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useCart } from "@/hooks/useCart";
import { useStore } from "@/hooks/useStore";
import { LocalTransactionItem } from "@/lib/db/schema";
import { formatBalance } from "@/lib/utils";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { ProductDetailsDialog } from "./Modals/ProductDetailsDialog";
import ProductSearchModal from "./Modals/ProductSearchModal";
import toast from "react-hot-toast";



export function CurrentProductTable() {
  const { updateCartItem, removeItemFromCart, cartItems } = useCart();
  const { updateAvailableQuantity } = useStore();

  const [selectedProduct, setSelectedProduct] =
    useState<LocalTransactionItem | null>(null);
  const [showEditProd, setShowEditProd] = useState(false);
  const [showViewProd, setShowViewProd] = useState(false);

  const [quantities, setQuantities] = useState<Record<string, number>>(
    cartItems.reduce((acc, product) => {
      acc[product.product_code!] = product.quantity || 1;
      return acc;
    }, {})
  );

  const handleQuantitesChange = useCallback(
    (product: LocalTransactionItem, quantity: number) => {
      if (quantity > product.available_quantity!) {
        toast.error("Quantity cannot be greater than available quantity");
        return;
      }

      setQuantities((prevQuantities) => {
        return {
          ...prevQuantities,
          [product.product_code!]: quantity
        };
      });

      updateCartItem({ id: product.id, quantity });
      updateAvailableQuantity(product.product_code!, quantity);
    },
    [updateAvailableQuantity]
  );

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
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="">
            <TableHead className="w-[100px] text-xs font-normal">
              Product Code
            </TableHead>
            <TableHead className="hidden text-xs font-normal md:table-cell">
              Product
            </TableHead>
            <TableHead className="hidden text-xs font-normal lg:table-cell">
              Size
            </TableHead>
            <TableHead className="hidden text-xs font-normal lg:table-cell">
              Color
            </TableHead>
            <TableHead className="text-xs font-normal text-right">
              Amount (NGN)
            </TableHead>
            <TableHead className="text-xs font-normal text-right">
              Quantity
            </TableHead>
            <TableHead className="text-xs font-normal text-right">
              Total Amount (NGN)
            </TableHead>
            <TableHead className="w-[100px] text-xs font-normal text-center">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...cartItems].reverse().map((product, index) => {
            const quantity = quantities[product.product_code!] || 1;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium text-[#303f9e]">
                  {product.product_code}
                </TableCell>
                <TableCell className="hidden capitalize md:table-cell">
                  {product.product_name}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.size || "N/A"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.color || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  ₦{product.discountPrice?.toLocaleString() || "N/A"}
                  {product.discount && (
                    <p className="mt-2 line-through">
                      ₦{product.retail_price?.toLocaleString() || "N/A"}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <Input
                    type="number"
                      value={Number(quantity)}
                      onChange={(e) =>
                        handleQuantitesChange(product, parseInt(e.target.value))
                      }
                      
                      max={product.available_quantity}
                      className="w-16 p-1 border rounded"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  ₦
                  {formatBalance(
                    Number(product.discountPrice || product.retail_price) *
                      Number(quantity)
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-evenly">
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
        onFullfield={updateCartItem}
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

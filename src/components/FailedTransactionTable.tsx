import { Button } from "@/components/ui/button";
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
import { LocalTransactionItem } from "@/lib/db/schema";
import { SyncManager } from "@/lib/sync/syncManager";
import { formatBalance } from "@/lib/utils";
import dayjs from 'dayjs';
import { Eye, Loader2, LucideFolderSync } from "lucide-react";
import { useState } from "react";
import { useStore } from "../hooks/useStore";
import { ProductDetailsDialog } from "./Modals/ProductDetailsDialog";
import ProductSearchModal from "./Modals/ProductSearchModal";

export function FailedTransactionTable() {
  const { updateCartItem } = useCart();

  const [selectedProduct, setSelectedProduct] =
    useState<LocalTransactionItem | null>(null);
  const [showEditProd, setShowEditProd] = useState(false);
  const [showViewProd, setShowViewProd] = useState(false);
  const { loading, failedTrx } = useStore();
  const syncMang = SyncManager.getInstance()

  const handleEdit = (product: LocalTransactionItem, action: string) => {
    setSelectedProduct(product);
    if (action === "edit") {
      setShowEditProd(true);
    } else {
      setShowViewProd(true);
    }
  };

  const handleTransactionSync = async (trx:any) => {
    syncMang.syncSingleTransaction(trx)
  }

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className=" animate-spin" />
    </div>
  ) : (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>
          A list of your failed synced transactions products.
        </TableCaption>
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="">
            <TableHead className="w-[100px] text-xs font-normal">
              Sync Session ID
            </TableHead>
            <TableHead className="hidden text-xs font-normal md:table-cell">
              Product Ean
            </TableHead>
            <TableHead className="hidden text-xs font-normal lg:table-cell">
              Customer
            </TableHead>
            <TableHead className="hidden text-xs font-normal lg:table-cell">
              Error Message
            </TableHead>

            <TableHead className="text-xs font-normal text-right">
              Amount
            </TableHead>
            <TableHead className="text-xs font-normal text-right">
              Created At
            </TableHead>
            <TableHead className="w-[100px] text-xs font-normal text-center">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {failedTrx.map((trx, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="font-medium text-[#303f9e]">
                  {trx?.sync_session_id}
                </TableCell>
                <TableCell className="hidden capitalize md:table-cell">
                  {trx?.products[0]?.ean || "N/A"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {trx?.customer_name || "N/A"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {trx?.error_message || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  ₦{formatBalance(Number(trx?.exact_total_amount))}
                </TableCell>
                <TableCell className="text-right">
                {dayjs(trx.created_at).format("MMM D, YYYY hh:mmA")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-evenly">
                    <Button
                      variant="lightblue"
                      size="sm"
                      onClick={() => handleTransactionSync(trx)}
                    >
                      <LucideFolderSync className="w-4 h-4" />
                      <span className="sr-only">Sync</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(trx, "view")}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        // removeItemFromCart(product.product_code as string)
                        console.log("clicked")
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="sr-only">Delete</span>
                    </Button> */}
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
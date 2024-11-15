"use client";

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
import { LocalTransactionItem } from "@/lib/db/schema";
import { Eye } from "lucide-react";
import { useState } from "react";
import { ProductDetailsDialog } from "./Modals/ProductDetailsDialog";
export function CurrentProductTable({ data }: { data: LocalTransactionItem[] }) {
  const [selectedProduct, setSelectedProduct] = useState<LocalTransactionItem | null>(
    null
  );

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>A list of your recent products.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product Code</TableHead>
            <TableHead className="hidden md:table-cell">Product</TableHead>
            <TableHead className="hidden lg:table-cell">Size</TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="text-right">Amount (NGN)</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>

            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.productCode}>
              <TableCell className="font-medium">
                {product.productCode}
              </TableCell>
              <TableCell className="capitalize">
                {product.productName}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.size || "N/A"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {product.color || "N/A"}
              </TableCell>
              <TableCell>
                {product.unitPrice?.toLocaleString() || "N/A"}
              </TableCell>
              <TableCell>
                {product.quantity?.toLocaleString() || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {product?.totalPrice}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Eye className="w-4 h-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ProductDetailsDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
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

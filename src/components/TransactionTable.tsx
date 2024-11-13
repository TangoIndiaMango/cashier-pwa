import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { LocalTransaction } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
// export type TableProps = {
//   id: string;
//   product_name: string;
//   quantity: string;
//   total: string;
//   payment_method: string;
//   amount: string;
//   customer: CustomerDetails;
//   paymentMethods: {
//     method: string;
//   }[];
//   status: string;
//   products: (LocalTransactionItem & {
//     productName: string;
// })[];
//   totalAmount: number;
// };

export function CurrentTransactionTable({
  data
}: {
  data: LocalTransaction[];
}) {
  return (
    <Table>
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">TransactionID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>{transaction?.id}</TableCell>
            <TableCell>
              {transaction?.customer?.firstname}
              {transaction?.customer?.lastname}
            </TableCell>
            <TableCell>{transaction.items?.[0]?.productName || "N/A"}</TableCell>
            <TableCell>{transaction.paymentMethods?.[0]?.method || 'N/A'}</TableCell>
            <TableCell>{transaction.status || "N/A"}</TableCell>
            <TableCell>
              {formatCurrency(transaction.totalAmount, "NGN")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

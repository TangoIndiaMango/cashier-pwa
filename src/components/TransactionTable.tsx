'use client'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LocalTransaction } from "@/lib/db/schema"
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { TransactionDetailsDialog } from './Modals/TransactionDetailsDialog'
export function CurrentTransactionTable({
  data
}: {
  data: LocalTransaction[]
}) {
  const [selectedTransaction, setSelectedTransaction] = useState<LocalTransaction | null>(null)

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableCaption>A list of your recent transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="hidden md:table-cell">Product</TableHead>
            <TableHead className="hidden lg:table-cell">Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount (NGN)</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell className="capitalize">
                {transaction.customer?.firstname} {transaction.customer?.lastname}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {transaction.items?.[0]?.productName || "N/A"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {transaction.paymentMethods?.[0]?.method || 'N/A'}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction?.status?.toLowerCase())}`}>
                  {transaction.status || "N/A"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {transaction?.totalAmount?.toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <Eye className="w-4 h-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      />
    </div>
  )
}

function getStatusColor(status: string | undefined) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
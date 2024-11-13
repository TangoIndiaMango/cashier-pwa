import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { LocalTransaction } from "@/lib/db/schema"
  import { formatCurrency } from "@/lib/utils"
  
  interface TransactionDetailsDialogProps {
    transaction: LocalTransaction | null
    open: boolean
    onOpenChange: (open: boolean) => void
  }
  
  export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
    if (!transaction) return null
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View transaction details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-auto pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Transaction ID</h3>
                <p>{transaction.id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p>{transaction.customer?.firstname || "N/A"} {transaction.customer?.lastname}</p>
              </div>
              <div>
                <h3 className="font-semibold">Products</h3>
                <ul className="pl-5 list-disc">
                  {transaction.items?.map((item, index) => (
                    <li key={index}>
                      {item.productName} - {formatCurrency(item?.unitPrice, "NGN")} x {item.quantity}
                    </li>
                  )) || <li>No items</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <ul className="pl-5 list-disc">
                  {transaction.paymentMethods?.map((method, index) => (
                    <li key={index}>{method.method} - {formatCurrency(method.amount, "NGN")}</li>
                  )) || <li>No payment methods</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p>{transaction.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Amount</h3>
                <p>{formatCurrency(transaction.totalAmount, "NGN")}</p>
              </div>
              {transaction?.synced && (
                <div className="space-y-1">
                  <h3 className="font-semibold ">Synced</h3>
                  <p className={`${transaction?.synced === 'true' ? 'bg-purple-400 text-purple-800' : 'bg-yellow-200 text-yellow-900'} px-3 rounded-xl w-fit `}>{transaction.synced}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }
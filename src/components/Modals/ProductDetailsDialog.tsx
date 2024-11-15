import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocalTransactionItem } from "@/lib/db/schema"
  
  interface ProductDetailsDialogProps {
    product: LocalTransactionItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
  }
  
  export function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
    if (!product) return null
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View Product details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] overflow-auto pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Product ID</h3>
                <p>{product.productCode}</p>
              </div>
              {/* <div>
                <h3 className="font-semibold">Customer</h3>
                <p>{Product.customer?.firstname || "N/A"} {Product.customer?.lastname}</p>
              </div>
              <div>
                <h3 className="font-semibold">Products</h3>
                <ul className="pl-5 list-disc">
                  {Product.items?.map((item, index) => (
                    <li key={index}>
                      {item.productName} - {formatCurrency(item?.unitPrice, "NGN")} x {item.quantity}
                    </li>
                  )) || <li>No items</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <ul className="pl-5 list-disc">
                  {Product.paymentMethods?.map((method, index) => (
                    <li key={index}>{method.method} - {formatCurrency(method.amount, "NGN")}</li>
                  )) || <li>No payment methods</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p>{Product.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Total Amount</h3>
                <p>{formatCurrency(Product.totalAmount, "NGN")}</p>
              </div>
              {Product?.synced && (
                <div className="space-y-1">
                  <h3 className="font-semibold ">Synced</h3>
                  <p className={`${Product?.synced === 'true' ? 'bg-purple-400 text-purple-800' : 'bg-yellow-200 text-yellow-900'} px-3 rounded-xl w-fit `}>{Product.synced}</p>
                </div>
              )} */}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }
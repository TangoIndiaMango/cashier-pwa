import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";

const paymentMethods = [
  "Transfer (CLEAN)",
  "Cash",
  "Marketing",
  "Gift Voucher",
  "Uniform",
  "POS Machine",
  "Transfer",
  "Pending Impact",
  "Credit Note",
  "Paystack"
];

const PaymentMethodModal = ({ isOpen, onClose, total, onPaymentSubmit }) => {
  const [paymentEntries, setPaymentEntries] = useState([
    { method: "", amount: "" }
  ]);

  const addPaymentEntry = () => {
    setPaymentEntries([...paymentEntries, { method: "", amount: "" }]);
  };

  const removePaymentEntry = (index) => {
    setPaymentEntries(paymentEntries.filter((_, i) => i !== index));
  };

  const updatePaymentEntry = (index, field, value) => {
    const newEntries = [...paymentEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setPaymentEntries(newEntries);
  };

  const handleSubmit = () => {
    // Validate that total amounts match the transaction total
    const totalPayments = paymentEntries.reduce(
      (sum, entry) => sum + (Number(entry.amount) || 0),
      0
    );

    if (totalPayments !== total) {
      alert("Total payments must equal transaction total");
      return;
    }

    // Process payments
    console.log("Processing payments:", paymentEntries);
    onPaymentSubmit(paymentEntries);
    onClose();
    setPaymentEntries([{ method: "", amount: "" }]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Payment method
          </DialogDescription>
        </DialogHeader>

        <div className="">
          <div className="mb-4">
            <Label>Total: {formatCurrency(total, "NGN")}</Label>
          </div>

          {paymentEntries.map((entry, index) => (
            <div key={index} className="grid gap-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Payment Method</Label>
                  <Select
                    value={entry.method}
                    onValueChange={(value) =>
                      updatePaymentEntry(index, "method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select method"
                        className="placeholder:text-gray-500"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={entry.amount}
                    className="placeholder:text-gray-500"
                    onChange={(e) =>
                      updatePaymentEntry(index, "amount", e.target.value)
                    }
                    placeholder="NGN"
                  />
                </div>
              </div>
              {paymentEntries.length > 1 && (
                <Button
                  variant="destructive"
                  onClick={() => removePaymentEntry(index)}
                  className="w-full"
                >
                  Delete
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={addPaymentEntry}
              className="w-full"
            >
              Add Another Method
            </Button>
            <Button onClick={handleSubmit} className="w-full">
              Add Method
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;

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
import { useStore } from "@/hooks/useStore";
import { formatCurrency } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import toast from "react-hot-toast";

const PaymentMethodModal = ({ isOpen, onClose, total, onPaymentSubmit }) => {
  const [paymentEntries, setPaymentEntries] = useState([
    { mode_of_payment_id: "", amount: "", mode_of_payment_pos_id: "" }
  ]);

  const { paymentMethod: paymentMethods, branches } = useStore();

  const addPaymentEntry = () => {
    setPaymentEntries([
      ...paymentEntries,
      { mode_of_payment_id: "", amount: "", mode_of_payment_pos_id: "" }
    ]);
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
    // console.log(total)// 30754.199999999997
    //console.log(totalPayments); // 30754.2
    const tolerance = 0.01;
    const roundedTotal = Math.round(total * 100) / 100; //-> 30754.2
    const roundedTotalPayments = Math.round(totalPayments * 100) / 100; //->30754.2

    if (Math.abs(roundedTotal - roundedTotalPayments) > tolerance) {
      alert("Total payments must equal transaction total");
      return;
    }
    const allEntriesValid = paymentEntries.every(
      (method) =>
        method.mode_of_payment_id && method.amount && Number(method.amount) > 0
    );
    if (!allEntriesValid) {
      toast.error("Please fill in all payment details");
      return;
    }

    // Process payments
    console.log("Processing payments:", paymentEntries);
    onPaymentSubmit(paymentEntries);
    onClose();
    setPaymentEntries([
      { mode_of_payment_id: "", amount: "", mode_of_payment_pos_id: "" }
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Method</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Select payment method and provide payment details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] rounded-md border p-4">
          <div>
            <div className="mb-4">
              <Label>Total: {formatCurrency(total, "NGN")}</Label>
            </div>

            {paymentEntries.map((entry, index) => (
              <div key={index} className="grid gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Payment Method</Label>
                    <Select
                      value={entry.mode_of_payment_id}
                      onValueChange={(value) =>
                        updatePaymentEntry(index, "mode_of_payment_id", value)
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
                          <SelectItem
                            key={method.id}
                            value={method.id.toString()}
                          >
                            {method.name}
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
                      placeholder="Amount"
                    />
                  </div>
                </div>

                {/* Conditionally render branch selection if POS Machine is selected */}
                {entry.mode_of_payment_id === "13" && (
                  <div>
                    <Label>Select Terminal</Label>
                    <Select
                      value={entry.mode_of_payment_pos_id}
                      onValueChange={(value) =>
                        updatePaymentEntry(
                          index,
                          "mode_of_payment_pos_id",
                          value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Select terminal"
                          className="max-w-md overflow-auto placeholder:text-gray-500"
                        />
                      </SelectTrigger>
                      <SelectContent className="max-w-md">
                        {branches.map((branch) => (
                          <SelectItem
                            key={branch.id}
                            value={branch.id.toString()}
                          >
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;

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
import { LocalApiMethods } from "@/lib/api/localMethods";
import { LocalPaymentMethod } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

// Dummy branch data for POS Machine
const branches = [
  { id: 1, name: "Branch 1" },
  { id: 2, name: "Branch 2" },
  { id: 3, name: "Branch 3" }
];

// Payment methods with id and method_name
// const paymentMethods = [
//   { id: 1, method_name: "Transfer (CLEAN)" },
//   { id: 2, method_name: "Cash" },
//   { id: 3, method_name: "Marketing" },
//   { id: 4, method_name: "Gift Voucher" },
//   { id: 5, method_name: "Uniform" },
//   { id: 6, method_name: "POS Machine" },
//   { id: 7, method_name: "Transfer" },
//   { id: 8, method_name: "Pending Impact" },
//   { id: 9, method_name: "Credit Note" },
//   { id: 10, method_name: "Paystack" }
// ];

const PaymentMethodModal = ({ isOpen, onClose, total, onPaymentSubmit }) => {
  const [paymentEntries, setPaymentEntries] = useState([
    { mode_of_payment_id: "", amount: "", mode_of_payment_pos_id: "" }
  ]);
  const [paymentMethods, setPaymentMethods] = useState<LocalPaymentMethod[]>(
    []
  );
  const getpaymentMethods = async () => {
    try {
      const methods = await LocalApiMethods.getAllPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    getpaymentMethods();
  }, []);

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

    if (totalPayments !== total) {
      alert("Total payments must equal transaction total");
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
                    <Label>Select Branch</Label>
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
                          placeholder="Select branch"
                          className="placeholder:text-gray-500"
                        />
                      </SelectTrigger>
                      <SelectContent>
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

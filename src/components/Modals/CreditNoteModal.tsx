import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import Typography from "../Typography";
import { FormField } from "../ui/input";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useApplyPoints } from "@/hooks/useApplyPoints";

interface ICreditNote extends DialogProps {
  open: boolean;
  points: number;
  onOpenChange: any;
  total: number;
}

const CreditNote: React.FC<ICreditNote> = ({
  points,
  onOpenChange,
  total,
  ...rest
}) => {
  const setCreditNotesPoints = useApplyPoints((state) => state.setCreditNotePoints);

  const [appliedPoints, setAppliedPoints] = useState(0);
  const onChange = (e: any) => {
    const val = e.target?.value;
    if (val > points)
      return toast.error("Value is more than available credit not points", {
        className: "bg-red-500 text-white",
      });
    // console.log(total);
    if (val > total)
      return toast.error("Value is more than the total to pay for", {
        className: "bg-red-500 text-white",
      });
    setAppliedPoints(val);
    setCreditNotesPoints(val);
  };

  const close = () => {
    onOpenChange(false);
    setAppliedPoints(0);
  };

  return (
    <Dialog onOpenChange={onOpenChange} {...rest}>
      <DialogContent>
        <DialogTitle></DialogTitle>
        <DialogHeader>
          <Typography>{"Apply Credit Bote Point"}</Typography>
          <Typography>
            {"Apply for all credit note point to customer product purchase"}
          </Typography>

          <FormField
            label={`Credit Note Point (${points})`}
            containerClassName="my-4"
            value={appliedPoints}
            onChange={onChange}
            type={"number"}
          />
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" className="flex-1" onClick={close}>
            Cancel
          </Button>

          <Button
            className="flex-1"
            onClick={() => {
              close();
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditNote;

import React, { useEffect, useState } from "react";
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

interface ILoyaltyModal extends DialogProps {
  open: boolean;
  title?: string;
  desc?: string;
  points?: number;
  handleApplyPoints: (point: number) => void;
  // appliedPoints: number;
  // setAppliedPoints: React.Dispatch<React.SetStateAction<number>>;
}

const LoyaltyModal: React.FC<ILoyaltyModal> = ({
  title,
  desc,
  onOpenChange,
  points,
  handleApplyPoints,
  // appliedPoints = 0,
  // setAppliedPoints,
  ...rest
}) => {
  const [appliedPoints, setAppliedPoints] = useState(0);
  const onChange = (e: any) => {
    const val = e.target?.value;
    if (points && val > points)
      return toast.error("Value is more than available loyal points");
    setAppliedPoints(e.target?.value);
  };

  const close = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    setAppliedPoints(0);
  };

  useEffect(() => {
    if (!points) return;
    setAppliedPoints(points);
  }, [points]);

  return (
    <Dialog onOpenChange={onOpenChange} {...rest}>
      <DialogContent>
        <DialogTitle></DialogTitle>
        <DialogHeader>
          <Typography>{title ? title : "Apply Loyalty Point"}</Typography>
          <Typography>
            {desc
              ? desc
              : "Apply for all loyalty point to customer product purchase"}
          </Typography>

          <FormField
            label={`Loyalty Point (${points})`}
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
              handleApplyPoints(appliedPoints);
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

export default LoyaltyModal;

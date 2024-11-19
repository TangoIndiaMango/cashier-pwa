import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import Typography from "../Typography";
import { FormField } from "../ui/input";
import { Button } from "../ui/button";

interface ILoyaltyModal extends DialogProps {
  open: boolean;
}

const LoyaltyModal: React.FC<ILoyaltyModal> = ({ onOpenChange, ...rest }) => {
  return (
    <Dialog onOpenChange={onOpenChange}  {...rest}>
      <DialogContent>
        <DialogHeader>
          <Typography>Loyalty Point</Typography>
          <Typography>
            Apply for all loyalty point to customer product purchase
          </Typography>

          <FormField label="Loyalty Point" containerClassName="my-4" />
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange && onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button className="flex-1">Apply Point</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoyaltyModal;

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { AlertTriangle, LogOut } from "lucide-react";
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSync: () => void;
  unsyncedTransactions: number;
}
export function LogoutModal({
  isOpen,
  onClose,
  onLogout,
  onSync,
  unsyncedTransactions
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? Please review the following
            information before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {unsyncedTransactions > 0 && (
            <div className="flex items-center gap-4 rounded-lg border p-4 bg-yellow-50">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-700">Warning</h4>
                <p className="text-sm text-yellow-600">
                  You have {unsyncedTransactions} unsynced transaction
                  {unsyncedTransactions > 1 ? "s" : ""}. Please sync before
                  logging out to avoid loss of information.
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {unsyncedTransactions > 0 && (
            <Button variant="outline" onClick={onSync}>
              Sync Transactions
            </Button>
          )}
          <Button variant="destructive" className="gap-2" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
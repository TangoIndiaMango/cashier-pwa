"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSync: () => void;
  isLoading: boolean;
  unsyncedTransactions: number;
}
export function LogoutModal({
  isOpen,
  onClose,
  onLogout,
  onSync,
  isLoading,
  unsyncedTransactions,
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex text-2xl items-center gap-2">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="pt-5 text-[16px]">
            Are you sure you want to log out? If yes, click on logout
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
            <Button variant="outline" onClick={onSync} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                " Sync Transactions"
              )}
            </Button>
          )}
          <Button
            variant="destructive"
            className="gap-2"
            onClick={onLogout}
            disabled={isLoading}
          >
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

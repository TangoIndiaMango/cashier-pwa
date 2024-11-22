import { FailedTransactionTable } from "@/components/FailedTransactionTable";
import { Button } from "@/components/ui/button";
import React from "react";
import { useStore } from "../hooks/useStore";
import useGoBack from "@/hooks/useGoBack";

const FailedTransaction = () => {
  const { failedTrx } = useStore();
  const { goBackButton } = useGoBack();
  return (
    <div className="container mx-auto space-y-6">
      <div>
        {goBackButton()}
        <header className="flex items-center justify-between w-full">
          <h1 className="flex-1 gap-5 text-2xl font-bold">
            Failed Sync Transactions
          </h1>
          <Button onClick={() => console.log("yay")}> Tranactions</Button>
        </header>
      </div>

      <FailedTransactionTable failedTrx={failedTrx} />
    </div>
  );
};

export default FailedTransaction;

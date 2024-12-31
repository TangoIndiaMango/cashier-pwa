import { FailedTransactionTable } from "@/components/FailedTransactionTable";
import { Button } from "@/components/ui/button";
import useGoBack from "@/hooks/useGoBack";
import { saveAs } from "file-saver";
import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RemoteApi } from "../lib/api/remoteApi";
import { useStore } from "@/hooks/useStore";

const FailedTransaction = () => {
  const { failedTrx } = useStore();
  const { goBackButton } = useGoBack();

  const [loading, setLoading] = useState(false);
  // const [downloadError, setDownloadError] = useState<string | null>(null);

  const params = {
    export: true
  };

  const downloadCSV = (data: any[]) => {
    const csvContent = data
      .map((row) => Object.values(row).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "failed_transactions.csv");
  };

  const downloadExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });
    saveAs(blob, "failed_transactions.xlsx");
  };

  const handleDownload = async (fileType: "csv" | "excel") => {
    setLoading(true);
    // setDownloadError(null);
    try {
      const result = await RemoteApi.downloadFailedTransactions(params);
      const data = result?.data?.data;
      if (data && Array.isArray(data)) {
        if (fileType === "csv") {
          downloadCSV(data);
        } else {
          downloadExcel(data);
        }
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (error: any) {
      console.error(error);
      // setDownloadError("Failed to download transactions.");
      toast.error("Failed to download transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        {goBackButton()}
        <header className="flex items-center justify-between w-full">
          <h1 className="flex-1 gap-5 text-2xl font-bold">
            Failed Sync Transactions
          </h1>
          <div className="space-x-2">
            <Button
              variant="lightblue"
              onClick={() => handleDownload("csv")}
              disabled={loading}
            >
              {loading ? "Downloading..." : "Download CSV"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDownload("excel")}
              disabled={loading}
            >
              {loading ? "Downloading..." : "Download Excel"}
            </Button>
          </div>
        </header>
      </div>

      {/* {downloadError && (
        <div className="mt-4 text-red-500">
          {downloadError}
        </div>
      )} */}

      <FailedTransactionTable failedTrx={failedTrx} />
    </div>
  );
};

export default FailedTransaction;

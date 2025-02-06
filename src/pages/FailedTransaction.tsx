import { FailedTransactionTable } from "@/components/FailedTransactionTable";
import { Button } from "@/components/ui/button";
import useGoBack from "@/hooks/useGoBack";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RemoteApi } from "../lib/api/remoteApi";
import { LocalApiMethods } from "@/lib/api/localMethods";
import { getDbInstance } from "@/lib/db/db";
import { TransactionSync } from "@/types/trxType";

const FailedTransaction = () => {
  const [failedTrx, setFailedTrx] = useState<TransactionSync[]>([]);
  const { goBackButton } = useGoBack();
  const [loading, setLoading] = useState<boolean>(true);
  const db = getDbInstance();
  const sessionId = sessionStorage.getItem("sessionId");

  useEffect(() => {
    const getFailedTrx = async () => {
      if (!sessionId) {
        toast.error("No session ID found. Please log in.");
        return;
      }

      try {
        setLoading(true);
        await db.openDatabase();

        // Fetch both remote and local failed transactions
        const [remoteData, localFailedTrx] = await Promise.all([
          RemoteApi.fetchFailedTransactions(),
          LocalApiMethods.getFailedSyncTrx(String(sessionId))
        ]);

        // Ensure both data sources are arrays and normalize the data
        const normalizeTransaction = (trx: any, source: 'local' | 'remote'): any => ({
          id: trx.id,
          sync_session_id: trx.sync_session_id,
          customer_name: trx.customer_name,
          customer_email: trx.customer_email,
          receipt_no: String(trx.receipt_no),
          payment_methods: Array.isArray(trx.payment_methods) 
            ? trx.payment_methods 
            : JSON.parse(trx.payment_methods || '[]'),
          products: Array.isArray(trx.products) 
            ? trx.products 
            : JSON.parse(trx.products || '[]'),
          exact_total_amount: trx.exact_total_amount,
          total: trx.total,
          transaction_data: typeof trx.transaction_data === 'string' 
            ? trx.transaction_data 
            : JSON.stringify(trx.transaction_data),
          error_message: trx.error_message,
          created_at: new Date(trx.created_at).toISOString(),
          updated_at: new Date(trx.updated_at).toISOString(),
          source,
          store_id: trx.store_id
        });

        const validRemoteData = (Array.isArray(remoteData) ? remoteData : [])
          .map(trx => normalizeTransaction(trx, 'remote'));
        const validLocalData = (Array.isArray(localFailedTrx) ? localFailedTrx : [])
          .map(trx => normalizeTransaction(trx, 'local'));

        // Create a Map to track unique transactions by sync_session_id
        const uniqueTransactions = new Map<string, TransactionSync>();

        // Process local transactions first (they take precedence)
        validLocalData.forEach(trx => {
          if (trx.sync_session_id) {
            uniqueTransactions.set(trx.sync_session_id, trx);
          }
        });

        // Add remote transactions if they don't exist locally
        validRemoteData.forEach(trx => {
          if (trx.sync_session_id && !uniqueTransactions.has(trx.sync_session_id)) {
            uniqueTransactions.set(trx.sync_session_id, trx);
          }
        });

        // Convert Map values back to array and sort by created_at
        const mergedData = Array.from(uniqueTransactions.values())
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setFailedTrx(mergedData);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error(
          "Failed to fetch failed transactions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    getFailedTrx();
  }, [sessionId]);

  const downloadCSV = (data: TransactionSync[]) => {
    const headers = [
      'ID',
      'Sync Session ID',
      'Customer Name',
      'Customer Email',
      'Receipt No',
      'Total Amount',
      'Error Message',
      'Created At',
      'Source'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.id,
        row.sync_session_id,
        row.customer_name,
        row.customer_email,
        row.receipt_no,
        row.total,
        row.error_message,
        new Date(row.created_at).toLocaleString(),
        row.source
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `failed_transactions_${new Date().toISOString()}.csv`);
  };

  const downloadExcel = (data: TransactionSync[]) => {
    const worksheetData = data.map(row => ({
      ID: row.id,
      'Sync Session ID': row.sync_session_id,
      'Customer Name': row.customer_name,
      'Customer Email': row.customer_email,
      'Receipt No': row.receipt_no,
      'Total Amount': row.total,
      'Error Message': row.error_message,
      'Created At': new Date(row.created_at).toLocaleString(),
      'Source': row.source
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });
    saveAs(blob, `failed_transactions_${new Date().toISOString()}.xlsx`);
  };

  const handleDownload = async (fileType: "csv" | "excel") => {
    setLoading(true);
    try {
      if (fileType === "csv") {
        downloadCSV(failedTrx);
      } else {
        downloadExcel(failedTrx);
      }
    } catch (error) {
      console.error(error);
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

      <FailedTransactionTable failedTrx={failedTrx} />
    </div>
  );
};

export default FailedTransaction;

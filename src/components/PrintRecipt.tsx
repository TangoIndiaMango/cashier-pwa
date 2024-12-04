import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReceiptProps {
  data: {
    paymentMethods: string[];
    totalAmount: number;
    customer: any;
    status: string;
    items: any[];
    discount: number | null;
    discountAmount: number;
    noDiscountAmount: number;
  };
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ data, onClose }) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  // console.log(data);

  const printReceipt = () => {
    const printFrame = printFrameRef.current;
    if (printFrame) {
      const printContent =
        document.getElementById("receipt-content")?.innerHTML;
      const printDocument = printFrame.contentDocument;
      if (printDocument) {
        printDocument.open();
        printDocument.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @page {
                  size: 58mm auto;
                  margin: 0;
                }
                @media print {
                  body {
                    width: 58mm;
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    margin: 0 auto;
                    padding: 5px;
                    line-height: 1.2;
                    text-align: center;
                    height: 100%;
                  }
                  * {
                    box-sizing: border-box;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px 0;
                  }
                  th, td {
                    padding: 2px;
                    text-align: left;
                    font-size: 8px;
                    border: none;
                  }
                  th {
                    border-bottom: 1px dashed #000;
                    font-weight: bold;
                  }
                  .price, .amount {
                    text-align: right;
                  }
                  hr {
                    border: none;
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                  }
                  .text-center {
                    text-align: center;
                  }
                  .font-bold {
                    font-weight: bold;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printDocument.close();

        // Slight delay to ensure content is loaded
        setTimeout(() => {
          printFrame.contentWindow?.print();
        }, 100);
      }
    }
  };

  return (
    
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <ScrollArea className="w-full md:h-[600px] max-w-lg p-4 bg-white rounded-lg">
      <div className="w-full p-4 ">
        <div
          id="receipt-content"
          className="mb-4 font-mono text-xs text-center"
          style={{
            maxWidth: "58mm",
            margin: "0 auto",
            fontFamily: "'Courier New', monospace",
          }}
        >
          <h2 className="mb-2 text-sm font-bold text-center">
            Persiana Retail Ltd.
          </h2>
          <p>PALMS SHOPPING MALL</p>
          <p>BIS WAY</p>
          <p>Email: lacoste@persianaretail.com</p>
          <p>TIN: 10213154-001</p>
          <p>Customer Care Line: 08188830487</p>
          <p>08080558055</p>
          <hr className="my-2 border-t border-dashed" />

          <div className="text-left">
            <p>Receipt No: {data.status}</p>
            <p>Date/Time: {new Date().toLocaleString()}</p>
            <p>
              Client Name: {data.customer.firstname} {data.customer.lastname}
            </p>
            <p>Cashier: [Cashier Name]</p>
          </div>

          <hr className="my-2 border-t border-dashed" />

          <table>
            <thead>
              <tr>
                <th>QTY</th>
                <th>BARCODE</th>
                <th>DESC</th>
                <th className="price">PRICE</th>
                <th className="amount">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.quantity}</td>
                  <td>{item.ean}</td>
                  <td>{item.product_name}</td>
                  <td className="price">{item.retail_price?.toFixed(2)}</td>
                  <td className="amount">
                    {(item.retail_price * item.quantity)?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="my-2 border-t border-dashed" />

          <div className="text-left">
            <p>
              Total QTY:{" "}
              {data.items.reduce((acc, item) => acc + item.quantity, 0)}
            </p>
            <p>Subtotal: {data.noDiscountAmount.toFixed(2)}</p>
            <p>Total: {data.totalAmount.toFixed(2)}</p>
            <p>VAT(5%) Included</p>
          </div>

          <hr className="my-2 border-t border-dashed" />

          <div>
            <p>Points Gained in Purchase: 0</p>
            <p>Points Used in Purchase: 0</p>
            <p>New Accumulated Points: 0</p>
          </div>

          <hr className="my-2 border-t border-dashed" />

          <div className="text-xs">
            <p>No Exchange/Refund on 'Sale Items'.</p>
            <p>
              Exchange on regular items is permitted within 7 days from invoice
              date accompanied by the original invoice and returned in saleable
              condition.
            </p>
            <p>
              No Exchange in Lingerie/Bodywear items due to Hygiene Reasons.
            </p>
          </div>

          <p className="mt-4 font-bold">THANK YOU FOR SHOPPING AT LACOSTE</p>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={printReceipt}
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Print Receipt
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
      <iframe ref={printFrameRef} style={{ display: "none" }} />
      </ScrollArea>
      
    </div>
  );
};

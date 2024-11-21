import React, { useRef } from 'react';

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

  const printReceipt = () => {
    const printFrame = printFrameRef.current;
    if (printFrame) {
      const printContent = document.getElementById('receipt-content')?.innerHTML;
      const printDocument = printFrame.contentDocument;
      if (printDocument) {
        printDocument.open();
        printDocument.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @media print {
                  body {
                    width: 58mm;
                    font-family: 'Courier New', monospace;
                    font-size: 8px;
                    margin: 0;
                    padding: 0;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  th, td {
                    padding: 2px;
                    text-align: left;
                  }
                  th {
                    border-bottom: 1px dashed #000;
                  }
                  td.amount, td.price {
                    text-align: right;
                  }
                  hr {
                    border: none;
                    border-top: 1px dashed #000;
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
        printFrame.contentWindow?.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-4 bg-white rounded-lg">
        <div id="receipt-content" className="mb-4 font-mono text-xs">
          <h2 className="mb-2 font-bold text-center">Persiana Retail Ltd.</h2>
          <p className="text-center">PALMS SHOPPING MALL</p>
          <p className="text-center">BIS WAY</p>
          <p className="text-center">Email: lacoste@persianaretail.com</p>
          <p className="text-center">TIN: 10213154-001</p>
          <p className="text-center">Customer Care Line: 08188830487</p>
          <p className="text-center">08080558055</p>
          <hr className="my-2 border-t border-dashed" />
          <p>Receipt No: {data.status}</p>
          <p>Date/Time: {new Date().toLocaleString()}</p>
          <p>Client Name: {data.customer.firstname} {data.customer.lastname}</p>
          <p>Cashier: [Cashier Name]</p>
          <hr className="my-2 border-t border-dashed" />
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>QTY</th>
                <th>BARCODE</th>
                <th>DESCRIPTION</th>
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
                  <td className="price">{item.retail_price}</td>
                  <td className="amount">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="my-2 border-t border-dashed" />
          <p>Total QTY: {data.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
          <p>Subtotal: {data.noDiscountAmount}</p>
          <p>Total: {data.totalAmount}</p>
          <p>VAT(5%) Included</p>
          <hr className="my-2 border-t border-dashed" />
          <p>Points Gained in Purchase: 0</p>
          <p>Points Used in Purchase: 0</p>
          <p>New Accumulated Points: 0</p>
          <hr className="my-2 border-t border-dashed" />
          <p className="text-xs">No Exchange/Refund on 'Sale Items'.</p>
          <p className="text-xs">Exchange on regular items is permitted within 7 days from invoice date accompanied by the original invoice and returned in saleable condition.</p>
          <p className="text-xs">No Exchange in Lingerie/Bodywear items due to Hygiene Reasons.</p>
          <p className="mt-4 font-bold text-center">THANK YOU FOR SHOPPING AT LACOSTE</p>
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={printReceipt} className="px-4 py-2 text-white bg-blue-500 rounded">
            Print Receipt
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
      <iframe ref={printFrameRef} style={{ display: 'none' }} />
    </div>
  );
};


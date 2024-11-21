import React from "react";

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
  const printReceipt = () => {
    const printContent = document.getElementById("receipt-content")?.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Receipt</title>");
      printWindow.document.write(
        "<style>@media print { body { width: 58mm; font-family: monospace; font-size: 10px; } }</style>"
      );
      printWindow.document.write("</head><body>");
      printWindow.document.write(printContent || "");
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-4 bg-white rounded-lg">
        <div id="receipt-content" className="mb-4 text-xs">
          <h2 className="mb-2 font-bold text-center">Persiana Retail Ltd.</h2>
          <p className="text-center">PALMS SHOPPING MALL</p>
          <p className="text-center">BIS WAY</p>
          <p className="text-center">Email: lacoste@persianaretail.com</p>
          <p className="text-center">TIN: 10213154-001</p>
          <p className="text-center">Customer Care Line: 08188830487</p>
          <p className="text-center">08080558055</p>
          <hr className="my-2" />
          <p>Receipt No: {data.status}</p>
          <p>Date/Time: {new Date().toLocaleString()}</p>
          <p>
            Client Name: {data.customer.firstname} {data.customer.lastname}
          </p>
          <p>Cashier: [Cashier Name]</p>
          <hr className="my-2" />
          <p>QTY BARCODE DESCRIPTION PRICE AMOUNT</p>
          <ul className="list-none">
            {data.items.map((item, index) => (
              <li key={index}>
                {item.quantity} {item.ean} {item.product_name}{" "}
                {item.retail_price} {item.amount}
              </li>
            ))}
          </ul>
          <hr className="my-2" />
          <p>
            Total QTY:{" "}
            {data.items.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
          <p>Subtotal: {data.noDiscountAmount}</p>
          <p>Total: {data.totalAmount}</p>
          <p>VAT(5%) Included</p>
          <hr className="my-2" />
          <p>Points Gained in Purchase: 0</p>
          <p>Points Used in Purchase: 0</p>
          <p>New Accumulated Points: 0</p>
          <hr className="my-2" />
          <p>No Exchange/Refund on 'Sale Items'.</p>
          <p>
            Exchange on regular items is permitted within 7 days from invoice
            date accompanied by the original invoice and returned in saleable
            condition.
          </p>
          <p>No Exchange in Lingerie/Bodywear items due to Hygiene Reasons.</p>
          <p className="mt-4 text-center">THANK YOU FOR SHOPPING AT LACOSTE</p>
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
    </div>
  );
};

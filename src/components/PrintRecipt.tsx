import { ScrollArea } from "@/components/ui/scroll-area";
import { useApplyPoints } from "@/hooks/useApplyPoints";
import { useStore } from "@/hooks/useStore";
import React, { useRef, useEffect, useState } from "react";

interface ReceiptProps {
  data: {
    recieptNo: string;
    paymentMethods: any[];
    totalAmount: number;
    customer: any;
    status: string;
    items: any[];
    loyaltyPoints: any;
    creditNotePoints: any;
    discount: any;
    discountAmount: number;
    noDiscountAmount: number;
    originalTotal: number;
    prodDiscountTotal: number;
    subtotalBeforePoints: number;
  };
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ data, onClose }) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const { paymentMethod, customers } = useStore();
  const { clearPoints } = useApplyPoints();
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
                    font-weight: bold;
                  }
                  * {
                    box-sizing: border-box;
                  }
                  table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: collapse;
                    margin: 5px 0;
                  }
                  th, td {
                    padding: 4px 2px;
                    text-align: left;
                    font-size: 8px;
                    border: none;
                  }
                  td {
                    word-wrap: break-word;
                    font-weight: bold;
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
    clearPoints();
  };
  const [paymentMethods, setPaymentMethods] = useState(
    data.paymentMethods || []
  );

  useEffect(() => {
    const paymentData = data.paymentMethods.map((method) => {
      // Find the corresponding payment method in the store
      const matchedMethod = paymentMethod?.find(
        (method2) =>
          method2.id.toString() === method.mode_of_payment_id.toString()
      );

      if (matchedMethod) {
        return {
          ...method,
          name: matchedMethod?.name || "Unknown"
        };
      }
      return {
        ...method,
        name: "Unknown"
      };
    });

    setPaymentMethods(paymentData);
  }, [data.paymentMethods, paymentMethod]);

  const user = JSON?.parse(sessionStorage?.getItem("user") || "{}");
  // const store = user?.store[0];
  const store =
    Array.isArray(user?.store) && user?.store.length > 0
      ? user.store[0]
      : user?.store;
  // console.log(store);

  const getAccumulatedPoints = () => {
    // Get current loyalty points balance
    const currentLoyaltyPoints = Number(data.customer.loyalty_points) || 0;

    // Points used in this transaction
    const loyaltyPointsUsed = Number(data.loyaltyPoints) || 0;

    // Calculate points earned on the subtotal before any points deductions
    // This ensures customers earn points on the full purchase value
    // regardless of how they pay for it
    const pointsEarned = Number(data.subtotalBeforePoints * 0.02);

    // Calculate new total: 
    // Current balance - Points used + New points earned
    const newPointsBalance = currentLoyaltyPoints - loyaltyPointsUsed + pointsEarned;

    // Ensure we never go negative
    const finalPoints = Math.max(0, newPointsBalance);

    // Update the customers array
    customers.find((customer) => {
      if (customer.id === data.customer.id) {
        customer.loyalty_points = finalPoints;
      }
    });

    return finalPoints.toFixed(2);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center space-y-1 font-bold bg-black bg-opacity-50">
      <ScrollArea className="w-full md:h-[600px] max-w-lg p-4 bg-white rounded-lg">
        <div className="w-full p-4 ">
          <div
            id="receipt-content"
            className="mb-4 font-mono text-xs text-center"
            style={{
              maxWidth: "58mm",
              margin: "0 auto",
              fontFamily: "'Courier New', monospace"
            }}
          >
            <h2 className="mb-2 text-sm font-bold text-center">
              Persianas Retail Ltd.
            </h2>
            <p className="uppercase">{store.name}</p>
            <p className="uppercase">{`${store.location} ${store.state}, ${store.country}`}</p>
            <p>Email: {store?.email}</p>
            <p>TIN: 10213154-001</p>
            <p>Customer Care Line: 08188830487</p>
            <p>08080558055</p>
            <hr className="my-2 border-t border-dashed" />

            <div className="text-left">
              <p>Receipt No: {data?.recieptNo}</p>
              <p>Date/Time: {new Date().toLocaleString()}</p>
              <p>
                Client Name: {data?.customer?.firstname}{" "}
                {data?.customer?.lastname}
              </p>
              <p>
                Cashier: [{user?.firstname} {user?.lastname}]
              </p>
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

                  {data.items.some(
                    (item) => item.discount && item.discount.value > 0
                  ) && <th className="discount">DISCOUNT</th>}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.quantity}</td>
                    <td>{item.ean}</td>
                    <td className="line-clamp-1">{item.product_name}</td>
                    <td className="price">{item.retail_price?.toFixed(2)}</td>
                    <td className="amount">
                      {(item.retail_price * item.quantity)?.toFixed(2)}
                    </td>

                    {item.discount && item.discount.value > 0 && (
                      <td>{Number(item.discount.value).toFixed(1)}%</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <hr className="my-2 border-t border-dashed" />

            <div className="px-3 space-y-1 text-left ">
              <p>
                Total QTY:{" "}
                {data.items.reduce((acc, item) => acc + item.quantity, 0)}
              </p>
              <p>Subtotal: {data?.originalTotal?.toFixed(2)}</p>
              <p>Total: {data?.totalAmount?.toFixed(2)}</p>
              <div>
                {paymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.mode_of_payment_id} className="">
                    <p>
                      {paymentMethod.name}: <span>{paymentMethod.amount}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {data.discount && data.discount.value > 0 && (
              <p>
                Overall Discount: {Number(data?.discount?.value).toFixed(1)}%
              </p>
            )}
            <p>VAT(5%) Included</p>

            <hr className="my-2 border-t border-dashed" />

            <div>
              <p>
                Points Gained in Purchase:{" "}
                {Number(data.totalAmount * 0.02) || 0}
              </p>
              <p>Points Used in Purchase: {data?.loyaltyPoints || 0}</p>
              <p>New Accumulated Points: {getAccumulatedPoints()}</p>
            </div>

            {data?.creditNotePoints && data?.creditNotePoints > 0 && (
              <div>
                <p>Credit Note Points: {data?.creditNotePoints}</p>
              </div>
            )}

            <hr className="my-2 border-t border-dashed" />

            <div className="text-xs">
              <p>No Exchange/Refund on 'Sale Items'.</p>
              <p>
                Exchange on regular items is permitted within 7 days from
                invoice date accompanied by the original invoice and returned in
                saleable condition.
              </p>
              <p>
                No Exchange in Lingerie/Bodywear items due to Hygiene Reasons.
              </p>
            </div>

            <p className="mt-4 font-bold uppercase">
              THANK YOU FOR SHOPPING AT {store.name}
            </p>
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

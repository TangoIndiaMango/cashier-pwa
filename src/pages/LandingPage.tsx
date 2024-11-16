import CustomerComponent from "@/components/CustomerInfo";
import CustomerDisplay from "@/components/CustomerInfoCard";
import PaymentMethodModal from "@/components/Modals/PaymentModal";
import ProductSearchModal from "@/components/Modals/ProductSearchModal";
import { CurrentProductTable } from "@/components/ProductTransactionTable.tsx";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { usePayment } from "@/hooks/usePayment";
import { useTransaction } from "@/hooks/useTransaction";
import { LocalCustomer } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

const POSSystem = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { cartItems, addProductToCart, setCartItems, total, setTotal } =
    useCart();
  const { transactions, submitTransaction } = useTransaction();
  const {
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    handlePaymentSubmit,
    setPaymentMethod,
  } = usePayment();
  const { customer, handleAddCustomer, setCustomer } = useCustomer();

  const handleAdd = (product: any) => {
    const exisitingItem = cartItems.find(
      (item) => item.product_code === product.product_code
    );
    if (exisitingItem) {
      alert("Product already exist increase quantity");
      return;
    } else {
      addProductToCart(product);
    }
  };

  const handleSubmit = async () => {
    const data = {
      paymentMethods: paymentMethod,
      totalAmount: total,
      customer: customer as LocalCustomer,
      status: paymentStatus ? paymentStatus.toUpperCase() : "DRAFT",
      items: cartItems,
    };
    console.log(data);

    await submitTransaction(data);
    setTotal(0);
    setCartItems([]);
    setPaymentMethod([]);
    setCustomer(null);
    setPaymentStatus(null);

    alert("Transaction completed successfully!");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6 space-y-6">
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Current Transaction</h1>
            <p className="text-gray-600">
              You're viewing the current transaction below
            </p>
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search for a product..."
                className="w-64 py-2 pl-10 pr-4 border rounded-lg"
                onClick={() => setShowAddProduct(true)}
              />
            </div>
            <button
              // onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg"
            >
              Scan barcode
            </button>
          </div>
        </header>

        {/* Product Table */}
        <div className="flex-1 p-6 bg-white rounded-lg shadow">
          {!transactions ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={48} />
              <p className="mt-2">No data available</p>
            </div>
          ) : (
            <div className="w-full">
              <CurrentProductTable
                data={cartItems}
                setCartItems={setCartItems}
              />
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="p-6 bg-white rounded-lg shadow">
          <CustomerComponent onAddCustomer={handleAddCustomer} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="p-6 space-y-12 bg-white border-l w-96">
        {/* <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItemFromCart}
        /> */}

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Discount or Promotion Code
            </h3>
            <input
              type="text"
              placeholder="Enter code"
              className="w-full p-2 border rounded-lg"
            />
            <button className="mt-2 text-blue-600">Apply Code</button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(total, "NGN")}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatCurrency(total, "NGN")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-2 text-white bg-blue-600 rounded-lg"
            >
              Select payment method
            </button>
            <select
              className="w-full p-2 border rounded-lg"
              value={paymentStatus || "Draft"}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option>Order Status</option>
              <option>Draft</option>
              <option>Completed</option>
            </select>
            <Button onClick={handleSubmit} className="w-full py-2">
              Submit & Print Receipt
            </Button>
            <Button className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg">
              Submit & Print Gift Receipt
            </Button>
          </div>
        </div>

        <CustomerDisplay customer={customer} />
      </div>

      <ProductSearchModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onAddProduct={handleAdd}
        fileredProduct={null}
      />

      <PaymentMethodModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default POSSystem;

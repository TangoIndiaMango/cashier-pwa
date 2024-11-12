import PaymentMethodModal from "@/components/Modals/PaymentModal";
import ProductSearchModal from "@/components/Modals/ProductSearchModal";
import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

// Dummy data for products and customers
const dummyProducts = [
  {
    id: 1,
    name: "T-Shirt",
    code: "TS001",
    price: 2500,
    size: "L",
    color: "Blue",
    stock: 50
  },
  {
    id: 2,
    name: "Jeans",
    code: "JN001",
    price: 5000,
    size: "32",
    color: "Black",
    stock: 30
  }
];

const dummyCustomers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    age: 30,
    phone: "1234567890",
    email: "john@example.com"
  }
];

// Main POS Component
const POSSystem = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>([]);

  const [total, setTotal] = useState(0);

  const handleAddProduct = (product) => {
    setCurrentTransaction([...currentTransaction, product]);
    setTotal(total + product.total);
  };

  return (
    <div className="flex h-screen bg-gray-100">
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

        {/* Transaction Table */}
        <div className="flex-1 p-6 bg-white rounded-lg shadow">
          {currentTransaction.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag size={48} />
              <p className="mt-2">No data available</p>
            </div>
          ) : (
            <table className="w-full">{/* Add table content here */}</table>
          )}
        </div>

        {/* Customer Information */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Customer Information</h2>
            <div className="relative">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search for customer..."
                className="w-64 py-2 pl-10 pr-4 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipient's First Name
              </label>
              <input
                type="text"
                className="block w-full p-2 mt-1 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipient's Last Name
              </label>
              <input
                type="text"
                className="block w-full p-2 mt-1 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select className="block w-full p-2 mt-1 border rounded-lg">
                <option>--Select gender--</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                className="block w-full p-2 mt-1 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="p-6 bg-white border-l w-96">
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
              <span>0</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦0.00</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>₦0.00</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-2 text-white bg-blue-600 rounded-lg"
            >
              Select payment method
            </button>
            <select className="w-full p-2 border rounded-lg">
              <option>Order Status</option>
              <option>Draft</option>
              <option>Completed</option>
            </select>
            <button className="w-full py-2 text-white bg-blue-600 rounded-lg">
              Submit & Print Receipt
            </button>
            <button className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg">
              Submit & Print Gift Receipt
            </button>
          </div>
        </div>
      </div>

      <ProductSearchModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onAddProduct={handleAddProduct}
      />

      <PaymentMethodModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
      />
    </div>
  );
};

export default POSSystem;

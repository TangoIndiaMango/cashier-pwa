import CustomerComponent, { CustomerDetails } from "@/components/CustomerInfo";
import CustomerDisplay from "@/components/CustomerInfoCard";
import CustomerProfileCard from "@/components/CustomerProfile";
import LoyaltyModal from "@/components/Modals/LoyaltyModal";
import PaymentMethodModal from "@/components/Modals/PaymentModal";
import ProductSearchModal from "@/components/Modals/ProductSearchModal";
import { CurrentProductTable } from "@/components/ProductTransactionTable.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CustomSwitch } from "@/components/ui/switch";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { usePayment } from "@/hooks/usePayment";
import { useTransaction } from "@/hooks/useTransaction";
import { formatCurrency } from "@/lib/utils";

import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const POSSystem = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const {
    cartItems,
    addItemToCart,
    cartRecords,
    clearCart,
    handleCartTotalDiscount,
    cartDiscountCode,
    setCartDiscountCode
  } = useCart();

  const [showCartDiscount, setShowCartDiscount] = useState(false);

  const { submitTransaction, deleteTransaction } = useTransaction();
  // console.log(transactions);
  const {
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    handlePaymentSubmit,
    setPaymentMethod
  } = usePayment();

  const { customer, handleAddCustomer, setCustomer } = useCustomer();
  const [selectedCustomer, setSelectedCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstname: "",
    lastname: "",
    gender: null,
    age: null,
    phoneno: null,
    email: "",
    country: null,
    state: null,
    city: null,
    address: null
  });

  const [withCreditNote, setWithCreditNote] = useState(false);
  const [withLoyalty, setWithLoyalty] = useState(false);

  // console.log(cartDiscountCode);
  // console.log(cartRecords);
  // console.log(cartItems)
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!paymentMethod.length) {
      return toast.error("No payment method selected");
    }
    const data = {
      paymentMethods: paymentMethod,
      totalAmount: cartRecords.total,
      customer: customerDetails as any,
      status: paymentStatus ? paymentStatus.toUpperCase() : "DRAFT",
      items: cartItems,
      discount: cartDiscountCode ? cartRecords?.discount : null,
      discountAmount: cartRecords?.total,
      noDiscountAmount: cartRecords?.prevTotal
    };
    console.log(data);

    await submitTransaction(data as any);
    clearCart();
    setPaymentMethod([]);
    setCustomer(null);
    setCustomerDetails({
      firstname: "",
      lastname: "",
      gender: null,
      age: null,
      phoneno: null,
      email: "",
      country: null,
      state: null,
      city: null,
      address: null
    });
    setPaymentStatus(null);
    setSearchQuery("")

    toast.success("Transaction completed successfully!");
  };

  const handleCreditNote = (c) => {
    console.log(c);
  };

  const handleLoyalty = (checked) => {
    if (!selectedCustomer) return toast.error("No customer selected");

    setWithLoyalty(checked);
  };

  return (
    <div className="grid w-full h-full grid-cols-1 p-6 md:grid-cols-3">
      {/* Main Content */}
      <div className="w-full p-3 space-y-6 md:col-span-2">
        {/* Header Section */}
        <header className="flex items-center justify-between w-full">
          <h1 className="flex-1 text-2xl font-bold">Orders</h1>
          <Button onClick={() => deleteTransaction()}>Cear Tranactions</Button>
        </header>

        {/* Product Table */}
        <div className="flex-1 w-full p-3 space-y-10 bg-white border rounded-lg shadow-sm h-fit">
          <div className="flex items-center justify-between w-full gap-5 h-fit">
            <div>
              <h1 className="text-xl font-bold">Current Transaction</h1>
              <p className="text-gray-600">
                You're viewing the current transaction below
              </p>
            </div>

            <div className="flex flex-wrap justify-end w-full gap-4">
              <div className="relative">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search for a product..."
                  className="w-full py-2 pl-10 pr-4 border rounded-lg md:w-64"
                  onClick={() => setShowAddProduct(true)}
                />
              </div>
              <Button
                size="lg"
                className="text-white bg-[#303f9e] hover:bg-[#303f9e] rounded-lg"
              >
                Scan barcode
              </Button>
            </div>
          </div>
          {cartItems.length > 0 ? (
            <div className="w-full">
              <CurrentProductTable />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center gap-5 text-gray-500">
                <ShoppingBag size={48} />
                <p className="mt-2 text-[#303f9e]">No data available</p>
              </div>
            </>
          )}
        </div>

        {/* Customer Information */}
        <div className="p-6 space-y-5 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Customer Information</h2>
              <p className="text-sm">Input customer information below</p>
            </div>
            <div className="relative">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                type="text"
                name="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for customer..."
                className="w-full py-2 !pl-10 pr-4 border rounded-lg md:w-64"
              />
            </div>
          </div>
          {selectedCustomer && customer !== null ? (
            <CustomerProfileCard
              customer={customer}
              handleRemove={() => {
                setCustomer(null);
                setSelectedCustomer(false);
                setSearchQuery("")
                setCustomerDetails({
                  firstname: "",
                  lastname: "",
                  gender: null,
                  age: null,
                  phoneno: null,
                  email: "",
                  country: null,
                  state: null,
                  city: null,
                  address: null
                });
              }}
            />
          ) : (
            <CustomerComponent
              setCustomerDetails={setCustomerDetails}
              searchQuery={searchQuery}
              customerDetails={customerDetails}
              handleInputChange={handleInputChange}
              setSelectedCustomer={setSelectedCustomer}
              onAddCustomer={handleAddCustomer}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="p-6 space-y-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-semibold ">
              Discount or Promotion Code
            </h1>
            <p>
              Enter a coupon code to apply, discounts are applied to line
              totals, before taxes.
            </p>
          </div>
          <div className="space-y-3">
            <Label className="mb-2">Discount or Promotion Code</Label>
            <Input
              type="text"
              placeholder="Enter code"
              className="w-full p-2 border rounded-lg"
              value={cartDiscountCode}
              onChange={(e) => setCartDiscountCode(e.target.value)}
            />
            <Button
              variant="lightblue"
              disabled={!cartDiscountCode || cartItems.length === 0}
              onClick={() => {
                handleCartTotalDiscount(cartDiscountCode);
                setShowCartDiscount(true);
              }}
              className="w-full py-2 rounded-lg"
            >
              Apply Code
            </Button>
          </div>
          {showCartDiscount ? (
            <div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Discount</span>
                <span className="text-sm font-medium line-through">
                  {formatCurrency(cartRecords.prevTotal, "NGN")}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span></span>
                <span className="text-sm font-medium">
                  {formatCurrency(cartRecords.total || "", "NGN")}
                </span>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Items</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Subtotal</span>
              <span className="text-sm font-medium">
                {formatCurrency(cartRecords.total, "NGN")}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-sm">TOTAL</span>
              <span className="text-sm font-medium">
                {formatCurrency(cartRecords.total, "NGN")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <CustomSwitch
              id="loyalty"
              checked={withLoyalty}
              label="Apply Loyalty Point"
              onCheckedChange={handleLoyalty}
            />
            <CustomSwitch
              id="credit-note"
              checked={withCreditNote}
              label="Apply Credit Note Point"
              onCheckedChange={handleCreditNote}
            />
          </div>

          <div className="space-y-4">
            <Button
              variant="lightblue"
              disabled={cartItems.length === 0}
              onClick={() => setShowPayment(true)}
              className="w-full py-2 rounded-lg"
            >
              Select payment method
            </Button>

            <div className="w-full">
              <Label>Select Order Status</Label>
              <Select
                name="status"
                value={paymentStatus || "draft"}
                onValueChange={(value) => setPaymentStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={cartItems.length === 0 || !paymentMethod.length}
              onClick={handleSubmit}
              className="w-full py-2"
            >
              Submit & Print Receipt
            </Button>
            <Button
              disabled={cartItems.length === 0}
              variant="lightblue"
              className="w-full py-2 rounded-lg"
            >
              Submit & Print Gift Receipt
            </Button>
          </div>
        </div>

        <CustomerDisplay customer={customer} />
      </div>

      <ProductSearchModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onFullfield={addItemToCart}
        fileredProduct={null}
      />

      <PaymentMethodModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        total={cartRecords.total}
        onPaymentSubmit={handlePaymentSubmit}
      />

      <LoyaltyModal open={withLoyalty} onOpenChange={setWithLoyalty} />
      <LoyaltyModal
        open={withCreditNote}
        onOpenChange={setWithCreditNote}
        title="Apply Credit Note"
        desc="Enter a value to be deducted"
      />
    </div>
  );
};

export default POSSystem;

import BarcodeScanner from "@/components/BarcodeScanner";
import CustomerComponent, { CustomerDetails } from "@/components/CustomerInfo";
import CustomerDisplay from "@/components/CustomerInfoCard";
import CustomerProfileCard from "@/components/CustomerProfile";
import CreditNote from "@/components/Modals/CreditNoteModal";
import LoyaltyModal from "@/components/Modals/LoyaltyModal";
import PaymentMethodModal from "@/components/Modals/PaymentModal";
import ProductSearchModal from "@/components/Modals/ProductSearchModal";
import { Receipt } from "@/components/PrintRecipt";
import { CurrentProductTable } from "@/components/ProductTransactionTable.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomSwitch } from "@/components/ui/switch";
import { useApplyPoints } from "@/hooks/useApplyPoints";
import { useCart } from "@/hooks/useCart";
import { useCustomer } from "@/hooks/useCustomer";
import { usePayment } from "@/hooks/usePayment";
import { useTransaction } from "@/hooks/useTransaction";
import {
  formatCurrency,
  generateUniqueIdUsingStoreIDAsPrefix,
} from "@/lib/utils";

import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const initCustomer = {
  firstname: "",
  lastname: "",
  gender: null,
  age: null,
  phoneno: null,
  email: "",
  country: null,
  state: null,
  city: null,
  address: null,
  loyalty_points: null,
  credit_note_balance: null,
  id: null,
};

const POSSystem = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();
  const {
    cartItems,
    addItemToCart,
    cartRecords,
    clearCart,
    handleCartTotalDiscount,
    cartDiscountCode,
    setCartDiscountCode,
  } = useCart();

  const [showCartDiscount, setShowCartDiscount] = useState(false);

  const { submitTransaction } = useTransaction();
  // console.log(transactions);
  const {
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    handlePaymentSubmit,
    setPaymentMethod,
  } = usePayment();

  const { customer, handleAddCustomer, setCustomer } = useCustomer();
  const [selectedCustomer, setSelectedCustomer] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetails>(initCustomer);

  const [withCreditNote, setWithCreditNote] = useState(false);
  const [withCreditNoteModal, setWithCreditNoteModal] = useState(false);
  const [withLoyalty, setWithLoyalty] = useState(false);
  const [withLoyaltyModal, setWithLoyaltyModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const { loyaltyPoints, setLoyaltyPoints, setNewLoyaltyPoints } =
    useApplyPoints((state) => state);
  const { creditNotePoints, setCreditNotePoints, setNewCreditNotePoints } =
    useApplyPoints((state) => state);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const storeInfo = userInfo.store;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!paymentMethod.length) {
      return toast.error("No payment method selected");
    }
    const data = {
      recieptNo: generateUniqueIdUsingStoreIDAsPrefix(storeInfo[0].storeID),
      paymentMethods: paymentMethod,
      payableAmount: paymentMethod.reduce(
        (sum, entry) => sum + (Number(entry.amount) || 0),
        0
      ),
      totalAmount:
        cartRecords.total -
        (Number(loyaltyPoints) || 0) -
        (Number(creditNotePoints) || 0),
      originalTotal: cartRecords.actualTotal,
      store: storeInfo[0],
      customer: customerDetails as any,
      status: paymentStatus ? paymentStatus : "Completed",
      items: cartItems,
      loyaltyPoints: Number(loyaltyPoints) || 0,
      creditNotePoints: Number(creditNotePoints) || 0,
      discount: cartRecords?.discount,
      discountAmount:
        cartRecords.total -
        (Number(loyaltyPoints) || 0) -
        (Number(creditNotePoints) || 0),
      noDiscountAmount: cartRecords?.total,
    };

    await submitTransaction(data as any);
    setReceiptData(data as any);
    setShowReceipt(true);
    clearCart();
    setPaymentMethod([]);
    setCustomer(null);
    setCustomerDetails(initCustomer);
    setPaymentStatus(null);
    setSearchQuery("");
    setCartDiscountCode("");
    setLoyaltyPoints(0);
    setNewLoyaltyPoints(0);
    setCreditNotePoints(0);
    setNewCreditNotePoints(0);

    toast.success("Transaction completed successfully!");
    setWithLoyalty(false);
    setWithCreditNote(false);
  };

  const checkCustomerAndCart = () => {
    if (!selectedCustomer) {
      toast.error("No customer selected", {
        className: "bg-red-500 text-white",
      });
      return false;
    }
    if (cartItems?.length < 1) {
      toast.error("No products selected", {
        className: "bg-red-500 text-white",
      });
      return false;
    }

    return true;
  };

  const handleCreditNote = (checked: boolean) => {
    if (!checkCustomerAndCart()) return;

    if (checked) {
      if (!customer?.loyalty_points) {
        return toast.error("Sorry, No loyalty points", {
          className: "bg-red-500 text-white",
        });
      }

      setWithCreditNote(true);
      setWithCreditNoteModal(true);
    } else {
      console.log(loyaltyPoints);
      setCreditNotePoints(0);
      setWithCreditNote(false);
      // handleApplyLoyaltyPoints(Number(loyaltyPoints), true);
      toast.error("Credit Note points removed.", {
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleLoyalty = (checked: boolean) => {
    if (!checkCustomerAndCart()) return;

    if (checked) {
      if (!customer?.loyalty_points) {
        return toast.error("Sorry, No loyalty points", {
          className: "bg-red-500 text-white",
        });
      }

      setWithLoyalty(true);
      setWithLoyaltyModal(true);
    } else {
      console.log(loyaltyPoints);
      setLoyaltyPoints(0);
      setWithLoyalty(false);
      // handleApplyLoyaltyPoints(Number(loyaltyPoints), true);
      toast.error("Loyalty points removed.", {
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <>
      <div>
        {/* Header Section */}
        <header className="flex items-center justify-between w-full gap-5 p-5">
          <h1 className="flex-1 text-2xl font-bold">Orders</h1>
          <Button
            onClick={() => navigate("/failed-sync")}
            className="!bg-red-500"
          >
            Failed Sync
          </Button>
        </header>
      </div>

      <div className="grid w-full h-full grid-cols-1 p-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="w-full p-3 space-y-6 md:col-span-2">
          {/* Product Table */}
          <div className="flex-1 w-full p-5 space-y-10 bg-white border rounded-lg shadow-sm h-fit">
            <div className="md:flex items-center justify-between w-full gap-5 h-fit ">
              <div>
                <h1 className="text-xl font-bold text-nowrap">
                  Current Transaction
                </h1>
                <p className="text-sm text-gray-500">
                  Viewing current transaction
                </p>
              </div>

              <div className="md:flex flex-wrap justify-end w-full gap-4 mt-2 md:mt-0">
                <BarcodeScanner />
              </div>
            </div>
            <div className="relative w-full">
              <Search
                size={20}
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              />
              <input
                type="text"
                placeholder="Search for a product..."
                className="w-full py-[7px] pl-10 pr-4 border rounded-sm"
                onClick={() => setShowAddProduct(true)}
              />
            </div>
            {cartItems.length > 0 ? (
              <div className="w-full">
                <CurrentProductTable />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center  text-gray-500">
                <ShoppingBag size={48} />
                <p className="mt-2 text-gray-500 text-sm">No data available</p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="w-full p-6 space-y-5 bg-white border rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-4 md:flex-nowrap">
              <div className="w-full">
                <h2 className="text-xl font-semibold">Customer Information</h2>
                <p className="text-sm text-gray-500">
                  Input customer information below
                </p>
              </div>
            </div>
            <div className="relative w-full">
              <Search
                size={20}
                className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              />
              <Input
                type="text"
                name="searchQuery"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCustomer(null);
                  setCustomerDetails(initCustomer);
                  setLoyaltyPoints(0);
                  setCreditNotePoints(0);
                  setNewCreditNotePoints(0);
                  setNewLoyaltyPoints(0);
                }}
                placeholder="Search for customer..."
                className="w-full py-[10px] !pl-10 pr-4 border rounded-sm "
              />
            </div>
            {selectedCustomer && customer !== null ? (
              <CustomerProfileCard
                customer={customer}
                handleRemove={() => {
                  setCustomer(null);
                  setSelectedCustomer(false);
                  setSearchQuery("");
                  setCustomerDetails(initCustomer);
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
        <div className="w-full p-6 space-y-12">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold ">
                Discount or Promotion Code
              </h1>
              <p className="text-sm text-gray-500">
                Enter a coupon code to apply, discounts are applied to line
                totals, before taxes.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Items</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium">
                  {formatCurrency(cartRecords.actualTotal, "NGN")}
                </span>
              </div>
              <div className="h-[1px] bg-gray-200"></div>
              <div className="flex justify-between font-bold">
                <span className="text-[18px]">TOTAL</span>
                <span className="text-[18px] font-medium">
                  {formatCurrency(
                    cartRecords.total -
                      (Number(loyaltyPoints) || 0) -
                      (Number(creditNotePoints) || 0),
                    "NGN"
                  )}
                </span>
              </div>
            </div>
            <div className="space-y-3 ">
              <Label className="mb-2">Discount or Promotion Code</Label>
              <div className="flex items-center justify-between gap-2">
                <Input
                  type="text"
                  placeholder="Enter code"
                  className="w-full p-2 border rounded-lg"
                  value={cartDiscountCode}
                  onChange={(e) => setCartDiscountCode(e.target.value)}
                />
                <Button
                  disabled={!cartDiscountCode || cartItems.length === 0}
                  onClick={() => {
                    handleCartTotalDiscount(cartDiscountCode);
                    setShowCartDiscount(true);
                    setCartDiscountCode("");
                  }}
                  className="w-fit py-2 rounded-lg text-black"
                >
                  Apply
                </Button>
              </div>
            </div>
            {showCartDiscount ? (
              <div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Discount</span>
                  {cartRecords.prevTotal > 0 && (
                    <span className="text-sm font-medium line-through">
                      {formatCurrency(cartRecords.prevTotal, "NGN")}
                    </span>
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span></span>
                  <span className="text-sm font-medium">
                    {formatCurrency(cartRecords.total || "", "NGN")}
                  </span>
                </div>
              </div>
            ) : null}

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
                  value={paymentStatus || "Completed"}
                  onValueChange={(value) => setPaymentStatus(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem disabled value="default">
                      Select order status
                    </SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={
                  cartItems.length === 0 ||
                  !paymentMethod.length ||
                  !customerDetails.firstname ||
                  !customerDetails.lastname ||
                  !customerDetails.phoneno
                }
                onClick={handleSubmit}
                className="w-full py-2"
              >
                Submit & Print Receipt
              </Button>
              {/* <Button
                disabled={cartItems.length === 0}
                variant="lightblue"
                className="w-full py-2 rounded-lg"
              >
                Submit & Print Gift Receipt
              </Button> */}
            </div>
          </div>

          <CustomerDisplay customer={customer} />
        </div>
        {showReceipt && receiptData && (
          <Receipt data={receiptData} onClose={() => setShowReceipt(false)} />
        )}
        <ProductSearchModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onFullfield={addItemToCart}
          fileredProduct={null}
        />

        <PaymentMethodModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          total={
            cartRecords.total -
            (Number(loyaltyPoints) || 0) -
            (Number(creditNotePoints) || 0)
          }
          onPaymentSubmit={handlePaymentSubmit}
        />

        <LoyaltyModal
          open={withLoyaltyModal}
          onOpenChange={setWithLoyaltyModal}
          points={Number(customer?.loyalty_points)}
          total={Number(cartRecords.total)}
        />

        <CreditNote
          open={withCreditNoteModal}
          onOpenChange={setWithCreditNoteModal}
          points={Number(customer?.credit_note_balance)}
          total={Number(cartRecords.total)}
        />

        {/* <LoyaltyModal
          open={withCreditNoteModal}
          onOpenChange={setWithCreditNoteModal}
          title="Apply Credit Note"
          desc="Enter a value to be deducted"
          handleApplyPoints={handleApplyLoyaltyPoints}
          points={Number(customer?.credit_note_balance)}
        /> */}
      </div>
    </>
  );
};

export default POSSystem;

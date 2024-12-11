import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApplyPoints } from "@/hooks/useApplyPoints";
import { formatBalance } from "@/lib/utils";
import { useEffect } from "react";

const CustomerProfileCard = ({ customer, handleRemove }) => {
  // const loyaltyPoints = useApplyPoints((state) => state.loyaltyPoints);
  // const creditNotePoints = useApplyPoints((state) => state.creditNotePoints);

  const points = useApplyPoints((state) => state);
  const {
    creditNotePoints,
    loyaltyPoints,
    newLoyaltyPoints,
    newCreditNotePoints,
    setNewCreditNotePoints,
    setNewLoyaltyPoints
  } = useApplyPoints((state) => state);

  // Handle updating the points after subtraction
  const updatePoints = () => {
    const newLoyaltyPoints = Number(customer?.loyalty_points) - loyaltyPoints;
    const newCreditNotePoints =
      Number(customer?.credit_note_balance) - creditNotePoints;
    setNewLoyaltyPoints(newLoyaltyPoints);
    setNewCreditNotePoints(newCreditNotePoints);
  };

  // Call updatePoints to ensure the points are set after rendering
  useEffect(() => {
    updatePoints();
  }, [loyaltyPoints, creditNotePoints, newLoyaltyPoints, newCreditNotePoints]);

  return (
    <Card className="w-full p-6">
      <div className="flex flex-col gap-5 space-y-4 lg:flex-row lg:items-center lg:justify-between md:space-y-0">
        {/* Customer Name and Gender */}
        <div className="w-full">
          <h2 className="text-sm font-semibold text-gray-700 ">
            {customer?.firstname} {customer?.lastname}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Gender:</span>
            <span className="text-sm font-medium">
              {customer?.gender || "--"}
            </span>
          </div>
        </div>

        {/* Email Section */}
        <div className="flex-grow lg:mx-8">
          <div className="text-xs text-gray-600">Email</div>
          <div className="text-sm font-medium">{customer?.email || "--"}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center w-full gap-4 md:w-auto md:max-w-full">
          {/* <Button
            size="sm"
            className="text-sm bg-[#303F9E] hover:bg-[#263284] text-white px-6"
          >
            View Customer Profile
          </Button> */}
          <Button
            onClick={handleRemove}
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      </div>

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-4">
        <div>
          <div className="mb-1 text-sm text-gray-600">Age Range</div>
          <div className="text-xs font-medium">{customer?.age || "--"}</div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Phone</div>
          <div className="text-xs font-medium">{customer?.phoneno || "--"}</div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Loyalty Points</div>
          <div className="text-xs font-medium">
            {formatBalance(newLoyaltyPoints) || "--"}{" "}
            {loyaltyPoints > 0 && (
              <span className="text-[11px] line-through text-gray-500">
                {Number(customer?.loyalty_points)}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Credit Note Balance</div>
          <div className="text-xs font-medium">
            {formatBalance(newCreditNotePoints) || "--"}{" "}
            {creditNotePoints > 0 && (
              <span className="text-[11px] line-through text-gray-500">
                {Number(customer?.credit_note_balance)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerProfileCard;

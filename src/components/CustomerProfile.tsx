import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CustomerProfileCard = ({ customer, handleRemove }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* Customer Name and Gender */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 ">
            {customer.firstname}
            {customer.lastname}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Gender:</span>
            <span className="text-sm font-medium">{customer.gender || "--"}</span>
          </div>
        </div>

        {/* Email Section */}
        <div className="flex-grow md:mx-8">
          <div className="text-xs text-gray-600">Email</div>
          <div className="text-sm font-medium">{customer.email || "--"}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button size="icon" className="text-sm bg-[#303F9E] hover:bg-[#263284] text-white px-6">
            View Customer Profile
          </Button>
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
          <div className="text-xs font-medium">{customer.age || "--"}</div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Phone</div>
          <div className="text-xs font-medium">{customer.phoneno || "--"}</div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Loyalty Points</div>
          <div className="text-xs font-medium">
            {customer.apply_loyalty_point || "--"}
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm text-gray-600">Credit Note Balance</div>
          <div className="text-xs font-medium">
            ₦{customer.apply_credit_note_point || "--"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerProfileCard;

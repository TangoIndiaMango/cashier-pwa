import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { useStore } from "@/hooks/useStore";
import { LocalCustomer } from "@/lib/db/schema";
import React, { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";

// Define the types for customer details
export interface CustomerDetails {
  firstname: string;
  lastname: string;
  gender: string | null;
  age: number | null;
  phoneno: string | null;
  email: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  loyalty_points: number | string | null;
  credit_note_balance: number | string | null;
}

interface CustomerComponentProps {
  searchQuery: string; // Add searchQuery as a prop
  setCustomerDetails: (customerDetails: CustomerDetails) => void; // Function to pass data to parent
  handleInputChange: (e: any) => void;
  customerDetails: CustomerDetails;
  onAddCustomer: (customerDetails: CustomerDetails) => void;
  setSelectedCustomer: (t: boolean) => void;
}

const CustomerComponent: React.FC<CustomerComponentProps> = ({
  searchQuery,
  setCustomerDetails,
  handleInputChange,
  customerDetails,
  setSelectedCustomer,
  onAddCustomer,
}) => {
  const [filteredCustomers, setFilteredCustomers] = useState<LocalCustomer[]>(
    []
  );
  const { customers, loading } = useStore();

  const debouncedSearchTerm = useDebounce(searchQuery.toLowerCase(), 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = customers.filter((customer) => {
        if (!customer) return false;

        return (
          customer.firstname?.toLowerCase().includes(debouncedSearchTerm) ||
          customer.lastname?.toLowerCase().includes(debouncedSearchTerm) ||
          customer.email?.toLowerCase().includes(debouncedSearchTerm)
        );
      });
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [debouncedSearchTerm]);

  if (loading) {
    return <div>Loading....</div>;
  }

  // Handle selecting a customer
  const handleSelectCustomer = (customer: LocalCustomer) => {
    onAddCustomer(customer as any);
    setFilteredCustomers([]);
    setSelectedCustomer(true);
    setCustomerDetails({
      firstname: customer.firstname || "",
      lastname: customer.lastname || "",
      gender: customer.gender || "",
      age: customer.age || null,
      phoneno: customer.phoneno || "",
      email: customer.email || "",
      country: customer.country || "",
      state: customer.state || "",
      city: customer.city || "",
      address: customer.address || "",
      loyalty_points: customer?.loyalty_points,
      credit_note_balance: customer?.credit_note_balance,
    });
  };

  return (
    <>
      {/* Display filtered search results */}
      {filteredCustomers.length > 0 && (
        <div className="mt-4">
          <ul className="h-40 space-y-2 overflow-auto border rounded-sm">
            {filteredCustomers.map((customer) => (
              <li
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="p-2 text-sm capitalize rounded-lg cursor-pointer hover:bg-gray-200"
              >
                {customer.firstname} {customer.lastname} ({customer.email})
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <Label>Recipient's First Name</Label>
          <Input
            type="text"
            name="firstname"
            value={customerDetails.firstname}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Recipient's Last Name</Label>
          <Input
            type="text"
            name="lastname"
            value={customerDetails.lastname}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Gender</Label>
          <Select
            name="gender"
            value={customerDetails.gender || ""}
            onValueChange={(value) =>
              setCustomerDetails({ ...customerDetails, gender: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Age</Label>
          <Input
            name="age"
            value={customerDetails.age || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={customerDetails.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            name="phoneno"
            value={customerDetails.phoneno || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Country</Label>
          <Input
            type="text"
            name="country"
            value={customerDetails.country || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>State</Label>
          <Input
            type="text"
            name="state"
            value={customerDetails.state || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>City</Label>
          <Input
            type="text"
            name="city"
            value={customerDetails.city || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Address</Label>
          <Textarea
            name="address"
            value={customerDetails.address || ""}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between col-span-2">
          {/* <div className="flex items-center">
            <Checkbox
              checked={customerDetails.apply_loyalty_point}
              onCheckedChange={(checked) =>
                setCustomerDetails({
                  ...customerDetails,
                  apply_loyalty_point: checked as boolean,
                })
              }
            />
            <Label>Apply Loyalty Point</Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={customerDetails.apply_credit_note_point}
              onCheckedChange={(checked) =>
                setCustomerDetails({
                  ...customerDetails,
                  apply_credit_note_point: checked as boolean,
                })
              }
            />
            <Label>Apply Credit Note Point</Label>
          </div> */}
          {/* <Button
            onClick={handleAddCustomer}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Add Customer
          </Button> */}
        </div>
      </div>
    </>
  );
};

export default CustomerComponent;

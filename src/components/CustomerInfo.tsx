import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
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
  id?: number | string | null;
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
  onAddCustomer
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
          customer.email?.toLowerCase().includes(debouncedSearchTerm) || 
          customer.phoneno?.toLowerCase().includes(debouncedSearchTerm)
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
      id: customer?.id
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
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        <div>
          <Label htmlFor="firstname">Recipient's First Name</Label>
          <Input
            id="firstname"
            type="text"
            name="firstname"
            value={customerDetails.firstname}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="lastname">Recipient's Last Name</Label>
          <Input
            id="lastname"
            type="text"
            name="lastname"
            value={customerDetails.lastname}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            name="gender"
            value={customerDetails.gender || ""}
            onValueChange={(value) =>
              setCustomerDetails({ ...customerDetails, gender: value })
            }
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            value={customerDetails.age || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={customerDetails.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="phoneno">Phone Number</Label>
          <Input
            id="phoneno"
            type="tel"
            name="phoneno"
            value={customerDetails.phoneno || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={customerDetails.address || ""}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        {/*  <div className="flex items-center justify-between col-span-2">
      <div className="flex items-center">
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
      </Button> 
    </div>*/}
      </div>
    </>
  );
};

export default CustomerComponent;

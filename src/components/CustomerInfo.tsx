import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { useStore } from "@/hooks/useStore";
import useDebounce from "@/hooks/useDebounce";
import { LocalCustomer } from "@/lib/db/schema";

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
  apply_loyalty_point: boolean;
  apply_credit_note_point: boolean;
}

interface CustomerComponentProps {
  onAddCustomer: (customerDetails: CustomerDetails) => void; // Function to pass data to parent
}

const CustomerComponent: React.FC<CustomerComponentProps> = ({
  onAddCustomer
}) => {
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
    address: null,
    apply_loyalty_point: false,
    apply_credit_note_point: false
  });
  const [filteredCustomers, setFilteredCustomers] = useState<LocalCustomer[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { customers, loading } = useStore();
  // console.log(customers)

  // Use debounced value for the search term
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = customers.filter((customer) => {
        if (!customer) return false;
        return (
          customer.firstname
            ?.toLowerCase()
            .includes(debouncedSearchTerm?.toLowerCase()) ||
          customer.lastname
            ?.toLowerCase()
            .includes(debouncedSearchTerm?.toLowerCase()) ||
          customer.email
            ?.toLowerCase()
            .includes(debouncedSearchTerm?.toLowerCase())
        );
      });
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [debouncedSearchTerm, customers]);

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

  if (loading) {
    return <div>Loading....</div>;
  }

  console.log(filteredCustomers);
  // Handle adding customer details to parent
  const handleAddCustomer = () => {
    onAddCustomer(customerDetails);
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
      address: null,
      apply_loyalty_point: false,
      apply_credit_note_point: false
    });
  };

  // Handle selecting a customer
  const handleSelectCustomer = (customer: LocalCustomer) => {
    setCustomerDetails({
      firstname: customer.firstname,
      lastname: customer.lastname,
      gender: null,
      age: customer.age,
      phoneno: customer.phoneno,
      email: customer.email,
      country: null,
      state: null,
      city: null,
      address: "",
      apply_loyalty_point: false,
      apply_credit_note_point: false
    });
    setSearchQuery("");
    setFilteredCustomers([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Customer Information</h2>
        <div className="relative">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            type="text"
            name="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for customer..."
            className="w-64 py-2 pl-10 pr-4 border rounded-lg"
          />
        </div>
      </div>
      {/* Display filtered search results */}
      {filteredCustomers.length > 0 && (
        <div className="mt-4">
          <ul className="h-40 space-y-2 overflow-auto border rounded-sm">
            {filteredCustomers.splice(0, 9).map((customer) => (
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
            type="number"
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
          <div className="flex items-center">
            <Checkbox
              checked={customerDetails.apply_loyalty_point}
              onCheckedChange={(checked) =>
                setCustomerDetails({
                  ...customerDetails,
                  apply_loyalty_point: checked as boolean
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
                  apply_credit_note_point: checked as boolean
                })
              }
            />
            <Label>Apply Credit Note Point</Label>
          </div>
          <Button
            onClick={handleAddCustomer}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Add Customer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerComponent;

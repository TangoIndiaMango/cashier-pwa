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
import { LocalApi } from "@/lib/api/localApi";
import { LocalCustomer } from "@/lib/db/schema";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { getDbInstance } from "@/lib/db/db";
import { delay } from "@/lib/utils";

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
  setCreateUserClicked?: (t: boolean) => void;
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
  const { customers, loading, setLoading } = useStore();
  const [createNew, setCreateNew] = useState(false);

  const debouncedSearchTerm = useDebounce(searchQuery.toLowerCase(), 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = customers.filter((customer) => {
        if (!customer) return false;

        return (
          customer.firstname?.toLowerCase().includes(debouncedSearchTerm) ||
          customer.lastname?.toLowerCase().includes(debouncedSearchTerm) ||
          customer.email?.toLowerCase().includes(debouncedSearchTerm) ||
          customer.phoneno?.toString()?.includes(debouncedSearchTerm)
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
    console.log(customer);
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

  const handleCreateNew = async () => {
    const dbInstance = getDbInstance();
    const id = crypto.randomUUID()
    const updatedCustomerDetails: CustomerDetails = {
      ...customerDetails,
      id
    };
    try {
      setLoading(true);
      await LocalApi.createNewCustomerInfo(
        updatedCustomerDetails as Partial<LocalCustomer>
      );
      await dbInstance.openDatabase();
      await delay(2);
      const newCustomer = await dbInstance.customers.get(id);  

    if (newCustomer) {
      // Show success notification
      toast.success("Customer created successfully!");

      // Now that the customer is created, update the selected customer state
      // setSelectedCustomer(true);
      // setCustomerDetails({
      //   firstname: newCustomer.firstname || "",
      //   lastname: newCustomer.lastname || "",
      //   gender: newCustomer.gender || "",
      //   age: newCustomer.age || null,
      //   phoneno: newCustomer.phoneno || "",
      //   email: newCustomer.email || "",
      //   country: newCustomer.country || "",
      //   state: newCustomer.state || "",
      //   city: newCustomer.city || "",
      //   address: newCustomer.address || "",
      //   loyalty_points: newCustomer.loyalty_points,
      //   credit_note_balance: newCustomer.credit_note_balance,
      //   id: newCustomer.id
      // });
      handleSelectCustomer(newCustomer)
    }
    } catch (error) {
      console.log(error);
      toast.error(String(error));
      setLoading(false);
    }
    setLoading(false);
    setCreateNew(false);
  };

  const handleOnCreateCheckChange = () => {
    if (!customerDetails.firstname || !customerDetails.phoneno) {
      toast.error("Please fill in firstname, lastname and (phoneno or email)");
      return;
    }
    setCreateNew((prev) => !prev);
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
      <div className="grid w-full grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
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

          <div className="flex flex-col items-center w-full gap-5 py-3 justify-betwen sm:flex-row">
            <div className="flex items-center flex-1 py-3 space-x-2">
              <Checkbox
                id="new_customer"
                checked={createNew}
                onCheckedChange={handleOnCreateCheckChange}
              />
              <Label
                htmlFor="new_customer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Is new customer
              </Label>
            </div>
            {createNew && (
              <div className="flex items-center justify-end ">
                <Button onClick={handleCreateNew}>Create Customer</Button>
              </div>
            )}
          </div>
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

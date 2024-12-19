import React from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const CustomerDisplay = ({ customer }) => {
  if (!customer?.firstname) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-10 text-sm text-gray-500">
            No customer added yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="bg-green-200 ring-8 ring-green-100">
              <AvatarImage src="" />
              <AvatarFallback>
                {customer.firstname[0]}
                {customer.lastname[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-base font-medium capitalize">
                {customer.firstname} {customer.lastname}
              </h4>
              {customer.address && (
                <p className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {customer.address}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {customer.phoneno && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{customer.phoneno}</span>
              </div>
            )}

            {customer.email && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="line-clamp-1">{customer.email}</span>
              </div>
            )}
          </div>

          {(customer.apply_loyalty_point ||
            customer.apply_credit_note_point) && (
            <div className="pt-3 border-t">
              <div className="flex gap-3">
                {customer.apply_loyalty_point && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Loyalty Points
                  </span>
                )}
                {customer.apply_credit_note_point && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Credit Note
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDisplay;

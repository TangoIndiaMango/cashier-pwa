import React from "react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import { Badge } from "../ui/badge";
import { Wifi } from "lucide-react";

export const NetworkInfo: React.FC = () => {
  const { isOnline, networkType, rtt } = useOnlineStatus();

  // console.log(networkType, rtt);

  return (
    <>
      {/* <div className="hidden space-x-4 text-sm text-gray-600 sm:flex">
        <p>Network: {networkType}</p>
        <p>RTT: {rtt} ms</p>
      </div> */}
      <div className="flex items-center gap-2">
        <Wifi
          className={`w-5 h-5 lg:hidden ${
            isOnline ? "text-green-500" : "text-red-500"
          }`}
        />

        <Badge
          className="hidden lg:block"
          variant={`${isOnline ? "success" : "destructive"}`}
        >
          {isOnline ? <p>Online </p> : "Offline"}
        </Badge>
        {/* <p>{isOnline ? "Online" : "Offline"}</p> */}
      </div>
    </>
  );
};

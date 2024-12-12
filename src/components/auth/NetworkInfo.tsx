import React from 'react';
import { Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const NetworkInfo: React.FC = () => {
  const { isOnline, networkType, rtt } = useOnlineStatus();

  return (
    <>
      <div className="hidden space-x-4 text-sm text-gray-600 sm:flex">
        <p>Network: {networkType}</p>
        <p>RTT: {rtt} ms</p>
      </div>
      <div className="flex items-center gap-2">
        <Wifi
          className={`w-5 h-5 ${
            isOnline ? "text-green-500" : "text-red-500"
          }`}
        />
        <p>{isOnline ? "Online" : "Offline"}</p>
      </div>
    </>
  );
};


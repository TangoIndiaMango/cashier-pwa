import { useState, useEffect } from 'react';
import { NetworkInformation } from '../types/network-info';

interface OnlineStatus {
  isOnline: boolean;
  networkType: NetworkInformation['type'] | null;
  effectiveType: NetworkInformation['effectiveType'] | null;
  downlink: number | null;
  rtt: number | null;
}

export const useOnlineStatus = (): OnlineStatus => {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: navigator.onLine,
    networkType: navigator.connection?.type || null,
    effectiveType: navigator.connection?.effectiveType || null,
    downlink: navigator.connection?.downlink || null,
    rtt: navigator.connection?.rtt || null
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    const updateConnectionStatus = () => {
      const connection = navigator.connection;
      setStatus(prev => ({
        ...prev,
        networkType: connection?.type || null,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return status;
};
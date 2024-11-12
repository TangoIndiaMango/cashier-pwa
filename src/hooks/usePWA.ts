// src/hooks/usePWA.ts
import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface PWAStatus {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

export const usePWA = (): PWAStatus => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSWCallback, setUpdateSWCallback] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
    setUpdateSWCallback(() => updateSW);
    return () => {
      
    };
  }, []);
  const updateServiceWorker = async (reloadPage?: boolean): Promise<void> => {
    if (updateSWCallback) {
      await updateSWCallback(reloadPage);
    }
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  };
};

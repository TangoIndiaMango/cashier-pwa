import React from 'react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export const AppUpdateButton = () => {
  const { needRefresh, offlineReady, updateServiceWorker } = usePWA();

  if (!needRefresh && !offlineReady) return null;

  return (
    <>
      {needRefresh && (
        <Button
          onClick={() => updateServiceWorker(true)}
          className="px-3 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
        >
          Update App
        </Button>
      )}
      {offlineReady && (
        <span className="font-semibold text-green-500">
          App is offline ready!
        </span>
      )}
    </>
  );
};


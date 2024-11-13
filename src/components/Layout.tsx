// src/components/Layout.tsx
import { usePWA } from "@/hooks/usePWA";
import React from "react";
import { Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { useStore } from "@/hooks/useStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { FolderSync, Wifi } from "lucide-react";

const Layout: React.FC = () => {
  const { needRefresh, offlineReady, updateServiceWorker } = usePWA();
  const { isOnline, networkType, rtt } = useOnlineStatus();
  const { triggerSync } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">POS System</h1>
          <div className="hidden space-x-4 text-sm text-gray-600 sm:flex">
            <p>Network: {networkType}</p>
            <p>RTT: {rtt} ms</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {/* Online Status */}
          <div className="flex items-center gap-2">
            <Wifi
              className={`w-5 h-5 ${
                isOnline ? "text-green-500" : "text-red-500"
              }`}
            />
            <p>{isOnline ? "Online" : "Offline"}</p>
          </div>

          {/* Sync and App Update */}
          <div className="flex items-center space-x-2">
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

            <Button
              onClick={triggerSync}
              className="flex items-center px-3 py-2 space-x-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              <FolderSync className="w-4 h-4" />
              <span>Sync Now</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container px-4 py-8 mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

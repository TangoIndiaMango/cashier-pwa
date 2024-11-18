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
    <div className="w-screen min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b shadow-sm">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <img
            src="/persianas-logo-2.svg"
            alt="logo"
            className="h-10 md:h-10 lg:h-10 xl:h-12"
          />
          {/* Network Info (hidden on small screens) */}
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

          {/* Sync and App Update Buttons */}
          <div className="flex items-center space-x-2">
            {/* Update App Button */}
            {needRefresh && (
              <Button
                onClick={() => updateServiceWorker(true)}
                className="px-3 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
              >
                Update App
              </Button>
            )}

            {/* Offline Ready Status */}
            {offlineReady && (
              <span className="font-semibold text-green-500">
                App is offline ready!
              </span>
            )}

            {/* Sync Now Button */}
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
      <main className="container px-4 py-8 mx-auto ">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

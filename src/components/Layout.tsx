import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import { LocalApi } from "@/lib/api/localApi";
import { FolderSync, Loader2, LogOut, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import { NetworkInfo } from "./auth/NetworkInfo";
import { AppUpdateButton } from "./auth/UpdateBtn";
import { LogoutModal } from "./Modals/LogOutModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ModernLoadingScreen from "./LoadingScreen";

function getAbbreviation(firstName, lastName) {
  if (!firstName || !lastName) {
    throw new Error("Both first name and last name are required.");
  }

  return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
}

const Layout = () => {
  const { triggerSync, triggerFetch, triggerLocalFetch, loading } = useStore();
  const [unsyncedTransLength, setUnsyncedTransLength] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();
  const userInfo = JSON?.parse(localStorage?.getItem("user") || "{}");

  useEffect(() => {
    const fetchUnsyncedTrans = async () => {
      await triggerLocalFetch();
      const trnx = await LocalApi.getUnsynedTransactions();
      setUnsyncedTransLength(trnx.length);
    };

    fetchUnsyncedTrans();
  }, []);

  const handleModalOpen = async () => {
    await triggerLocalFetch();
    setIsLogoutModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLogoutModalOpen(false);
  };

  if (isLoading) {
    return <ModernLoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try again.</div>}
    >
      <div className="w-screen min-h-screen bg-white">
        <nav className="flex items-center justify-between w-full px-6 py-4 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src="/persianas-logo-2.svg"
              alt="logo"
              className="h-6 md:h-10 lg:h-10 xl:h-12"
            />
            <NetworkInfo />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600 w-fit">
            <AppUpdateButton />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={triggerFetch}
                    variant="lightblue"
                    disabled={loading}
                    aria-label="Refresh data"
                  >
                    {loading ? (
                      <RefreshCcw className="w-4 h-4 animate-pulse" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                    <span className="hidden lg:block">Refresh Now</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh App</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={triggerSync}
                    disabled={loading}
                    className="flex items-center px-3 py-2 space-x-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                    aria-label="Sync data"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderSync className="w-4 h-4" />
                    )}
                    <span className="hidden lg:block">Sync Now</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sync App</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="hidden lg:block">
              <AvatarImage src={userInfo?.image} />
              <AvatarFallback>
                {getAbbreviation(userInfo?.firstname, userInfo?.lastname)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="lightblue"
              onClick={handleModalOpen}
              aria-label="Open logout modal"
            >
              <LogOut />
            </Button>
          </div>
        </nav>

        <main className="container w-full mx-auto lg:py-8 lg:px-4 ">
          <Outlet />
        </main>

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={handleCloseModal}
          onLogout={logout}
          onSync={triggerSync}
          isLoading={loading}
          unsyncedTransactions={unsyncedTransLength}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;

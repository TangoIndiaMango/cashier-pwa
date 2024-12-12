import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from './ui/button';
import { useStore } from '@/hooks/useStore';
import { FeatherIcon, FolderSync, Loader2, LogOut } from 'lucide-react';
import { LogoutModal } from './Modals/LogOutModal';
import { LocalApi } from '@/lib/api/localApi';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from 'react-error-boundary';
import { NetworkInfo } from './auth/NetworkInfo';
import { AppUpdateButton } from './auth/UpdateBtn';

const Layout = () => {
  const { triggerSync, triggerFetch, triggerLocalFetch, loading } = useStore();
  const [unsyncedTransLength, setUnsyncedTransLength] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

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
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again.</div>}>
      <div className="w-screen min-h-screen bg-white">
        <nav className="flex items-center justify-between w-full px-6 py-4 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src="/persianas-logo-2.svg"
              alt="logo"
              className="h-10 md:h-10 lg:h-10 xl:h-12"
            />
            <NetworkInfo />
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 w-fit">
            <AppUpdateButton />
            
            <Button
              onClick={triggerFetch}
              variant="lightblue"
              disabled={loading}
              aria-label="Refresh data"
            >
              {loading ? (
                <FeatherIcon className="w-4 h-4 animate-pulse" />
              ) : (
                <FeatherIcon className="w-4 h-4" />
              )}
              <span>Refresh Now</span>
            </Button>

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
              <span>Sync Now</span>
            </Button>

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


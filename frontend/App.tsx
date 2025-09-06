import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";
// Internal Components
import { Header } from "@/components/Header";
import { RoleSelection } from "@/components/RoleSelection";
import { CreatorDashboard } from "@/components/CreatorDashboard";
import { StreamerDashboard } from "@/components/StreamerDashboard";
import { Marketplace } from "@/components/Marketplace";
import { MainPage } from "@/components/MainPage";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types";

function AppContent() {
  const { connected, account } = useWallet();
  const { userRole, setUserRole, setIsWalletConnected, user, setUser } = useUser();

  useEffect(() => {
    setIsWalletConnected(connected);
    if (connected && account) {
      // Handle different address formats from Aptos wallet
      let addressString = '';
      if (typeof account.address === 'string') {
        addressString = account.address;
      } else if (account.address && typeof account.address === 'object' && account.address.data) {
        addressString = account.address.data;
      } else if (account.address && typeof account.address === 'object' && account.address.toString) {
        addressString = account.address.toString();
      }

      setUser({
        address: addressString,
        role: userRole,
      });
    } else {
      setUser(null);
      setUserRole(null);
    }
  }, [connected, account, setIsWalletConnected, setUser, setUserRole]);

  const handleRoleSelected = (role: UserRole) => {
    setUserRole(role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  const handleNavigateToMarketplace = () => {
    setUserRole(null); // This will show the marketplace
  };

  if (!connected) {
    return <MainPage />;
  }

  // Show loading state while wallet is connecting
  if (connected && !user) {
    return (
      <div className="min-h-screen bg-citadel-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-citadel-orange mx-auto mb-4"></div>
          <p className="text-citadel-light-gray">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  // Show role selection if user hasn't chosen a role yet
  if (!userRole) {
    return (
      <>
        <Header />
        <RoleSelection onRoleSelected={handleRoleSelected} />
      </>
    );
  }

  // Show appropriate dashboard based on role
  if (userRole === 'creator') {
    return <CreatorDashboard />;
  }

  if (userRole === 'streamer') {
    return <StreamerDashboard />;
  }

  // Default to marketplace
  return <Marketplace />;
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;

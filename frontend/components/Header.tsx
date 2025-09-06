import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useUser } from "@/contexts/UserContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Store, User, LogOut } from "lucide-react";

export function Header() {
  const { userRole, setUserRole } = useUser();
  const { connected } = useWallet();

  const handleNavigateToMarketplace = () => {
    setUserRole(null);
  };

  const handleNavigateToDashboard = () => {
    // Keep current role to go back to dashboard
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
        <h1 className="text-2xl font-bold text-citadel-orange">Citadel</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <WalletSelector />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 py-4 max-w-screen-xl mx-auto w-full flex-wrap">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-citadel-orange">Citadel</h1>

          {userRole && (
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={handleNavigateToDashboard}
                className="text-citadel-dark-gray hover:text-citadel-orange font-medium transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleNavigateToMarketplace}
                className="text-citadel-dark-gray hover:text-citadel-orange font-medium transition-colors flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </button>
            </nav>
          )}
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          {userRole && (
            <span className="text-sm text-citadel-dark-gray bg-citadel-orange-light px-3 py-1 rounded-full capitalize">
              {userRole}
            </span>
          )}
          <WalletSelector />
        </div>
      </div>

      {/* Mobile Navigation */}
      {userRole && (
        <div className="md:hidden border-t border-citadel-orange-light">
          <div className="flex">
            <button
              onClick={handleNavigateToDashboard}
              className="flex-1 py-3 text-center text-citadel-dark-gray hover:text-citadel-orange font-medium transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={handleNavigateToMarketplace}
              className="flex-1 py-3 text-center text-citadel-dark-gray hover:text-citadel-orange font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

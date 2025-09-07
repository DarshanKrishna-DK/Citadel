import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useUser } from "@/contexts/UserContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Store, User, Crown, Shield, Zap, ShoppingCart } from "lucide-react";

export function Header() {
  const { userRole, setUserRole } = useUser();
  const { connected, account } = useWallet();

  const handleNavigateToMarketplace = () => {
    setUserRole(null);
  };

  const handleNavigateToDashboard = () => {
    // Keep current role to go back to dashboard
  };

  if (!connected) {
    return (
      <div className="bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-steel/30">
        <div className="flex items-center justify-between px-4 py-4 max-w-screen-xl mx-auto w-full flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center animate-glow-pulse">
              <Shield className="w-6 h-6 text-citadel-black" />
            </div>
            <h1 className="text-3xl font-bold citadel-heading">CITADEL</h1>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="citadel-btn-primary">
              <WalletSelector />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-steel/30 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-4 max-w-screen-xl mx-auto w-full flex-wrap">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center animate-glow-pulse">
              <Shield className="w-6 h-6 text-citadel-black" />
            </div>
            <h1 className="text-3xl font-bold citadel-heading">CITADEL</h1>
          </div>

          {userRole && (
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={handleNavigateToDashboard}
                className="citadel-btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
              >
                {userRole === 'creator' ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {userRole === 'creator' ? 'My Citadel' : 'Dashboard'}
              </button>
              <button
                onClick={handleNavigateToMarketplace}
                className="citadel-btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Store className="w-4 h-4" />
                The Hall
              </button>
            </nav>
          )}
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          {/* Cart Icon (placeholder for future cart functionality) */}
          {userRole === 'streamer' && (
            <button className="citadel-btn-secondary p-3 relative">
              <ShoppingCart className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-citadel-orange rounded-full flex items-center justify-center text-xs font-bold text-citadel-black">
                0
              </div>
            </button>
          )}

          {/* User Role Badge */}
          {userRole && (
            <div className="flex items-center gap-2 bg-citadel-steel/20 border border-citadel-orange/30 px-4 py-2 rounded-xl">
              {userRole === 'creator' ? (
                <Crown className="w-4 h-4 text-citadel-orange" />
              ) : (
                <Zap className="w-4 h-4 text-citadel-orange" />
              )}
              <span className="text-sm text-citadel-orange font-medium capitalize">
                {userRole}
              </span>
            </div>
          )}

          {/* Wallet Info */}
          <div className="flex items-center gap-3 bg-citadel-steel/20 border border-citadel-orange/30 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-citadel-orange rounded-full animate-pulse"></div>
            <span className="text-sm text-citadel-light-gray font-mono">
              {(() => {
                try {
                  const address = account?.address;
                  let addressStr = '';

                  if (typeof address === 'string') {
                    addressStr = address;
                  } else if (address && typeof address === 'object') {
                    addressStr = String(address);
                  }

                  if (addressStr && addressStr.length > 10) {
                    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
                  }
                  return addressStr || 'Connected';
                } catch {
                  return 'Connected';
                }
              })()}
            </span>
            <div className="citadel-btn-secondary p-1">
              <WalletSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {userRole && (
        <div className="md:hidden border-t border-citadel-steel/30 bg-citadel-black-light/50">
          <div className="flex">
            <button
              onClick={handleNavigateToDashboard}
              className="flex-1 py-4 text-center citadel-btn-secondary mx-2 my-2 flex items-center justify-center gap-2"
            >
              {userRole === 'creator' ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {userRole === 'creator' ? 'My Citadel' : 'Dashboard'}
            </button>
            <button
              onClick={handleNavigateToMarketplace}
              className="flex-1 py-4 text-center citadel-btn-secondary mx-2 my-2 flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              The Hall
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

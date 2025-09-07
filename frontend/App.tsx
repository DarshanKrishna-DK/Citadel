import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
// Internal Components
import { Header } from "@/components/Header";
import { RoleSelection } from "@/components/RoleSelection";
import { CreatorDashboard } from "@/components/CreatorDashboard";
import { StreamerDashboard } from "@/components/StreamerDashboard";
import { ModeratorMarketplace } from "@/components/ModeratorMarketplace";
import { ModeratorDetailPage } from "@/components/ModeratorDetailPage";
import Dashboard from "@/components/Dashboard";
import LiveDashboard from "@/components/LiveDashboard";
import { LiveStreamDashboard } from "@/components/LiveStreamDashboard";
import MainPage from "@/components/MainPage";
import { LoadingSpinner, PageTransition } from "@/components/ui/LoadingSpinner";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types";

type AppView = 'landing' | 'marketplace' | 'moderator-detail' | 'user-dashboard' | 'live-dashboard' | 'live-stream' | 'role-selection' | 'creator-dashboard' | 'streamer-dashboard';

function AppContent() {
  const { connected, account } = useWallet();
  const { userRole, setUserRole, setIsWalletConnected, user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedModeratorId, setSelectedModeratorId] = useState<string | null>(null);
  const [liveStreamData, setLiveStreamData] = useState<{
    moderatorId: string;
    platform: 'Twitch' | 'YouTube';
  } | null>(null);

  useEffect(() => {
    setIsWalletConnected(connected);
    if (connected && account) {
      setIsLoading(true);

      // Handle different address formats from Aptos wallet
      let addressString = '';
      if (typeof account.address === 'string') {
        addressString = account.address;
      } else if (account.address && typeof account.address === 'object' && 'data' in account.address) {
        addressString = String((account.address as any).data);
      } else if (account.address && typeof account.address === 'object' && 'toString' in account.address) {
        addressString = String(account.address);
      }

      // Simulate loading time for better UX
      setTimeout(() => {
        setUser({
          address: addressString,
          role: userRole,
        });
        setIsLoading(false);
        // Stay on landing page after wallet connection
      }, 1000);
    } else {
      setUser(null);
      setUserRole(null);
      setIsLoading(false);
      setCurrentView('landing'); // Reset to landing page when wallet disconnected
    }
  }, [connected, account, setIsWalletConnected, setUser, setUserRole, userRole]);

  // Handle URL-based navigation for live dashboard
  useEffect(() => {
    const checkForLiveDashboard = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      console.log('🔍 Checking URL for live dashboard:', { path, hash, search: window.location.search });
      
      if (path === '/dashboard/live' || hash.includes('#live-dashboard')) {
        console.log('✅ Redirecting to live dashboard');
        setCurrentView('live-dashboard');
      }
    };

    // Check immediately
    checkForLiveDashboard();

    // Listen for hash changes (when redirected from Twitch)
    const handleHashChange = () => {
      console.log('🔄 Hash changed:', window.location.hash);
      checkForLiveDashboard();
    };

    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      console.log('🔄 Pop state changed');
      checkForLiveDashboard();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleRoleSelected = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setUserRole(role);
      if (user) {
        setUser({ ...user, role });
      }
      setIsLoading(false);
      // Navigate to appropriate dashboard after role selection
      if (role === 'creator') {
        setCurrentView('creator-dashboard');
      } else if (role === 'streamer') {
        setCurrentView('streamer-dashboard');
      }
    }, 800);
  };

  const handleViewMarketplace = () => {
    setCurrentView('marketplace');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleViewModeratorDetail = (moderatorId: string) => {
    setSelectedModeratorId(moderatorId);
    setCurrentView('moderator-detail');
  };

  const handleBackToMarketplace = () => {
    setCurrentView('marketplace');
  };

  const handleViewDashboard = () => {
    setCurrentView('user-dashboard');
  };



  const handleEndStream = () => {
    setLiveStreamData(null);
    setCurrentView('user-dashboard');
  };



  // Show loading state while wallet is connecting or transitioning
  if ((connected && !user) || isLoading) {
    return (
      <div className="min-h-screen bg-citadel-black flex items-center justify-center">
        <LoadingSpinner
          variant="citadel"
          size="lg"
          message={isLoading ? "Initializing Citadel..." : "Connecting to wallet..."}
        />
      </div>
    );
  }

  // Route based on current view
  switch (currentView) {
    case 'marketplace':
      return (
        <PageTransition>
          <ModeratorMarketplace
            onBackToLanding={handleBackToLanding}
            onViewModeratorDetail={handleViewModeratorDetail}
          />
        </PageTransition>
      );

    case 'moderator-detail':
      return (
        <PageTransition>
          <ModeratorDetailPage
            moderatorId={selectedModeratorId}
            onBackToMarketplace={handleBackToMarketplace}
            onBackToLanding={handleBackToLanding}
            onViewDashboard={handleViewDashboard}
          />
        </PageTransition>
      );

    case 'user-dashboard':
      return (
        <PageTransition>
          <Dashboard 
            onBackToLanding={handleBackToLanding}
            onViewMarketplace={handleViewMarketplace}
          />
        </PageTransition>
      );

    case 'live-dashboard':
      return (
        <PageTransition>
          <LiveDashboard 
            onBackToLanding={handleBackToLanding}
            onBackToDashboard={handleViewDashboard}
          />
        </PageTransition>
      );

    case 'live-stream':
      return (
        <PageTransition>
          <LiveStreamDashboard
            moderatorId={liveStreamData?.moderatorId || ''}
            platform={liveStreamData?.platform || 'Twitch'}
            onBackToLanding={handleBackToLanding}
            onEndStream={handleEndStream}
          />
        </PageTransition>
      );

    case 'role-selection':
      return (
        <PageTransition>
          <Header />
          <RoleSelection onRoleSelected={handleRoleSelected} />
        </PageTransition>
      );

    case 'creator-dashboard':
      return (
        <PageTransition>
          <CreatorDashboard />
        </PageTransition>
      );

    case 'streamer-dashboard':
      return (
        <PageTransition>
          <StreamerDashboard />
        </PageTransition>
      );

    case 'landing':
    default:
      return (
        <PageTransition>
          <MainPage
            onViewMarketplace={handleViewMarketplace}
            onViewDashboard={handleViewDashboard}
          />
        </PageTransition>
      );
  }
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Clock, ShoppingBag, ThumbsUp, Zap, BarChart3, Play, ToggleLeft, ToggleRight, ArrowUp } from 'lucide-react';
import { MarketplaceNavbar } from './MarketplaceNavbar';
import Footer from './Footer';
import { GoLiveModal } from './GoLiveModal';

// Types
interface StreamSession {
  sessionId: string;
  platform: 'Twitch' | 'YouTube';
  date: string;
  duration: string;
}

interface OwnedModerator {
  id: string;
  name: string;
  level: number;
  isListedForSale: boolean;
  logoUrl: string;
  streamHistory: StreamSession[];
  upvotes?: number;
}



interface UserDashboardProps {
  onBackToLanding?: () => void;
  onGoLive?: (moderatorId: string, platform: 'Twitch' | 'YouTube') => void;
}

// Mock data
const mockDashboardData = {
  stats: {
    totalRevenue: { amount: 45.5, currency: "APT" },
    totalHoursStreamed: 128,
    licensesSold: 5
  },
  ownedModerators: [
    {
      id: "suite-01",
      name: "Aegis Warden",
      level: 5,
      isListedForSale: false,
      logoUrl: "/aegis-logo.png",
      upvotes: 1240,
      streamHistory: [
        { sessionId: "s1", platform: "Twitch" as const, date: "2023-10-26", duration: "4h 15m" },
        { sessionId: "s2", platform: "YouTube" as const, date: "2023-10-24", duration: "3h 30m" }
      ]
    },
    {
      id: "suite-02",
      name: "Guardian Elite",
      level: 8,
      isListedForSale: true,
      logoUrl: "/guardian-logo.png",
      upvotes: 890,
      streamHistory: [
        { sessionId: "s3", platform: "Twitch" as const, date: "2023-10-25", duration: "2h 45m" }
      ]
    }
  ],
  listedModerators: [
    { id: "suite-09", name: "The Justicar", level: 8, listingPrice: 250, status: "Listed" as const }
  ]
};

export const UserDashboard: React.FC<UserDashboardProps> = ({ onBackToLanding, onGoLive }) => {
  const [activeTab, setActiveTab] = useState<'moderators' | 'listings' | 'analytics'>('moderators');
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [selectedModeratorForLive, setSelectedModeratorForLive] = useState<string | null>(null);

  const handleToggleListing = (moderatorId: string) => {
    setDashboardData(prev => ({
      ...prev,
      ownedModerators: prev.ownedModerators.map(mod =>
        mod.id === moderatorId
          ? { ...mod, isListedForSale: !mod.isListedForSale }
          : mod
      )
    }));
  };

  const handleGoLive = (moderatorId: string) => {
    setSelectedModeratorForLive(moderatorId);
  };

  const handlePlatformSelect = (platform: 'Twitch' | 'YouTube') => {
    if (selectedModeratorForLive) {
      onGoLive?.(selectedModeratorForLive, platform);
      setSelectedModeratorForLive(null);
    }
  };

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Navbar */}
      <MarketplaceNavbar onBackToLanding={onBackToLanding} />

      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 citadel-dots-bg opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-citadel-orange/4 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-citadel-orange/6 to-transparent rounded-full animate-pulse-slower"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            
            <h1 className="text-4xl md:text-5xl font-bold citadel-heading mb-2">My Dashboard</h1>
            <p className="text-citadel-light-gray text-lg">Manage your AI moderators and track your streaming performance</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="citadel-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-citadel-orange" />
                <span className="text-citadel-light-gray">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {dashboardData.stats.totalRevenue.amount} {dashboardData.stats.totalRevenue.currency}
              </div>
            </div>
            
            <div className="citadel-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-citadel-orange" />
                <span className="text-citadel-light-gray">Hours Streamed</span>
              </div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.totalHoursStreamed}h</div>
            </div>
            
            <div className="citadel-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="w-5 h-5 text-citadel-orange" />
                <span className="text-citadel-light-gray">Licenses Sold</span>
              </div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.licensesSold}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-citadel-black-light/50 p-1 rounded-lg border border-citadel-steel/20">
              <button
                onClick={() => setActiveTab('moderators')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'moderators'
                    ? 'bg-citadel-orange text-citadel-black'
                    : 'text-citadel-light-gray hover:text-white'
                }`}
              >
                My Moderators
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'listings'
                    ? 'bg-citadel-orange text-citadel-black'
                    : 'text-citadel-light-gray hover:text-white'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-citadel-orange text-citadel-black'
                    : 'text-citadel-light-gray hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-16">
            {activeTab === 'moderators' && (
              <div className="space-y-6">
                {dashboardData.ownedModerators.map((moderator) => (
                  <OwnedModeratorCard
                    key={moderator.id}
                    moderator={moderator}
                    onToggleListing={() => handleToggleListing(moderator.id)}
                    onGoLive={() => handleGoLive(moderator.id)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                {dashboardData.listedModerators.map((listing) => (
                  <div key={listing.id} className="citadel-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{listing.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-citadel-orange font-medium">Level {listing.level}</span>
                          <span className="text-citadel-light-gray">•</span>
                          <span className="text-citadel-light-gray">${listing.listingPrice}</span>
                          <span className="text-citadel-light-gray">•</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            listing.status === 'Listed' ? 'bg-green-500/20 text-green-400' :
                            listing.status === 'Sold' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                      </div>
                      <button className="citadel-btn-secondary">
                        Edit Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="citadel-card p-8 text-center">
                <BarChart3 className="w-16 h-16 text-citadel-orange mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Analytics Coming Soon</h3>
                <p className="text-citadel-light-gray">
                  Detailed analytics and insights about your moderator performance will be available here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Go Live Modal */}
      {selectedModeratorForLive && (
        <GoLiveModal
          onClose={() => setSelectedModeratorForLive(null)}
          onPlatformSelect={handlePlatformSelect}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

// OwnedModeratorCard Component
interface OwnedModeratorCardProps {
  moderator: OwnedModerator;
  onToggleListing: () => void;
  onGoLive: () => void;
}

const OwnedModeratorCard: React.FC<OwnedModeratorCardProps> = ({ moderator, onToggleListing, onGoLive }) => {
  return (
    <div className="citadel-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-citadel-orange" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{moderator.name}</h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-citadel-orange/20 text-citadel-orange rounded-full text-sm font-medium">
                LVL {moderator.level}
              </span>
              {moderator.upvotes && (
                <div className="flex items-center gap-1 text-citadel-light-gray">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{moderator.upvotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="citadel-btn-secondary flex items-center gap-2">
            <ArrowUp className="w-4 h-4" />
            Upgrade
          </button>
          <button 
            onClick={onGoLive}
            className="citadel-btn-primary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Use
          </button>
          <button className="p-2 text-citadel-light-gray hover:text-citadel-orange transition-colors">
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleListing}
            className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
          >
            {moderator.isListedForSale ? (
              <>
                <ToggleRight className="w-6 h-6 text-citadel-orange" />
                <span className="text-sm">Listed</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6" />
                <span className="text-sm">List for Sale</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stream History */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Stream History</h4>
        <div className="space-y-3">
          {moderator.streamHistory.map((session) => (
            <div key={session.sessionId} className="flex items-center justify-between p-3 bg-citadel-black-light/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  session.platform === 'Twitch' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {session.platform === 'Twitch' ? 'T' : 'Y'}
                </div>
                <div>
                  <div className="text-white font-medium">{session.platform}</div>
                  <div className="text-citadel-light-gray text-sm">{session.date} • {session.duration}</div>
                </div>
              </div>
              <button className="citadel-btn-secondary text-sm">
                View Analysis
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

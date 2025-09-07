import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { userDashboard, type UserModerator, type StreamSession } from '../utils/userDashboard';
import { moderatorStorage } from '../utils/moderatorStorage';
import { GoLiveModal } from './GoLiveModal';
import Footer from './Footer';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  BarChart3,
  Play,
  Pause,
  Settings,
  Home,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Star,
  Zap,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  ThumbsUp,
  Eye,
  PlayCircle,
  BarChart,
  Crown,
  Key,
  Heart,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  RefreshCw
} from 'lucide-react';

interface UserStats {
  totalRevenue: number;
  activeLicenses: number;
  totalUsers: number;
  hoursStreamed: number;
  moderationActions: number;
  avgRating: number;
  totalModerators: number;
  activeStreams: number;
}

interface ModeratorWithActions {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: string;
  hourlyPrice: number;
  monthlyPrice: number;
  buyoutPrice: number;
  upvotes: number;
  totalUsers: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
  transactionHash?: string;
  purchaseType?: 'hourly' | 'license' | 'buyout';
  purchaseDate?: string;
  totalUsageHours?: number;
  lastUsed?: string;
  streamSessions?: number;
  moderationActions?: number;
  efficiency?: number;
}

interface DashboardProps {
  onBackToLanding?: () => void;
  onViewMarketplace?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding, onViewMarketplace }) => {
  const { account, signAndSubmitTransaction, connected, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'created' | 'licensed' | 'owned' | 'marketplace'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Data states
  const [userStats, setUserStats] = useState<UserStats>({
    totalRevenue: 0,
    activeLicenses: 0,
    totalUsers: 0,
    hoursStreamed: 0,
    moderationActions: 0,
    avgRating: 0,
    totalModerators: 0,
    activeStreams: 0
  });
  
  const [createdModerators, setCreatedModerators] = useState<ModeratorWithActions[]>([]);
  const [licensedModerators, setLicensedModerators] = useState<ModeratorWithActions[]>([]);
  const [ownedModerators, setOwnedModerators] = useState<ModeratorWithActions[]>([]);
  const [marketplaceModerators, setMarketplaceModerators] = useState<ModeratorWithActions[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [selectedModerator, setSelectedModerator] = useState<ModeratorWithActions | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use a more conservative Aptos configuration to avoid rate limiting
  const aptosConfig = new AptosConfig({ 
    network: Network.TESTNET,
    clientConfig: {
      HEADERS: {
        'User-Agent': 'Citadel-DApp/1.0.0'
      }
    }
  });
  const aptos = new Aptos(aptosConfig);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDashboard = () => {
    setIsWalletDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    initializeDashboard();
    
    // Set up real-time updates (reduced frequency to avoid rate limiting)
    const interval = setInterval(() => {
      updateLiveData();
    }, 120000); // Update every 2 minutes to reduce API calls

    // Refresh dashboard when window gains focus (user returns from creating moderator)
    // Disabled to prevent excessive API calls and rate limiting
    // const handleFocus = () => {
    //   if (connected && account) {
    //     console.log('🔄 Window focused, refreshing dashboard data...');
    //     initializeDashboard();
    //   }
    // };
    // window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      // window.removeEventListener('focus', handleFocus); // Commented out since listener is disabled
    };
  }, [connected, account]);

  const initializeDashboard = async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadCreatedModerators(),
        loadLicensedModerators(),
        loadOwnedModerators(),
        loadMarketplaceModerators(),
        loadUserStats()
      ]);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLiveData = async () => {
    await Promise.all([
      loadCreatedModerators(),
      loadLicensedModerators(),
      loadOwnedModerators(),
      loadUserStats()
    ]);
  };

  const loadCreatedModerators = async () => {
    try {
      if (!account) return;
      
      const allModerators = moderatorStorage.getAll();
      const userAddress = account.address.toString();
      
      // Filter moderators created by the current user
      const userCreatedModerators = allModerators
        .filter(mod => mod.creator === userAddress)
        .map(mod => ({
          ...mod,
          streamSessions: Math.floor(Math.random() * 50) + 1,
          moderationActions: Math.floor(Math.random() * 1000) + 100,
          efficiency: 85 + Math.random() * 15
        }));
      
      setCreatedModerators(userCreatedModerators);
      console.log('📝 Loaded created moderators:', userCreatedModerators);
      
    } catch (error) {
      console.error('Error loading created moderators:', error);
    }
  };

  const loadLicensedModerators = async () => {
    try {
      if (!account) return;
      
      const userAddress = account.address.toString();
      const userModerators = userDashboard.getUserModerators(userAddress);
      
      const licensed = userModerators
        .filter(mod => mod.purchaseType === 'license')
        .map(mod => ({
          ...mod,
          streamSessions: Math.floor(Math.random() * 30) + 1,
          moderationActions: Math.floor(Math.random() * 500) + 50,
          efficiency: 80 + Math.random() * 20
        }));
      
      setLicensedModerators(licensed);
      console.log('📄 Loaded licensed moderators:', licensed);
      
    } catch (error) {
      console.error('Error loading licensed moderators:', error);
    }
  };

  const loadOwnedModerators = async () => {
    try {
      if (!account) return;
      
      const userAddress = account.address.toString();
      const userModerators = userDashboard.getUserModerators(userAddress);
      
      const owned = userModerators
        .filter(mod => mod.purchaseType === 'buyout')
        .map(mod => ({
          ...mod,
          streamSessions: Math.floor(Math.random() * 100) + 10,
          moderationActions: Math.floor(Math.random() * 2000) + 200,
          efficiency: 90 + Math.random() * 10
        }));
      
      setOwnedModerators(owned);
      console.log('👑 Loaded owned moderators:', owned);
      
    } catch (error) {
      console.error('Error loading owned moderators:', error);
    }
  };

  const loadMarketplaceModerators = async () => {
    try {
      if (!account) return;
      
      const userAddress = account.address.toString();
      const userModerators = userDashboard.getUserModerators(userAddress);
      
      const marketplace = userModerators
        .filter(mod => mod.purchaseType === 'hourly')
        .map(mod => ({
          ...mod,
          streamSessions: Math.floor(Math.random() * 20) + 1,
          moderationActions: Math.floor(Math.random() * 300) + 25,
          efficiency: 75 + Math.random() * 25
        }));
      
      setMarketplaceModerators(marketplace);
      console.log('🛒 Loaded marketplace moderators:', marketplace);
      
    } catch (error) {
      console.error('Error loading marketplace moderators:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const totalModerators = createdModerators.length + licensedModerators.length + ownedModerators.length + marketplaceModerators.length;
      
      const stats: UserStats = {
        totalRevenue: Math.floor(Math.random() * 10000) + 2000,
        activeLicenses: licensedModerators.length + ownedModerators.length,
        totalUsers: Math.floor(Math.random() * 5000) + 500,
        hoursStreamed: Math.floor(Math.random() * 500) + 100,
        moderationActions: Math.floor(Math.random() * 50000) + 10000,
        avgRating: 4.2 + Math.random() * 0.7,
        totalModerators,
        activeStreams: Math.floor(Math.random() * 5) + 1
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Moderator Actions
  const handleUpvote = async (moderatorId: string) => {
    if (!account) {
      alert('Please connect your wallet to upvote');
      return;
    }

    const userAddress = account.address.toString();
    const success = moderatorStorage.upvote(moderatorId, userAddress);
    
    if (success) {
      // Update the moderator in the appropriate list
      const updateModerator = (moderators: ModeratorWithActions[]) =>
        moderators.map(mod => 
          mod.id === moderatorId 
            ? { ...mod, upvotes: mod.upvotes + 1 }
            : mod
        );

      setCreatedModerators(prev => updateModerator(prev));
      setLicensedModerators(prev => updateModerator(prev));
      setOwnedModerators(prev => updateModerator(prev));
      setMarketplaceModerators(prev => updateModerator(prev));
    } else {
      alert('You have already upvoted this moderator!');
    }
  };

  const handleUseModerator = async (moderator: ModeratorWithActions) => {
    if (!account) {
      alert('Please connect your wallet to use moderator');
      return;
    }

    // Set the selected moderator and show the Go Live modal
    setSelectedModerator(moderator);
    setShowGoLiveModal(true);
  };

  const handleViewAnalysis = (moderator: ModeratorWithActions) => {
    alert(`Opening detailed analytics for ${moderator.name}...\n\nPerformance Metrics:\n- Efficiency: ${moderator.efficiency?.toFixed(1)}%\n- Actions: ${moderator.moderationActions}\n- Sessions: ${moderator.streamSessions}\n- Usage Hours: ${moderator.totalUsageHours || 0}h`);
  };

  const handleViewStreams = (moderator: ModeratorWithActions) => {
    alert(`Stream History for ${moderator.name}:\n\n- Total Sessions: ${moderator.streamSessions}\n- Total Hours: ${moderator.totalUsageHours || 0}h\n- Last Used: ${moderator.lastUsed ? new Date(moderator.lastUsed).toLocaleDateString() : 'Never'}\n- Average Efficiency: ${moderator.efficiency?.toFixed(1)}%`);
  };

  const handleTwitchConnect = async () => {
    try {
      // Call backend to initiate Twitch OAuth
      const apiUrl = 'http://localhost:3000/api/auth/twitch';
      console.log('🔗 Attempting to connect to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moderatorId: selectedModerator?.id,
          userId: account?.address?.toString()
        })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Twitch OAuth URL received:', data.authUrl);
        
        if (data.authUrl) {
          // Close the modal first
          setShowGoLiveModal(false);
          setSelectedModerator(null);
          
          // Redirect to Twitch OAuth
          console.log('🔗 Redirecting to Twitch OAuth...');
          window.location.href = data.authUrl;
        } else {
          throw new Error('No auth URL received from backend');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to initiate Twitch authentication: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Twitch connection error:', error);
      alert(`Failed to connect to Twitch: ${error.message}\n\nPlease make sure the backend server is running on http://localhost:3000`);
    }
  };

  const handleYouTubeConnect = async () => {
    alert('YouTube integration coming soon!');
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await initializeDashboard();
  };

  const filterModerators = (moderators: ModeratorWithActions[]) => {
    return moderators.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mod.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || mod.category.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  };

  const renderModeratorCard = (moderator: ModeratorWithActions, type: 'created' | 'licensed' | 'owned' | 'marketplace') => {
    const hasUpvoted = account && moderatorStorage.hasUserUpvoted(moderator.id, account.address.toString());
    
    return (
      <div key={moderator.id} className="citadel-card p-6 hover:border-citadel-orange/50 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-white">{moderator.name}</h3>
              {type === 'created' && <Crown className="w-4 h-4 text-yellow-400" title="Created by you" />}
              {type === 'owned' && <Key className="w-4 h-4 text-purple-400" title="Owned" />}
              {type === 'licensed' && <Shield className="w-4 h-4 text-green-400" title="Licensed" />}
              {type === 'marketplace' && <ShoppingBag className="w-4 h-4 text-blue-400" title="From Marketplace" />}
            </div>
            <p className="text-sm text-citadel-light-gray mb-2 capitalize">{moderator.category}</p>
            <p className="text-sm text-citadel-steel line-clamp-2">{moderator.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpvote(moderator.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                hasUpvoted 
                  ? 'bg-citadel-orange/20 text-citadel-orange cursor-not-allowed' 
                  : 'hover:bg-citadel-orange/10 text-citadel-light-gray hover:text-citadel-orange'
              }`}
              disabled={hasUpvoted}
              title={hasUpvoted ? 'Already upvoted' : 'Upvote this moderator'}
            >
              <ThumbsUp className={`w-3 h-3 ${hasUpvoted ? 'fill-current' : ''}`} />
              <span className="text-xs">{moderator.upvotes}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
          <div className="text-center p-2 bg-citadel-steel/10 rounded">
            <p className="text-citadel-light-gray">Users</p>
            <p className="font-bold text-white">{moderator.totalUsers}</p>
          </div>
          <div className="text-center p-2 bg-citadel-steel/10 rounded">
            <p className="text-citadel-light-gray">Rating</p>
            <p className="font-bold text-white">{moderator.rating.toFixed(1)}</p>
          </div>
          <div className="text-center p-2 bg-citadel-steel/10 rounded">
            <p className="text-citadel-light-gray">Sessions</p>
            <p className="font-bold text-white">{moderator.streamSessions || 0}</p>
          </div>
          <div className="text-center p-2 bg-citadel-steel/10 rounded">
            <p className="text-citadel-light-gray">Efficiency</p>
            <p className="font-bold text-white">{moderator.efficiency?.toFixed(1) || 0}%</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          <div className="text-center">
            <p className="text-citadel-light-gray">Hourly</p>
            <p className="font-semibold text-blue-400">${moderator.hourlyPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-citadel-light-gray">Monthly</p>
            <p className="font-semibold text-green-400">${moderator.monthlyPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-citadel-light-gray">Buyout</p>
            <p className="font-semibold text-purple-400">${moderator.buyoutPrice}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleUseModerator(moderator)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-citadel-orange text-citadel-black rounded-lg hover:bg-citadel-orange-bright transition-colors text-xs font-medium"
          >
            <PlayCircle className="w-3 h-3" />
            Use
          </button>
          <button
            onClick={() => handleViewAnalysis(moderator)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-citadel-steel/20 text-citadel-light-gray rounded-lg hover:bg-citadel-steel/30 transition-colors text-xs"
          >
            <BarChart className="w-3 h-3" />
            Analysis
          </button>
          <button
            onClick={() => handleViewStreams(moderator)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-citadel-steel/20 text-citadel-light-gray rounded-lg hover:bg-citadel-steel/30 transition-colors text-xs"
          >
            <Eye className="w-3 h-3" />
            Streams
          </button>
          <button className="flex items-center justify-center gap-1 px-3 py-2 bg-citadel-steel/20 text-citadel-light-gray rounded-lg hover:bg-citadel-steel/30 transition-colors text-xs">
            <MoreVertical className="w-3 h-3" />
            More
          </button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-citadel-steel/20 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-citadel-steel" />
            <span className="text-citadel-steel">
              {type === 'created' ? 'Created' : 'Added'} {new Date(moderator.createdAt || moderator.purchaseDate || '').toLocaleDateString()}
            </span>
          </div>
          {moderator.transactionHash && (
            <a 
              href={`https://explorer.aptoslabs.com/txn/${moderator.transactionHash}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-citadel-orange hover:text-citadel-orange-bright"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Tx</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-citadel-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-citadel-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-citadel-light-gray">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-steel/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center animate-glow-pulse">
                <Shield className="w-6 h-6 text-citadel-black" />
              </div>
              <h1 className="text-2xl font-bold citadel-heading">CITADEL</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button 
                onClick={onViewMarketplace}
                className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                <ShoppingBag className="w-4 h-4" />
                Marketplace
              </button>
              <div className="flex items-center gap-2 text-citadel-orange">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {connected && account ? (
                <div className="hidden sm:flex items-center gap-3 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-citadel-light-gray bg-citadel-steel/20 px-4 py-2 rounded-lg border border-citadel-orange/30 hover:border-citadel-orange/50 transition-colors"
                  >
                    <span className="font-mono text-citadel-orange">
                      {formatAddress(account.address?.toString() || '')}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isWalletDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-citadel-black-light border border-citadel-orange/30 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        <button
                          onClick={handleDashboard}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-orange bg-citadel-orange/10"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            disconnect();
                            setIsWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="wallet-selector-container">
                  <WalletSelector />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-citadel-steel/30 bg-citadel-black/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button 
                  onClick={() => {
                    onBackToLanding?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button 
                  onClick={() => {
                    onViewMarketplace?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Marketplace
                </button>
                <div className="flex items-center gap-2 px-3 py-2 text-citadel-orange">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Dashboard <span className="text-citadel-orange">Overview</span>
              </h1>
              <p className="text-citadel-light-gray">
                Manage your AI moderators across all categories
              </p>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-citadel-orange/10 hover:bg-citadel-orange/20 border border-citadel-orange/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 text-citadel-orange ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-citadel-orange font-medium">
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button 
                onClick={onViewMarketplace}
                className="citadel-btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Moderator
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Revenue</p>
                  <p className="text-lg font-bold text-citadel-orange">${userStats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Moderators</p>
                  <p className="text-lg font-bold text-white">{userStats.totalModerators}</p>
                </div>
                <Shield className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Active</p>
                  <p className="text-lg font-bold text-white">{userStats.activeLicenses}</p>
                </div>
                <Activity className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Users</p>
                  <p className="text-lg font-bold text-white">{userStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Hours</p>
                  <p className="text-lg font-bold text-white">{userStats.hoursStreamed}</p>
                </div>
                <Clock className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Actions</p>
                  <p className="text-lg font-bold text-white">{userStats.moderationActions.toLocaleString()}</p>
                </div>
                <Zap className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Rating</p>
                  <p className="text-lg font-bold text-white">{userStats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>

            <div className="citadel-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-citadel-light-gray text-xs">Streams</p>
                  <p className="text-lg font-bold text-white">{userStats.activeStreams}</p>
                </div>
                <PlayCircle className="w-5 h-5 text-citadel-orange" />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-citadel-steel/30">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, count: userStats.totalModerators },
              { id: 'created', label: 'Created', icon: Crown, count: createdModerators.length },
              { id: 'licensed', label: 'Licensed', icon: Shield, count: licensedModerators.length },
              { id: 'owned', label: 'Owned', icon: Key, count: ownedModerators.length },
              { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, count: marketplaceModerators.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-citadel-orange text-citadel-black border-b-2 border-citadel-orange'
                    : 'text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-steel/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-citadel-black/20 text-citadel-black'
                    : 'bg-citadel-steel/20 text-citadel-light-gray'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          {activeTab !== 'overview' && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-citadel-steel" />
                <input
                  type="text"
                  placeholder="Search moderators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-citadel-steel/20 border border-citadel-steel/30 rounded-lg text-white placeholder-citadel-steel focus:border-citadel-orange focus:outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-citadel-steel" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-citadel-steel/20 border border-citadel-steel/30 rounded-lg text-white focus:border-citadel-orange focus:outline-none appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="security">Security</option>
                  <option value="engagement">Engagement</option>
                  <option value="gaming">Gaming</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Created Moderators Summary */}
              <div className="citadel-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Created
                  </h3>
                  <span className="text-2xl font-bold text-citadel-orange">{createdModerators.length}</span>
                </div>
                <p className="text-sm text-citadel-light-gray mb-4">Moderators you've created</p>
                <button
                  onClick={() => setActiveTab('created')}
                  className="w-full citadel-btn-secondary text-sm"
                >
                  View All Created
                </button>
              </div>

              {/* Licensed Moderators Summary */}
              <div className="citadel-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Licensed
                  </h3>
                  <span className="text-2xl font-bold text-citadel-orange">{licensedModerators.length}</span>
                </div>
                <p className="text-sm text-citadel-light-gray mb-4">Monthly licensed moderators</p>
                <button
                  onClick={() => setActiveTab('licensed')}
                  className="w-full citadel-btn-secondary text-sm"
                >
                  View All Licensed
                </button>
              </div>

              {/* Owned Moderators Summary */}
              <div className="citadel-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-400" />
                    Owned
                  </h3>
                  <span className="text-2xl font-bold text-citadel-orange">{ownedModerators.length}</span>
                </div>
                <p className="text-sm text-citadel-light-gray mb-4">Fully owned moderators</p>
                <button
                  onClick={() => setActiveTab('owned')}
                  className="w-full citadel-btn-secondary text-sm"
                >
                  View All Owned
                </button>
              </div>

              {/* Marketplace Moderators Summary */}
              <div className="citadel-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                    Marketplace
                  </h3>
                  <span className="text-2xl font-bold text-citadel-orange">{marketplaceModerators.length}</span>
                </div>
                <p className="text-sm text-citadel-light-gray mb-4">Pay-per-use moderators</p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="w-full citadel-btn-secondary text-sm"
                >
                  View All Marketplace
                </button>
              </div>
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Created Moderators
                </h2>
                <button 
                  onClick={onViewMarketplace}
                  className="citadel-btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              </div>
              {filterModerators(createdModerators).length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-citadel-steel mx-auto mb-4" />
                  <p className="text-citadel-light-gray text-lg mb-2">No created moderators found</p>
                  <p className="text-sm text-citadel-steel mb-6">Create your first AI moderator to get started</p>
                  <button 
                    onClick={onViewMarketplace}
                    className="citadel-btn-primary"
                  >
                    Create Moderator
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filterModerators(createdModerators).map(moderator => renderModeratorCard(moderator, 'created'))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'licensed' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  Licensed Moderators
                </h2>
              </div>
              {filterModerators(licensedModerators).length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-citadel-steel mx-auto mb-4" />
                  <p className="text-citadel-light-gray text-lg mb-2">No licensed moderators found</p>
                  <p className="text-sm text-citadel-steel mb-6">Purchase a monthly license to get started</p>
                  <button 
                    onClick={onViewMarketplace}
                    className="citadel-btn-primary"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filterModerators(licensedModerators).map(moderator => renderModeratorCard(moderator, 'licensed'))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'owned' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Key className="w-6 h-6 text-purple-400" />
                  Owned Moderators
                </h2>
              </div>
              {filterModerators(ownedModerators).length === 0 ? (
                <div className="text-center py-12">
                  <Key className="w-16 h-16 text-citadel-steel mx-auto mb-4" />
                  <p className="text-citadel-light-gray text-lg mb-2">No owned moderators found</p>
                  <p className="text-sm text-citadel-steel mb-6">Purchase a moderator outright for full ownership</p>
                  <button 
                    onClick={onViewMarketplace}
                    className="citadel-btn-primary"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filterModerators(ownedModerators).map(moderator => renderModeratorCard(moderator, 'owned'))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                  Marketplace Moderators
                </h2>
              </div>
              {filterModerators(marketplaceModerators).length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-citadel-steel mx-auto mb-4" />
                  <p className="text-citadel-light-gray text-lg mb-2">No marketplace moderators found</p>
                  <p className="text-sm text-citadel-steel mb-6">Add moderators from the marketplace for hourly use</p>
                  <button 
                    onClick={onViewMarketplace}
                    className="citadel-btn-primary"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filterModerators(marketplaceModerators).map(moderator => renderModeratorCard(moderator, 'marketplace'))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Go Live Modal */}
      {showGoLiveModal && selectedModerator && (
        <GoLiveModal
          isOpen={showGoLiveModal}
          onClose={() => {
            setShowGoLiveModal(false);
            setSelectedModerator(null);
          }}
          moderator={{
            id: selectedModerator.id,
            name: selectedModerator.name,
            description: selectedModerator.description,
            category: selectedModerator.category
          }}
          onTwitchConnect={handleTwitchConnect}
          onYouTubeConnect={handleYouTubeConnect}
        />
      )}
    </div>
  );
};

export default Dashboard;
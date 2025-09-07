import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Star, Users, ThumbsUp, Clock, Shield, Heart, Gamepad2, Zap, CheckCircle, Loader2, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { ModeratorSuite } from './ModeratorMarketplace';
import Footer from './Footer';
import { moderatorStorage } from '../utils/moderatorStorage';
import { userDashboard, type UserModerator } from '../utils/userDashboard';

// Mock data - in a real app, this would come from a data store or API
const mockModeratorSuites: ModeratorSuite[] = [
  {
    id: "suite-01",
    suiteName: "The Warden Suite",
    creator: "Citadel Labs",
    creatorLink: "#citadel-labs",
    category: "Security",
    description: "The ultimate security package to protect your community from trolls, raids, and spam.",
    longDescription: "The Warden Suite represents the pinnacle of AI-powered community protection. Built with advanced machine learning algorithms and trained on millions of community interactions, this comprehensive security solution provides unparalleled protection against toxic behavior, coordinated raids, and sophisticated spam attacks. Perfect for high-traffic communities that demand the highest level of security.",
    upvotes: 2140,
    activeUsers: 530,
    totalHoursUsed: 12500,
    keyFeatures: ["Toxicity Shield", "Raid Blocker", "Spam Smasher"],
    detailedFeatures: [
      {
        name: "Toxicity Shield",
        description: "Advanced sentiment analysis that detects and filters toxic language with 98% accuracy, including context-aware detection of sarcasm and implied threats."
      },
      {
        name: "Raid Blocker",
        description: "Real-time coordination detection that identifies and stops organized attacks before they can disrupt your community."
      },
      {
        name: "Spam Smasher",
        description: "Multi-layered spam detection using pattern recognition, link analysis, and behavioral modeling to catch even the most sophisticated spam attempts."
      }
    ],
    contextTags: ["High Security", "Enterprise", "24/7 Protection", "AI-Powered"],
    logoUrl: "/warden-logo.png",
    price: 4.99,
    licensePrice: 299.99,
    buyOutrightPrice: 1999.99,
    rating: 4.8,
    similarModerators: ["suite-04", "suite-02"]
  },
  {
    id: "suite-02",
    suiteName: "Community Builder Pro",
    creator: "StreamGuard Inc",
    creatorLink: "#streamguard-inc",
    category: "Engagement",
    description: "Boost engagement and build stronger communities with intelligent interaction tools.",
    longDescription: "Community Builder Pro transforms passive viewers into active community members through intelligent engagement mechanics and personalized interaction systems. This suite combines behavioral psychology with AI-driven insights to create vibrant, self-sustaining communities that grow organically.",
    upvotes: 1850,
    activeUsers: 420,
    totalHoursUsed: 8900,
    keyFeatures: ["Welcome Bot", "Activity Rewards", "Community Insights"],
    detailedFeatures: [
      {
        name: "Welcome Bot",
        description: "Intelligent onboarding system that personalizes welcome messages and guides new members through community features."
      },
      {
        name: "Activity Rewards",
        description: "Gamified engagement system that rewards positive community participation with customizable point systems and achievements."
      },
      {
        name: "Community Insights",
        description: "Advanced analytics dashboard providing deep insights into community health, engagement patterns, and growth opportunities."
      }
    ],
    contextTags: ["Community Growth", "Engagement", "Analytics", "Gamification"],
    logoUrl: "/community-logo.png",
    price: 3.49,
    licensePrice: 199.99,
    buyOutrightPrice: 1299.99,
    rating: 4.6,
    similarModerators: ["suite-05", "suite-03"]
  },
  {
    id: "suite-04",
    suiteName: "SafeSpace Guardian",
    creator: "Digital Wellness Co",
    creatorLink: "#digital-wellness",
    category: "Security",
    description: "Create inclusive, safe environments with advanced content filtering and user protection.",
    longDescription: "SafeSpace Guardian focuses on creating truly inclusive digital environments through advanced content filtering, harassment prevention, and mental health support systems. This suite goes beyond traditional moderation to foster positive community culture.",
    upvotes: 1980,
    activeUsers: 610,
    totalHoursUsed: 15200,
    keyFeatures: ["Content Filter", "Harassment Shield", "Mental Health Support"],
    detailedFeatures: [
      {
        name: "Content Filter",
        description: "Sophisticated content analysis that understands context, cultural nuances, and evolving language patterns to maintain appropriate discourse."
      },
      {
        name: "Harassment Shield",
        description: "Proactive harassment detection and prevention system that identifies patterns of targeted abuse before they escalate."
      },
      {
        name: "Mental Health Support",
        description: "AI-powered wellness monitoring that can detect signs of distress and provide appropriate resources and support."
      }
    ],
    contextTags: ["Inclusive", "Mental Health", "Advanced Filtering", "Wellness"],
    logoUrl: "/safespace-logo.png",
    price: 4.49,
    licensePrice: 249.99,
    buyOutrightPrice: 1699.99,
    rating: 4.9,
    similarModerators: ["suite-01", "suite-02"]
  }
];

interface ModeratorDetailPageProps {
  moderatorId: string | null;
  onBackToMarketplace?: () => void;
  onBackToLanding?: () => void;
  onViewDashboard?: () => void;
  moderatorData?: any; // For dynamically created moderators
}

export const ModeratorDetailPage: React.FC<ModeratorDetailPageProps> = ({
  moderatorId,
  onBackToMarketplace,
  onBackToLanding,
  onViewDashboard,
  moderatorData
}) => {
  const { account, signAndSubmitTransaction, connected, disconnect } = useWallet();
  const [selectedPricing, setSelectedPricing] = useState<'hourly' | 'license' | 'buyout' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDashboard = () => {
    onViewDashboard?.();
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

  // Find the suite by ID - check localStorage first, then mock data, or use provided moderator data
  let suite = moderatorData;
  
  if (!suite && moderatorId) {
    // First check localStorage
    const storedModerator = moderatorStorage.getById(moderatorId);
    if (storedModerator) {
      // Convert stored moderator to suite format
      suite = {
        id: storedModerator.id,
        suiteName: storedModerator.name,
        name: storedModerator.name,
        description: storedModerator.description,
        personality: storedModerator.personality,
        category: storedModerator.category,
        creator: storedModerator.creator,
        rating: storedModerator.rating,
        totalUsers: storedModerator.totalUsers,
        hourlyPrice: storedModerator.hourlyPrice,
        monthlyPrice: storedModerator.monthlyPrice,
        buyoutPrice: storedModerator.buyoutPrice,
        price: storedModerator.hourlyPrice,
        licensePrice: storedModerator.monthlyPrice,
        buyOutrightPrice: storedModerator.buyoutPrice,
        features: storedModerator.features,
        keyFeatures: storedModerator.features,
        isActive: storedModerator.isActive,
        upvotes: storedModerator.upvotes,
        activeUsers: storedModerator.totalUsers,
        createdAt: storedModerator.createdAt,
        transactionHash: storedModerator.transactionHash
      };
    } else {
      // Fall back to mock data
      suite = mockModeratorSuites.find(s => s.id === moderatorId);
    }
  }

  const handlePurchase = async (pricingType: 'hourly' | 'license' | 'buyout') => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (pricingType === 'hourly') {
      // Add to user's dashboard list
      addToUserDashboard(suite, 'hourly');
      alert('Moderator added to your dashboard! You can now use it for hourly billing.');
      return;
    }

    setIsProcessing(true);
    setSelectedPricing(pricingType);

    try {
      // Create the transaction payload
      const transaction = {
        data: {
          function: `0x239e3ad472a4451fb1729abbd956ee37bd23a40e0166c2a8823cf0e41a83b546::ai_moderator::purchase_license_v2`,
          functionArguments: [
            suite.id || suite.suiteName,
            pricingType === 'license' ? 2 : 3, // 2 = monthly, 3 = buyout
            Math.floor((pricingType === 'license' ? suite.licensePrice || suite.monthlyPrice : suite.buyOutrightPrice || suite.buyoutPrice) * 100000000) // Convert to Octas
          ],
        } as any,
      };

      console.log('🔗 Submitting transaction:', transaction);
      
      // Submit transaction to Aptos wallet
      const response = await signAndSubmitTransaction(transaction);
      console.log('✅ Transaction submitted:', response);
      
      // Wait for transaction confirmation
      await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log('✅ Transaction confirmed:', response.hash);
      
      // Add to user's dashboard after successful transaction
      addToUserDashboard(suite, pricingType, response.hash);
      
      setTransactionHash(response.hash);
      alert(`Successfully purchased ${pricingType === 'license' ? 'license' : 'full ownership'}! Added to your dashboard.`);
      
    } catch (error: any) {
      console.error('Transaction failed:', error);
      alert(`Transaction failed: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsProcessing(false);
      setSelectedPricing(null);
    }
  };

  if (!suite) {
    return (
      <div className="min-h-screen bg-citadel-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Moderator Not Found</h1>
          <button
            onClick={onBackToMarketplace}
            className="citadel-btn-primary"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'Engagement':
        return <Heart className="w-5 h-5 text-pink-400" />;
      case 'Gaming':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      default:
        return <Zap className="w-5 h-5 text-citadel-orange" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleUpvote = () => {
    if (suite && suite.id && account) {
      const userAddress = account.address.toString();
      const success = moderatorStorage.upvote(suite.id, userAddress);
      
      if (success) {
        // Force a page refresh to show updated data
        window.location.reload();
      } else {
        alert('You have already upvoted this moderator!');
      }
    } else if (!account) {
      alert('Please connect your wallet to upvote');
    }
  };

  const addToUserDashboard = (moderatorSuite: any, purchaseType: 'hourly' | 'license' | 'buyout', transactionHash?: string) => {
    if (!account || !moderatorSuite) return;

    const userAddress = account.address.toString();
    const userModerator: UserModerator = {
      id: moderatorSuite.id || `mod_${Date.now()}`,
      name: moderatorSuite.suiteName || moderatorSuite.name,
      description: moderatorSuite.description,
      personality: moderatorSuite.personality,
      category: moderatorSuite.category,
      creator: moderatorSuite.creator,
      purchaseType,
      purchaseDate: new Date().toISOString(),
      transactionHash,
      hourlyPrice: moderatorSuite.hourlyPrice || moderatorSuite.price,
      monthlyPrice: moderatorSuite.monthlyPrice || moderatorSuite.licensePrice,
      buyoutPrice: moderatorSuite.buyoutPrice || moderatorSuite.buyOutrightPrice,
      totalUsageHours: 0,
      isActive: true
    };

    userDashboard.addModerator(userAddress, userModerator);
  };

  // Get similar moderators
  const similarModerators = suite.similarModerators
    ? mockModeratorSuites.filter(s => suite.similarModerators?.includes(s.id))
    : mockModeratorSuites.filter(s => s.id !== suite.id && s.category === suite.category).slice(0, 4);

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
                className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                Home
              </button>
              <button 
                onClick={onBackToMarketplace}
                className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                Marketplace
              </button>
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
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
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
                  className="block w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    onBackToMarketplace?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  Marketplace
                </button>
                {connected && account && (
                  <button 
                    onClick={() => {
                      handleDashboard();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                  >
                    Dashboard
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 citadel-dots-bg opacity-40"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-citadel-orange/4 to-transparent rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-citadel-orange/6 to-transparent rounded-full animate-pulse-slower"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={onBackToMarketplace}
            className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Left Column - Quick Info & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Moderator Logo */}
              <div className="citadel-card p-8 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-citadel-orange/20">
                  {getCategoryIcon(suite.category)}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getCategoryIcon(suite.category)}
                  <span className="text-citadel-orange font-medium">{suite.category}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-white">{suite.rating}</span>
                  <span className="text-citadel-steel-light">({formatNumber(suite.upvotes)} votes)</span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="citadel-card p-6">
                <h3 className="font-bold citadel-heading text-lg mb-4">Key Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-citadel-orange" />
                      <span className="text-citadel-light-gray">Upvotes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-citadel-orange">{formatNumber(suite.upvotes || 0)}</span>
                      <button
                        onClick={handleUpvote}
                        className={`p-1 rounded-full transition-colors ${
                          account && suite.id && moderatorStorage.hasUserUpvoted(suite.id, account.address.toString())
                            ? 'bg-citadel-orange/30 cursor-not-allowed'
                            : 'hover:bg-citadel-orange/20'
                        }`}
                        title={
                          account && suite.id && moderatorStorage.hasUserUpvoted(suite.id, account.address.toString())
                            ? 'You have already upvoted this moderator'
                            : 'Upvote this moderator'
                        }
                        disabled={account && suite.id && moderatorStorage.hasUserUpvoted(suite.id, account.address.toString())}
                      >
                        <ThumbsUp className={`w-3 h-3 ${
                          account && suite.id && moderatorStorage.hasUserUpvoted(suite.id, account.address.toString())
                            ? 'text-citadel-orange fill-current'
                            : 'text-citadel-orange hover:text-citadel-orange-bright'
                        }`} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-citadel-orange" />
                      <span className="text-citadel-light-gray">Active Users</span>
                    </div>
                    <span className="font-bold text-citadel-orange">{formatNumber(suite.activeUsers)}</span>
                  </div>
                  {suite.totalHoursUsed && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-citadel-orange" />
                        <span className="text-citadel-light-gray">Total Hours</span>
                      </div>
                      <span className="font-bold text-citadel-orange">{formatNumber(suite.totalHoursUsed)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Acquisition */}
              <div className="citadel-card p-6">
                <h3 className="font-bold citadel-heading text-lg mb-4">Pricing Options</h3>
                
                {/* Hourly Use */}
                <div className={`mb-4 p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPricing === 'hourly' 
                    ? 'bg-citadel-orange/10 border-citadel-orange' 
                    : 'bg-citadel-black-light/50 border-citadel-steel/20 hover:border-citadel-orange/50'
                }`}
                onClick={() => setSelectedPricing(selectedPricing === 'hourly' ? null : 'hourly')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Use Now (Hourly)</span>
                    <span className="text-lg font-bold text-citadel-orange">${suite.price || suite.hourlyPrice}/hr</span>
                  </div>
                  <p className="text-sm text-citadel-steel-light">Pay as you go, perfect for testing</p>
                  {selectedPricing === 'hourly' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase('hourly');
                      }}
                      className="w-full mt-3 citadel-btn-primary py-2 text-sm"
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPricing === 'hourly' ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                      ) : (
                        'Add to List'
                      )}
                    </button>
                  )}
                </div>

                {/* Acquire License */}
                {(suite.licensePrice || suite.monthlyPrice) && (
                  <div className={`mb-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPricing === 'license' 
                      ? 'bg-citadel-orange/10 border-citadel-orange' 
                      : 'bg-citadel-orange/5 border-citadel-orange/30 hover:border-citadel-orange'
                  }`}
                  onClick={() => setSelectedPricing(selectedPricing === 'license' ? null : 'license')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Buy License</span>
                      <span className="text-lg font-bold text-citadel-orange">${suite.licensePrice || suite.monthlyPrice}</span>
                    </div>
                    <p className="text-sm text-citadel-steel-light mb-3">Monthly license with benefits:</p>
                    <ul className="text-sm text-citadel-light-gray space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-citadel-orange" />
                        Unlimited usage hours
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-citadel-orange" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-citadel-orange" />
                        Advanced customization
                      </li>
                    </ul>
                    {selectedPricing === 'license' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase('license');
                        }}
                        className="w-full mt-3 citadel-btn-primary py-2 text-sm"
                        disabled={isProcessing}
                      >
                        {isProcessing && selectedPricing === 'license' ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                        ) : (
                          'Purchase License'
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Buy Outright */}
                {(suite.buyOutrightPrice || suite.buyoutPrice) && (
                  <div className={`mb-6 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPricing === 'buyout' 
                      ? 'bg-citadel-orange/10 border-citadel-orange' 
                      : 'bg-citadel-black-light/50 border-citadel-steel/20 hover:border-citadel-orange/50'
                  }`}
                  onClick={() => setSelectedPricing(selectedPricing === 'buyout' ? null : 'buyout')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">Buy Outright</span>
                      <span className="text-lg font-bold text-citadel-orange">${suite.buyOutrightPrice || suite.buyoutPrice}</span>
                    </div>
                    <p className="text-sm text-citadel-steel-light">One-time purchase, full ownership</p>
                    {selectedPricing === 'buyout' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase('buyout');
                        }}
                        className="w-full mt-3 citadel-btn-primary py-2 text-sm"
                        disabled={isProcessing}
                      >
                        {isProcessing && selectedPricing === 'buyout' ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                        ) : (
                          'Buy Outright'
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Transaction Status */}
                {transactionHash && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      Transaction successful! 
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 underline hover:text-green-300"
                      >
                        View on Explorer
                      </a>
                    </p>
                  </div>
                )}

                {/* Wallet Connection Prompt */}
                {!account && (
                  <div className="mt-4 p-3 bg-citadel-orange/10 border border-citadel-orange/30 rounded-lg">
                    <p className="text-sm text-citadel-orange text-center">
                      Connect your wallet to purchase this moderator
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Suite Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold citadel-heading mb-4">
                  {suite.suiteName || suite.name}
                </h1>
                <p className="text-xl text-citadel-light-gray mb-4">
                  by <span className="text-citadel-orange font-medium">
                    {suite.creator && typeof suite.creator === 'string' && suite.creator.startsWith('0x')
                      ? `${suite.creator.slice(0, 6)}...${suite.creator.slice(-4)}`
                      : suite.creator || 'Unknown Creator'
                    }
                  </span>
                </p>

                {/* Context Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {suite.contextTags ? (
                    suite.contextTags.map((tag: string, index: number) => (
                      <button
                        key={index}
                        className="px-3 py-1 bg-citadel-orange/10 text-citadel-orange border border-citadel-orange/30 rounded-full text-sm hover:bg-citadel-orange/20 transition-colors"
                      >
                        {tag}
                      </button>
                    ))
                  ) : (
                    <>
                      {suite.category && (
                        <button className="px-3 py-1 bg-citadel-orange/10 text-citadel-orange border border-citadel-orange/30 rounded-full text-sm hover:bg-citadel-orange/20 transition-colors">
                          {suite.category}
                        </button>
                      )}
                      {suite.personality && (
                        <button className="px-3 py-1 bg-citadel-orange/10 text-citadel-orange border border-citadel-orange/30 rounded-full text-sm hover:bg-citadel-orange/20 transition-colors">
                          {suite.personality} Personality
                        </button>
                      )}
                      <button className="px-3 py-1 bg-citadel-orange/10 text-citadel-orange border border-citadel-orange/30 rounded-full text-sm hover:bg-citadel-orange/20 transition-colors">
                        AI-Powered
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="citadel-card p-8">
                <h2 className="text-2xl font-bold citadel-heading mb-4">About This Moderator</h2>
                <p className="text-citadel-light-gray leading-relaxed text-lg">
                  {suite.longDescription || suite.description}
                </p>
                {suite.personality && (
                  <div className="mt-6 p-4 bg-citadel-orange/5 rounded-lg border border-citadel-orange/20">
                    <h3 className="text-lg font-semibold text-citadel-orange mb-2">Personality Profile</h3>
                    <p className="text-citadel-light-gray">
                      This moderator has a <strong>{suite.personality}</strong> personality, making it ideal for communities that value this approach to moderation.
                    </p>
                  </div>
                )}
              </div>

              {/* Features Breakdown */}
              <div className="citadel-card p-8">
                <h2 className="text-2xl font-bold citadel-heading mb-6">What's Included?</h2>
                <div className="space-y-6">
                  {suite.detailedFeatures ? (
                    suite.detailedFeatures.map((feature: any, index: number) => (
                      <div key={index} className="border-l-4 border-citadel-orange/30 pl-6">
                        <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
                        <p className="text-citadel-light-gray leading-relaxed">{feature.description}</p>
                      </div>
                    ))
                  ) : suite.keyFeatures ? (
                    suite.keyFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">{feature}</span>
                      </div>
                    ))
                  ) : suite.features ? (
                    suite.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">{feature}</span>
                      </div>
                    ))
                  ) : (
                    // Default features for dynamically created moderators
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">Real-time content moderation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">Custom {suite.personality || 'Professional'} personality</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">{suite.category || 'General'} specialized moderation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">24/7 automated protection</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-citadel-orange flex-shrink-0" />
                        <span className="text-citadel-light-gray">Blockchain-verified ownership</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Moderators Section */}
          {similarModerators.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold citadel-heading mb-8 text-center">
                You Might Also Like
              </h2>
              
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {similarModerators.map((similar) => (
                    <div
                      key={similar.id}
                      className="flex-shrink-0 w-64 citadel-card p-6 cursor-pointer hover:scale-105 transition-transform duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {getCategoryIcon(similar.category)}
                      </div>
                      <h3 className="font-bold text-white text-center mb-2">{similar.suiteName}</h3>
                      <p className="text-citadel-steel-light text-center text-sm mb-3">by {similar.creator}</p>
                      <div className="flex items-center justify-center gap-1 mb-4">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-white">{similar.rating}</span>
                      </div>
                      <button className="w-full citadel-btn-secondary text-sm py-2">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

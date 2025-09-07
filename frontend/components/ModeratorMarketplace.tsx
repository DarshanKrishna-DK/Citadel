import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, TrendingUp, Shield, Gamepad2, Heart, Users, Star, Zap } from 'lucide-react';
import { ModeratorProductCard } from './ModeratorProductCard';
import { MarketplaceNavbar } from './MarketplaceNavbar';
import { ListModeratorModal } from './ListModeratorModal';
import Footer from './Footer';

// Types
export interface ModeratorSuite {
  id: string;
  suiteName: string;
  creator: string;
  creatorLink?: string;
  category: 'Security' | 'Engagement' | 'Gaming';
  description: string;
  longDescription?: string;
  upvotes: number;
  activeUsers: number;
  totalHoursUsed?: number;
  keyFeatures: string[];
  detailedFeatures?: Array<{
    name: string;
    description: string;
  }>;
  contextTags?: string[];
  logoUrl: string;
  price: number;
  licensePrice?: number;
  buyOutrightPrice?: number;
  rating: number;
  similarModerators?: string[];
}

// Mock data for moderator suites
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
    id: "suite-03",
    suiteName: "GameMaster Elite",
    creator: "GameFlow Studios",
    category: "Gaming",
    description: "Specialized moderation tools designed specifically for gaming communities and esports.",
    upvotes: 1620,
    activeUsers: 380,
    keyFeatures: ["Tournament Mode", "Skill Tracker", "Anti-Cheat Monitor"],
    logoUrl: "/gamemaster-logo.png",
    price: 5.99,
    rating: 4.7
  },
  {
    id: "suite-04",
    suiteName: "SafeSpace Guardian",
    creator: "Digital Wellness Co",
    category: "Security",
    description: "Create inclusive, safe environments with advanced content filtering and user protection.",
    upvotes: 1980,
    activeUsers: 610,
    keyFeatures: ["Content Filter", "Harassment Shield", "Mental Health Support"],
    logoUrl: "/safespace-logo.png",
    price: 4.49,
    rating: 4.9
  },
  {
    id: "suite-05",
    suiteName: "Hype Machine",
    creator: "Viral Dynamics",
    category: "Engagement",
    description: "Amplify your community's energy with viral content detection and engagement boosters.",
    upvotes: 1340,
    activeUsers: 290,
    keyFeatures: ["Viral Detector", "Hype Amplifier", "Trend Tracker"],
    logoUrl: "/hype-logo.png",
    price: 2.99,
    rating: 4.4
  },
  {
    id: "suite-06",
    suiteName: "Esports Command Center",
    creator: "Pro Gaming Solutions",
    category: "Gaming",
    description: "Professional-grade moderation suite for competitive gaming and esports tournaments.",
    upvotes: 1120,
    activeUsers: 180,
    keyFeatures: ["Match Coordinator", "Player Stats", "Fair Play Monitor"],
    logoUrl: "/esports-logo.png",
    price: 7.99,
    rating: 4.5
  }
];

const categories = ['All', 'Security', 'Engagement', 'Gaming'] as const;
type CategoryFilter = typeof categories[number];

interface ModeratorMarketplaceProps {
  onBackToLanding?: () => void;
  onViewModeratorDetail?: (moderatorId: string) => void;
}

export const ModeratorMarketplace: React.FC<ModeratorMarketplaceProps> = ({
  onBackToLanding,
  onViewModeratorDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [showListModeratorModal, setShowListModeratorModal] = useState(false);

  // Filter and sort moderator suites
  const filteredSuites = useMemo(() => {
    let filtered = mockModeratorSuites.filter(suite => {
      const matchesSearch = suite.suiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           suite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           suite.keyFeatures.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || suite.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return a.id.localeCompare(b.id); // Simple newest sort by ID
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);


  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-4 h-4" />;
      case 'Engagement':
        return <Heart className="w-4 h-4" />;
      case 'Gaming':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Navbar */}
      <MarketplaceNavbar onBackToLanding={onBackToLanding} />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 citadel-dots-bg opacity-40"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-citadel-orange/4 to-transparent rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-citadel-orange/6 to-transparent rounded-full animate-pulse-slower"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold citadel-heading mb-4">
              CITADEL AI <span className="text-citadel-orange">MARKETPLACE</span>
            </h1>
            <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto">
              Discover, acquire, and deploy powerful AI moderator suites crafted by the community
            </p>
          </div>

          {/* Full Width Search Bar */}
          <div className="citadel-card p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-citadel-steel-light" />
              <input
                type="text"
                placeholder="Search moderator suites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-citadel-black-light border border-citadel-steel/30 rounded-xl text-white placeholder-citadel-light-gray focus:ring-2 focus:ring-citadel-orange focus:border-citadel-orange transition-all"
              />
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Main Content (75%) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Filter and Sort Controls */}
              <div className="citadel-card p-6">

                {/* Filter and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-citadel-orange text-citadel-black'
                            : 'bg-citadel-steel/20 text-citadel-light-gray hover:bg-citadel-orange/20 hover:text-citadel-orange'
                        }`}
                      >
                        {getCategoryIcon(category)}
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Sort and List AI Button */}
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'rating')}
                      className="px-4 py-2 bg-citadel-black-light border border-citadel-steel/30 rounded-lg text-white focus:ring-2 focus:ring-citadel-orange focus:border-citadel-orange"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                    </select>
                    
                    <button
                      onClick={() => setShowListModeratorModal(true)}
                      className="citadel-btn-primary flex items-center gap-2 px-6 py-2"
                    >
                      <Plus className="w-4 h-4" />
                      List Moderator
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-citadel-light-gray">
                  Showing {filteredSuites.length} of {mockModeratorSuites.length} moderator suites
                </p>
                <div className="flex items-center gap-2 text-sm text-citadel-steel-light">
                  <TrendingUp className="w-4 h-4" />
                  <span>Updated 2 minutes ago</span>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSuites.map((suite) => (
                  <ModeratorProductCard
                    key={suite.id}
                    suite={suite}
                    onViewDetails={() => onViewModeratorDetail?.(suite.id)}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredSuites.length === 0 && (
                <div className="text-center py-16">
                  <div className="citadel-card p-12 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-citadel-steel/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-citadel-steel-light" />
                    </div>
                    <h3 className="text-2xl font-bold citadel-heading mb-4">No Results Found</h3>
                    <p className="text-citadel-light-gray mb-6">
                      Try adjusting your search terms or filters to discover more AI moderator suites.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="citadel-btn-secondary"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Top Performers (25%) */}
            <div className="lg:col-span-1">
              <div className="citadel-card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-citadel-orange" />
                  Top Performers
                </h3>
                <div className="space-y-4">
                  {mockModeratorSuites.slice(0, 5).map((suite, index) => (
                    <div key={suite.id} className="p-3 bg-citadel-steel/10 rounded-lg border border-citadel-steel/20 hover:border-citadel-orange/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-citadel-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-citadel-orange font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{suite.suiteName}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-citadel-orange" />
                              <span className="text-citadel-light-gray">{suite.totalUsers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-citadel-light-gray">{Math.floor(Math.random() * 500) + 100}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-green-400" />
                              <span className="text-citadel-light-gray">{Math.floor(Math.random() * 50) + 10}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              <span className="text-citadel-light-gray">{(Math.random() * 5 + 4).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-citadel-steel/20">
                  <div className="text-xs text-citadel-light-gray space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>Active Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3" />
                      <span>Upvotes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      <span>Usage Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* List Moderator Modal */}
      {showListModeratorModal && (
        <ListModeratorModal
          onClose={() => setShowListModeratorModal(false)}
          onSuccess={(newModerator) => {
            console.log('New moderator created:', newModerator);
            setShowListModeratorModal(false);
          }}
          onRedirectToDetail={(moderatorId, moderatorData) => {
            console.log('Redirecting to detail page for:', moderatorId);
            if (onViewModeratorDetail) {
              onViewModeratorDetail(moderatorId);
            }
          }}
        />
      )}
    </div>
  );
};

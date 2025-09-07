import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import Button from './ui/Button';
import { ListModeratorModal } from './ListModeratorModal';
import { Shield, Star, Clock, Users, Zap, TrendingUp, Plus } from 'lucide-react';
import { moderatorStorage } from '../utils/moderatorStorage';

interface ModeratorCard {
  id: string;
  name: string;
  description: string;
  creator: string;
  rating: number;
  totalUsers: number;
  hourlyPrice: number;
  monthlyPrice: number;
  buyoutPrice: number;
  features: string[];
  category: string;
  isActive: boolean;
}

interface PricingOption {
  type: 'hourly' | 'monthly' | 'buyout';
  price: number;
  label: string;
  description: string;
  features?: string[];
}

const Marketplace: React.FC = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [moderators, setModerators] = useState<ModeratorCard[]>([]);
  const [selectedModerator, setSelectedModerator] = useState<ModeratorCard | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<PricingOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showListModal, setShowListModal] = useState(false);

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  // Mock data - will be replaced with dynamic data from smart contracts
  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    console.log('🔄 fetchModerators called');
    
    // Load stored moderators from localStorage
    const storedModerators = moderatorStorage.getAll();
    console.log('📦 Stored moderators from localStorage:', storedModerators.length, storedModerators);
    
    // Convert stored moderators to ModeratorCard format
    const storedAsCards: ModeratorCard[] = storedModerators.map(stored => ({
      id: stored.id,
      name: stored.name,
      description: stored.description,
      creator: stored.creator,
      rating: stored.rating,
      totalUsers: stored.totalUsers,
      hourlyPrice: stored.hourlyPrice,
      monthlyPrice: stored.monthlyPrice,
      buyoutPrice: stored.buyoutPrice,
      features: stored.features,
      category: stored.category.toLowerCase(),
      isActive: stored.isActive
    }));

    // Mock moderators for demo purposes
    const mockModerators: ModeratorCard[] = [
      {
        id: '1',
        name: 'ToxicityShield Pro',
        description: 'Advanced toxicity detection with context awareness and machine learning. Perfect for gaming streams with high chat activity.',
        creator: '0x1234567890abcdef1234567890abcdef12345678',
        rating: 4.9,
        totalUsers: 1247,
        hourlyPrice: 4.99,
        monthlyPrice: 299.99,
        buyoutPrice: 1999.99,
        features: ['Real-time toxicity detection', 'Context awareness', 'Custom rule sets', '24/7 monitoring'],
        category: 'gaming',
        isActive: true
      },
      {
        id: '2',
        name: 'SpamBuster Elite',
        description: 'Intelligent spam detection with learning algorithms that adapt to your community patterns and evolving spam techniques.',
        creator: '0x5678901234abcdef5678901234abcdef56789012',
        rating: 4.8,
        totalUsers: 892,
        hourlyPrice: 3.99,
        monthlyPrice: 249.99,
        buyoutPrice: 1599.99,
        features: ['AI-powered spam detection', 'Pattern learning', 'Auto-moderation', 'Custom filters'],
        category: 'general',
        isActive: true
      },
      {
        id: '3',
        name: 'VibeKeeper AI',
        description: 'Maintains positive community vibes while allowing healthy discussion. Specialized for creative and educational content.',
        creator: '0x9012345678abcdef9012345678abcdef90123456',
        rating: 4.7,
        totalUsers: 654,
        hourlyPrice: 5.99,
        monthlyPrice: 349.99,
        buyoutPrice: 2299.99,
        features: ['Sentiment analysis', 'Positive reinforcement', 'Educational focus', 'Community building'],
        category: 'creative',
        isActive: true
      }
    ];

    // Combine stored moderators (first) with mock moderators
    const allModerators = [...storedAsCards, ...mockModerators];
    console.log('🎯 Setting all moderators:', allModerators.length, allModerators);
    setModerators(allModerators);
  };

  const handleNewModerator = (newModerator: any) => {
    console.log('🎯 handleNewModerator called with:', newModerator);
    
    // Add the new moderator immediately for instant feedback
    const newModeratorCard: ModeratorCard = {
      id: newModerator.id,
      name: newModerator.name,
      description: newModerator.description,
      creator: newModerator.creator,
      rating: newModerator.rating,
      totalUsers: newModerator.totalUsers,
      hourlyPrice: newModerator.hourlyPrice,
      monthlyPrice: newModerator.monthlyPrice,
      buyoutPrice: newModerator.buyoutPrice,
      features: newModerator.features,
      category: newModerator.category.toLowerCase(),
      isActive: newModerator.isActive
    };
    
    console.log('🎯 Adding new moderator card:', newModeratorCard);
    
    // Add to the beginning of the list for immediate display
    setModerators(prev => {
      console.log('🎯 Previous moderators count:', prev.length);
      const updated = [newModeratorCard, ...prev];
      console.log('🎯 Updated moderators count:', updated.length);
      return updated;
    });
    
    // Also refresh from localStorage to ensure consistency
    setTimeout(() => {
      console.log('🎯 Refreshing from localStorage...');
      fetchModerators();
    }, 100);
  };

  const handlePurchase = async (moderator: ModeratorCard, pricingType: 'hourly' | 'monthly' | 'buyout') => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        type: "entry_function_payload",
        function: `0x239e3ad472a4451fb1729abbd956ee37bd23a40e0166c2a8823cf0e41a83b546::ai_moderator::purchase_license_v2`,
        arguments: [
          moderator.id,
          pricingType === 'hourly' ? 1 : pricingType === 'monthly' ? 2 : 3,
          Math.floor(getPriceForType(moderator, pricingType) * 100000000) // Convert to Octas
        ],
        type_arguments: []
      };

      const response = await signAndSubmitTransaction(payload);
      console.log('Transaction successful:', response);
      
      // Show success message
      alert(`Successfully purchased ${moderator.name} with ${pricingType} pricing!`);
      
      // Close modal
      setSelectedModerator(null);
      setSelectedPricing(null);
      
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceForType = (moderator: ModeratorCard, type: 'hourly' | 'monthly' | 'buyout'): number => {
    switch (type) {
      case 'hourly': return moderator.hourlyPrice;
      case 'monthly': return moderator.monthlyPrice;
      case 'buyout': return moderator.buyoutPrice;
      default: return 0;
    }
  };

  const getPricingOptions = (moderator: ModeratorCard): PricingOption[] => [
    {
      type: 'hourly',
      price: moderator.hourlyPrice,
      label: 'Hourly Use',
      description: 'Pay as you go, perfect for testing',
      features: ['Flexible usage', 'No commitment', 'Perfect for testing']
    },
    {
      type: 'monthly',
      price: moderator.monthlyPrice,
      label: 'Acquire License',
      description: 'Monthly license with benefits',
      features: ['Unlimited usage hours', 'Priority support', 'Advanced customization']
    },
    {
      type: 'buyout',
      price: moderator.buyoutPrice,
      label: 'Buy Outright',
      description: 'One-time purchase, full ownership',
      features: ['Full ownership', 'Lifetime access', 'Resale rights', 'Source code access']
    }
  ];

  const filteredModerators = moderators.filter(moderator => {
    const matchesSearch = moderator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moderator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || moderator.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-citadel-black text-white pt-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-citadel-black via-citadel-steel/10 to-citadel-black">
        <div className="absolute inset-0 citadel-dots-bg opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="citadel-heading">The Hall</span>
              <br />
              <span className="text-citadel-orange">AI Moderator Marketplace</span>
            </h1>
            <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto mb-8">
              Discover, license, and deploy intelligent AI moderators built by creators worldwide. 
              Find the perfect guardian for your community.
            </p>
            
            {account && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setShowListModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  List Moderator
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search moderators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-citadel-steel/20 border border-citadel-orange/30 rounded-xl px-4 py-3 text-white placeholder-citadel-light-gray focus:outline-none focus:border-citadel-orange"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-citadel-steel/20 border border-citadel-orange/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-citadel-orange"
          >
            <option value="all">All Categories</option>
            <option value="gaming">Gaming</option>
            <option value="general">General</option>
            <option value="creative">Creative</option>
            <option value="educational">Educational</option>
          </select>
        </div>

        {/* Moderator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModerators.map((moderator) => (
            <div
              key={moderator.id}
              className="citadel-card hover:border-citadel-orange/60 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedModerator(moderator)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-citadel-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{moderator.name}</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-citadel-orange fill-current" />
                      <span className="text-citadel-orange font-semibold">{moderator.rating}</span>
                      <span className="text-citadel-light-gray text-sm">({moderator.totalUsers} users)</span>
                    </div>
                  </div>
                </div>
                {moderator.isActive && (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>

              <p className="text-citadel-light-gray text-sm mb-3 line-clamp-3">
                {moderator.description}
              </p>

              <div className="space-y-2 mb-3">
                {moderator.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-citadel-orange" />
                    <span className="text-citadel-light-gray text-xs">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-3 p-2 bg-citadel-steel/10 rounded-lg">
                <p className="text-xs text-citadel-light-gray">Created by:</p>
                <p className="text-xs font-mono text-citadel-orange">
                  {moderator.creator.slice(0, 6)}...{moderator.creator.slice(-4)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-citadel-orange font-semibold">
                  From ${moderator.hourlyPrice}/hour
                </div>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Modal */}
      {selectedModerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-citadel-black border border-citadel-orange/30 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedModerator.name}</h2>
                <p className="text-citadel-light-gray">{selectedModerator.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedModerator(null);
                  setSelectedPricing(null);
                }}
                className="text-citadel-light-gray hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {getPricingOptions(selectedModerator).map((option) => (
                <div
                  key={option.type}
                  className={`citadel-card cursor-pointer transition-all duration-300 ${
                    selectedPricing?.type === option.type
                      ? 'border-citadel-orange bg-citadel-orange/10'
                      : 'hover:border-citadel-orange/60'
                  }`}
                  onClick={() => setSelectedPricing(option)}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{option.label}</h3>
                    <div className="text-3xl font-bold text-citadel-orange mb-2">
                      ${option.price}{option.type === 'hourly' ? '/hr' : ''}
                    </div>
                    <p className="text-citadel-light-gray text-sm mb-4">{option.description}</p>
                    
                    {option.features && (
                      <div className="space-y-2">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 bg-citadel-orange rounded-full"></div>
                            <span className="text-citadel-light-gray">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Purchase Buttons */}
            {selectedPricing && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handlePurchase(selectedModerator, selectedPricing.type)}
                  disabled={isLoading}
                  className="px-8 py-3"
                >
                  {isLoading ? 'Processing...' : `Purchase ${selectedPricing.label}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPricing(null)}
                  className="px-8 py-3"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List Moderator Modal */}
      {showListModal && (
        <ListModeratorModal
          onClose={() => setShowListModal(false)}
          onSuccess={handleNewModerator}
        />
      )}
    </div>
  );
};

export default Marketplace;
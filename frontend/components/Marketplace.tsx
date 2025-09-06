import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { AIModerator } from '../types';
import { Search, Filter, ShoppingCart, Star } from 'lucide-react';

// Mock data for demonstration
const mockModerators: AIModerator[] = [
  {
    id: '1',
    name: 'ContentGuard Pro',
    personality: 'Strict Professional',
    description: 'Advanced content moderation with AI-powered toxicity detection',
    creator: '0x456...def',
    price: 50,
    licenseCount: 25,
    totalUsageHours: 1200,
    revenue: 1250,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Community Helper',
    personality: 'Friendly Assistant',
    description: 'Helpful moderator that engages with users while maintaining order',
    creator: '0x789...ghi',
    price: 30,
    licenseCount: 45,
    totalUsageHours: 2100,
    revenue: 1350,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'SpamBlocker Elite',
    personality: 'Vigilant Guardian',
    description: 'Specialized in detecting and blocking spam messages',
    creator: '0xabc...jkl',
    price: 35,
    licenseCount: 18,
    totalUsageHours: 800,
    revenue: 630,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'ToxicGuard Plus',
    personality: 'Zero Tolerance',
    description: 'Aggressive moderation for high-risk communities',
    creator: '0xdef...mno',
    price: 75,
    licenseCount: 12,
    totalUsageHours: 600,
    revenue: 900,
    createdAt: new Date('2024-04-05'),
  },
];

const personalities = ['All', 'Strict Professional', 'Friendly Assistant', 'Vigilant Guardian', 'Zero Tolerance'];

export const Marketplace: React.FC = () => {
  const { userRole } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('All');
  const [moderators] = useState<AIModerator[]>(mockModerators);

  const filteredModerators = moderators.filter((moderator) => {
    const matchesSearch = moderator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         moderator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersonality = selectedPersonality === 'All' || moderator.personality === selectedPersonality;
    return matchesSearch && matchesPersonality;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Moderators Marketplace</h1>
              <p className="text-gray-600 mt-1">Discover and license professional AI moderators</p>
            </div>
            {userRole === 'creator' && (
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Mint Your AI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search moderators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Personality Filter */}
            <div className="md:w-64">
              <select
                value={selectedPersonality}
                onChange={(e) => setSelectedPersonality(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {personalities.map((personality) => (
                  <option key={personality} value={personality}>
                    {personality === 'All' ? 'All Personalities' : personality}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Moderator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModerators.map((moderator) => (
            <div key={moderator.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{moderator.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{moderator.personality}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${moderator.price}</p>
                    <p className="text-sm text-gray-600">per license</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{moderator.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>By {moderator.creator}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{moderator.licenseCount} licenses</span>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Acquire License
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredModerators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No moderators found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

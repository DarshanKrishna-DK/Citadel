import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { AIModerator } from '../types';
import { Plus, TrendingUp, Users, DollarSign, Edit, Eye } from 'lucide-react';
import { MintModeratorForm } from './MintModeratorForm';

// Mock data for demonstration
const mockModerators: AIModerator[] = [
  {
    id: '1',
    name: 'ContentGuard Pro',
    personality: 'Strict Professional',
    description: 'Advanced content moderation with AI-powered toxicity detection',
    creator: '0x123...abc',
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
    creator: '0x123...abc',
    price: 30,
    licenseCount: 45,
    totalUsageHours: 2100,
    revenue: 1350,
    createdAt: new Date('2024-02-20'),
  },
];

export const CreatorDashboard: React.FC = () => {
  const { user } = useUser();
  const [moderators, setModerators] = useState<AIModerator[]>(mockModerators);
  const [showMintForm, setShowMintForm] = useState(false);

  const handleMintModerator = (moderatorData: any) => {
    // In a real app, this would interact with the Aptos blockchain
    console.log('Minting moderator:', moderatorData);

    // Add the new moderator to the list (mock)
    const newModerator: AIModerator = {
      id: Date.now().toString(),
      name: moderatorData.name,
      personality: moderatorData.personality,
      description: moderatorData.description,
      creator: user?.address || 'Unknown',
      price: parseFloat(moderatorData.price),
      licenseCount: 0,
      totalUsageHours: 0,
      revenue: 0,
      createdAt: new Date(),
      documents: moderatorData.documents,
    };

    setModerators(prev => [...prev, newModerator]);
  };

  const totalRevenue = moderators.reduce((sum, mod) => sum + mod.revenue, 0);
  const totalLicenses = moderators.reduce((sum, mod) => sum + mod.licenseCount, 0);
  const totalUsage = moderators.reduce((sum, mod) => sum + mod.totalUsageHours, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your AI moderators and track performance</p>
            </div>
            <button
              onClick={() => setShowMintForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Mint New AI Moderator
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Licenses</p>
                <p className="text-2xl font-bold text-gray-900">{totalLicenses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usage Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsage}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Creations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Creations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {moderators.map((moderator) => (
              <div key={moderator.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{moderator.name}</h3>
                    <p className="text-sm text-gray-600">{moderator.personality}</p>
                    <p className="text-sm text-gray-500 mt-1">{moderator.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-semibold text-green-600">${moderator.revenue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Licenses</p>
                      <p className="font-semibold">{moderator.licenseCount}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mint Moderator Form Modal */}
      {showMintForm && (
        <MintModeratorForm
          onClose={() => setShowMintForm(false)}
          onMint={handleMintModerator}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { AIModerator, Upgrade } from '../types';
import { ArrowUp, ShoppingCart, History, Package } from 'lucide-react';
import { UpgradeModeratorForm } from './UpgradeModeratorForm';

// Mock data for demonstration
const mockLicensedModerators: AIModerator[] = [
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
    id: '3',
    name: 'SpamBlocker Elite',
    personality: 'Vigilant Guardian',
    description: 'Specialized in detecting and blocking spam messages',
    creator: '0x789...ghi',
    price: 35,
    licenseCount: 18,
    totalUsageHours: 800,
    revenue: 630,
    createdAt: new Date('2024-03-10'),
  },
];

const mockUpgrades: Upgrade[] = [
  {
    id: 'upgrade-1',
    originalModeratorId: '1',
    upgradedBy: '0x123...abc',
    changes: 'Enhanced spam detection algorithms',
    feedback: 'Added better false positive handling',
    createdAt: new Date('2024-06-01'),
  },
];

export const StreamerDashboard: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'moderators' | 'history' | 'listings'>('moderators');
  const [licensedModerators] = useState<AIModerator[]>(mockLicensedModerators);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(mockUpgrades);
  const [selectedModeratorForUpgrade, setSelectedModeratorForUpgrade] = useState<AIModerator | null>(null);

  const handleUpgradeModerator = (upgradeData: any) => {
    // In a real app, this would interact with the Aptos blockchain
    console.log('Upgrading moderator:', upgradeData);

    // Add the upgrade to the list (mock)
    const newUpgrade: Upgrade = {
      id: Date.now().toString(),
      originalModeratorId: upgradeData.originalModeratorId,
      upgradedBy: user?.address || 'Unknown',
      changes: upgradeData.changes,
      feedback: upgradeData.feedback,
      documents: upgradeData.documents,
      createdAt: new Date(),
    };

    setUpgrades(prev => [...prev, newUpgrade]);
  };

  const tabs = [
    { id: 'moderators', label: 'My Licensed Moderators', icon: Package },
    { id: 'history', label: 'Acquisition History', icon: History },
    { id: 'listings', label: 'My Listings', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Streamer Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your licensed moderators and upgrades</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'moderators' && (
            <div className="grid gap-6">
              {licensedModerators.map((moderator) => (
                <div key={moderator.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{moderator.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{moderator.personality}</p>
                      <p className="text-gray-700 mt-2">{moderator.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-sm text-gray-500">Creator: {moderator.creator}</span>
                        <span className="text-sm text-gray-500">Licensed: {moderator.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Deploy
                      </button>
                      <button
                        onClick={() => setSelectedModeratorForUpgrade(moderator)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                        Upgrade Moderator
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Acquisition History</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {licensedModerators.map((moderator) => (
                  <div key={moderator.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{moderator.name}</h4>
                        <p className="text-sm text-gray-600">Acquired on {moderator.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${moderator.price}</p>
                        <p className="text-sm text-gray-600">License Fee</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Upgrade Listings</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upgrades.map((upgrade) => (
                  <div key={upgrade.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Upgrade for Moderator #{upgrade.originalModeratorId}</h4>
                        <p className="text-sm text-gray-600 mt-1">{upgrade.changes}</p>
                        <p className="text-sm text-gray-500 mt-1">{upgrade.feedback}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Listed on</p>
                        <p className="font-medium">{upgrade.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Moderator Form Modal */}
      {selectedModeratorForUpgrade && (
        <UpgradeModeratorForm
          moderator={selectedModeratorForUpgrade}
          onClose={() => setSelectedModeratorForUpgrade(null)}
          onUpgrade={handleUpgradeModerator}
        />
      )}
    </div>
  );
};

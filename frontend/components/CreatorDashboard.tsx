import React, { useState } from 'react';
import { Header } from './Header';
import { AIModerator } from '../types';
import { Plus, TrendingUp, Users, DollarSign, Crown, Settings, Eye } from 'lucide-react';

// Mock data for creator's moderators
const mockCreatorModerators: AIModerator[] = [
  {
    id: '1',
    name: 'ContentGuard Pro',
    personality: 'Professional',
    description: 'Advanced content moderation with toxicity detection and spam filtering capabilities.',
    creator: '0xabc...123',
    price: 2.5,
    licenseCount: 45,
    totalUsageHours: 1200,
    revenue: 112.5,
    createdAt: new Date('2024-01-15'),
    avatar: '🛡️',
    skills: {
      toxicityDetection: 95,
      spamFiltering: 88,
      contextAwareness: 92,
      responseSpeed: 85,
      customization: 78
    },
    rating: 4.8,
    tags: ['Professional', 'High-Performance', 'Reliable'],
    isActive: true
  },
  {
    id: '2',
    name: 'StreamSafe AI',
    personality: 'Friendly',
    description: 'Community-focused moderator that maintains positive vibes while ensuring safety.',
    creator: '0xabc...123',
    price: 1.8,
    licenseCount: 32,
    totalUsageHours: 890,
    revenue: 57.6,
    createdAt: new Date('2024-02-01'),
    avatar: '🤖',
    skills: {
      toxicityDetection: 82,
      spamFiltering: 90,
      contextAwareness: 88,
      responseSpeed: 92,
      customization: 85
    },
    rating: 4.6,
    tags: ['Community', 'Friendly', 'Fast'],
    isActive: true
  }
];

export const CreatorDashboard: React.FC = () => {
  const [moderators] = useState<AIModerator[]>(mockCreatorModerators);
  const [showMintForm, setShowMintForm] = useState(false);

  const totalRevenue = moderators.reduce((sum, mod) => sum + mod.revenue, 0);
  const totalLicenses = moderators.reduce((sum, mod) => sum + mod.licenseCount, 0);
  const totalUsageHours = moderators.reduce((sum, mod) => sum + mod.totalUsageHours, 0);

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-citadel-black-light/50 border-b border-citadel-steel/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold citadel-heading mb-4">
                MY <span className="text-citadel-orange">CITADEL</span>
              </h1>
              <p className="text-xl text-citadel-light-gray">
                Manage your AI moderator empire and track your digital fortress growth.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-8 h-8 text-citadel-orange" />
              <span className="text-2xl font-bold text-citadel-orange">Creator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="citadel-card p-6 text-center">
            <DollarSign className="w-8 h-8 text-citadel-orange mx-auto mb-4" />
            <div className="text-3xl font-bold text-citadel-orange mb-2">{totalRevenue.toFixed(1)}</div>
            <div className="text-citadel-light-gray">Total Revenue (APT)</div>
          </div>
          <div className="citadel-card p-6 text-center">
            <Users className="w-8 h-8 text-citadel-orange mx-auto mb-4" />
            <div className="text-3xl font-bold text-citadel-orange mb-2">{totalLicenses}</div>
            <div className="text-citadel-light-gray">Active Licenses</div>
          </div>
          <div className="citadel-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-citadel-orange mx-auto mb-4" />
            <div className="text-3xl font-bold text-citadel-orange mb-2">{totalUsageHours}</div>
            <div className="text-citadel-light-gray">Usage Hours</div>
          </div>
          <div className="citadel-card p-6 text-center">
            <Crown className="w-8 h-8 text-citadel-orange mx-auto mb-4" />
            <div className="text-3xl font-bold text-citadel-orange mb-2">{moderators.length}</div>
            <div className="text-citadel-light-gray">AI Moderators</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold citadel-heading">Your AI Moderators</h2>
          <button 
            onClick={() => setShowMintForm(true)}
            className="citadel-btn-primary flex items-center gap-3 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            Forge New AI
          </button>
        </div>

        {/* Moderators Grid */}
        {moderators.length === 0 ? (
          <div className="text-center py-20">
            <div className="citadel-card p-16 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-citadel-steel/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Crown className="w-12 h-12 text-citadel-steel-light" />
              </div>
              <h3 className="text-3xl font-bold citadel-heading mb-4">Start Your Empire</h3>
              <p className="text-citadel-light-gray text-lg mb-8">
                Create your first AI moderator and begin building your digital fortress.
              </p>
              <button 
                onClick={() => setShowMintForm(true)}
                className="citadel-btn-primary flex items-center gap-3 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Forge Your First AI
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {moderators.map((moderator) => (
              <div key={moderator.id} className="citadel-card-angled p-8 group">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-2xl flex items-center justify-center text-2xl group-hover:animate-glow-pulse">
                    {moderator.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-citadel-orange transition-colors">
                      {moderator.name}
                    </h3>
                    <p className="text-citadel-orange font-medium">{moderator.personality}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${moderator.isActive ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                    <span className="text-sm text-citadel-light-gray">
                      {moderator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-citadel-orange">{moderator.licenseCount}</div>
                    <div className="text-xs text-citadel-light-gray">Licenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-citadel-orange">{moderator.revenue.toFixed(1)}</div>
                    <div className="text-xs text-citadel-light-gray">Revenue (APT)</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-citadel-light-gray text-sm mb-6 leading-relaxed">
                  {moderator.description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="citadel-btn-secondary flex-1 flex items-center justify-center gap-2 py-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="citadel-btn-secondary flex-1 flex items-center justify-center gap-2 py-2">
                    <Settings className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mint Form Modal Placeholder */}
      {showMintForm && (
        <div className="fixed inset-0 bg-citadel-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="citadel-card p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold citadel-heading mb-4">Forge New AI</h3>
            <p className="text-citadel-light-gray mb-6">
              The AI forging interface will be available soon. Stay tuned for the ability to create custom AI moderators.
            </p>
            <button 
              onClick={() => setShowMintForm(false)}
              className="citadel-btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

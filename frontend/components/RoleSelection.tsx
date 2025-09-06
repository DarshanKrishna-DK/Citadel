import React from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types';
import { Shield, Users } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected }) => {
  const { user } = useUser();

  const handleRoleSelect = (role: UserRole) => {
    onRoleSelected(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-citadel-light-gray to-citadel-orange-light flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-citadel-black mb-4">
            Welcome to <span className="text-citadel-orange">Citadel</span>
          </h1>
          <p className="text-xl text-citadel-dark-gray max-w-2xl mx-auto">
            The decentralized marketplace for AI moderators. Choose your role to get started.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Creator Card */}
          <div
            onClick={() => handleRoleSelect('creator')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-citadel-orange"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-citadel-orange-light rounded-full p-4 mb-6">
                <Shield className="w-12 h-12 text-citadel-orange" />
              </div>
              <h3 className="text-2xl font-bold text-citadel-black mb-4">Creator</h3>
              <p className="text-citadel-dark-gray mb-6">
                Build, list, and earn from your AI moderators. Create innovative moderation solutions and monetize your expertise.
              </p>
              <div className="bg-citadel-orange-light rounded-lg p-4 w-full">
                <ul className="text-sm text-citadel-dark-gray space-y-2">
                  <li>• Mint new AI Moderators</li>
                  <li>• Manage your creations</li>
                  <li>• Track revenue & analytics</li>
                  <li>• Build your reputation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Streamer Card */}
          <div
            onClick={() => handleRoleSelect('streamer')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-citadel-orange"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-citadel-orange-light rounded-full p-4 mb-6">
                <Users className="w-12 h-12 text-citadel-orange" />
              </div>
              <h3 className="text-2xl font-bold text-citadel-black mb-4">Streamer</h3>
              <p className="text-citadel-dark-gray mb-6">
                License, use, and upgrade moderators for your community. Access professional moderation tools with ease.
              </p>
              <div className="bg-citadel-orange-light rounded-lg p-4 w-full">
                <ul className="text-sm text-citadel-dark-gray space-y-2">
                  <li>• Browse moderator marketplace</li>
                  <li>• License professional tools</li>
                  <li>• Upgrade existing moderators</li>
                  <li>• Manage your collection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-citadel-dark-gray">
            Connected as: <span className="font-mono text-sm">
              {user?.address
                ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
                : 'Loading...'}
            </span>
          </p>
          <p className="text-sm text-citadel-dark-gray mt-2">
            Your role selection determines your dashboard and available features
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { UserRole } from '../types';
import { Crown, Zap, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected }) => {
  return (
    <div className="min-h-screen bg-citadel-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-citadel-orange/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-citadel-orange/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-citadel-orange/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-6xl md:text-7xl font-bold citadel-heading mb-6">
              CHOOSE YOUR <span className="text-citadel-orange">PATH</span>
            </h1>
            <p className="text-xl text-citadel-light-gray max-w-2xl mx-auto">
              Enter the Citadel as a Creator to forge AI moderators, or as a Streamer to acquire and deploy them.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creator Card */}
            <div 
              onClick={() => onRoleSelected('creator')}
              className="citadel-card-angled p-10 cursor-pointer group citadel-interactive citadel-hover-lift"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:animate-glow-pulse">
                  <Crown className="w-12 h-12 text-citadel-black" />
                </div>
                
                <h2 className="text-4xl font-bold citadel-heading mb-4">CREATOR</h2>
                <p className="text-citadel-light-gray text-lg mb-8 leading-relaxed">
                  Forge powerful AI moderators with unique personalities and capabilities. 
                  Monetize your creations and build your digital empire.
                </p>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Design AI personalities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Set licensing prices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Earn from your creations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Manage your portfolio</span>
                  </div>
                </div>

                <div className="citadel-btn-primary w-full flex items-center justify-center gap-3 group-hover:scale-105 transition-transform">
                  Enter as Creator
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Streamer Card */}
            <div 
              onClick={() => onRoleSelected('streamer')}
              className="citadel-card-angled p-10 cursor-pointer group citadel-interactive citadel-hover-lift"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:animate-glow-pulse">
                  <Zap className="w-12 h-12 text-citadel-black" />
                </div>
                
                <h2 className="text-4xl font-bold citadel-heading mb-4">STREAMER</h2>
                <p className="text-citadel-light-gray text-lg mb-8 leading-relaxed">
                  Discover and license cutting-edge AI moderators to protect and enhance 
                  your community with intelligent automation.
                </p>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Browse AI moderators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">License for your community</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Customize behavior</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-citadel-orange rounded-full"></div>
                    <span className="text-citadel-light-gray">Deploy instantly</span>
                  </div>
                </div>

                <div className="citadel-btn-primary w-full flex items-center justify-center gap-3 group-hover:scale-105 transition-transform">
                  Enter as Streamer
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <p className="text-citadel-steel-light text-sm">
              You can switch roles anytime from your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

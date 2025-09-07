import React from 'react';
import { Star, Users, ThumbsUp, Shield, Heart, Gamepad2, ExternalLink, Zap } from 'lucide-react';
import { ModeratorSuite } from './ModeratorMarketplace';

interface ModeratorProductCardProps {
  suite: ModeratorSuite;
  onViewDetails?: () => void;
}

export const ModeratorProductCard: React.FC<ModeratorProductCardProps> = ({ suite, onViewDetails }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-4 h-4 text-citadel-orange" />;
      case 'Engagement':
        return <Heart className="w-4 h-4 text-citadel-orange" />;
      case 'Gaming':
        return <Gamepad2 className="w-4 h-4 text-citadel-orange" />;
      default:
        return <Zap className="w-4 h-4 text-citadel-orange" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Engagement':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Gaming':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-citadel-orange/20 text-citadel-orange border-citadel-orange/30';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="citadel-card group transition-all duration-300 relative overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4">
        {/* Logo and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo Placeholder */}
            <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center border border-citadel-orange/20">
              {getCategoryIcon(suite.category)}
            </div>
            
            {/* Category Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(suite.category)}`}>
              {suite.category}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-citadel-black-light px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-white">{suite.rating}</span>
          </div>
        </div>

        {/* Suite Name and Creator */}
        <div className="mb-3">
          <h3 className="text-xl font-bold citadel-heading mb-1 group-hover:text-citadel-orange transition-colors">
            {suite.suiteName}
          </h3>
          <p className="text-sm text-citadel-steel-light">
            by <span className="text-citadel-orange font-medium">{suite.creator}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-citadel-light-gray text-sm leading-relaxed mb-4 line-clamp-2">
          {suite.description}
        </p>

        {/* Key Features */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-citadel-steel-light uppercase tracking-wide mb-2">
            Key Features
          </h4>
          <div className="flex flex-wrap gap-1">
            {suite.keyFeatures.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-citadel-steel/10 text-citadel-light-gray text-xs rounded-md border border-citadel-steel/20"
              >
                {feature}
              </span>
            ))}
            {suite.keyFeatures.length > 3 && (
              <span className="px-2 py-1 bg-citadel-orange/10 text-citadel-orange text-xs rounded-md border border-citadel-orange/20">
                +{suite.keyFeatures.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 pb-6">
        {/* Social Proof */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-citadel-steel-light">
              <ThumbsUp className="w-4 h-4" />
              <span>{formatNumber(suite.upvotes)}</span>
            </div>
            <div className="flex items-center gap-1 text-citadel-steel-light">
              <Users className="w-4 h-4" />
              <span>{formatNumber(suite.activeUsers)}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-bold text-citadel-orange">
              ${suite.price}
            </div>
            <div className="text-xs text-citadel-steel-light">
              per hour
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onViewDetails}
            className="w-full citadel-btn-primary text-sm py-2 px-4 group/btn"
          >
            <span className="flex items-center justify-center gap-2">
              View Details
              <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-citadel-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

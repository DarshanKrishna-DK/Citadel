import React, { useState } from 'react';
import { X, Twitch, Youtube, Loader2, Zap, Shield, Users } from 'lucide-react';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  moderator: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
  onTwitchConnect: () => void;
  onYouTubeConnect: () => void;
}

export const GoLiveModal: React.FC<GoLiveModalProps> = ({
  isOpen,
  onClose,
  moderator,
  onTwitchConnect,
  onYouTubeConnect
}) => {
  const [isConnecting, setIsConnecting] = useState<'twitch' | 'youtube' | null>(null);

  if (!isOpen) return null;

  const handleTwitchConnect = async () => {
    setIsConnecting('twitch');
    try {
      await onTwitchConnect();
    } catch (error) {
      console.error('Twitch connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleYouTubeConnect = async () => {
    setIsConnecting('youtube');
    try {
      await onYouTubeConnect();
    } catch (error) {
      console.error('YouTube connection failed:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-citadel-black-light border border-citadel-orange/30 rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Launch Your Moderator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-citadel-steel/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-citadel-light-gray" />
          </button>
        </div>

        {/* Moderator Info */}
        <div className="bg-citadel-steel/10 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-citadel-orange/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-citadel-orange" />
            </div>
            <div>
              <h3 className="font-bold text-white">{moderator.name}</h3>
              <p className="text-sm text-citadel-light-gray capitalize">{moderator.category}</p>
            </div>
          </div>
          <p className="text-sm text-citadel-steel">{moderator.description}</p>
        </div>

        {/* Platform Selection */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose Your Platform</h3>
          
          {/* Twitch Option */}
          <button
            onClick={handleTwitchConnect}
            disabled={isConnecting !== null}
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition-colors flex items-center justify-center gap-3 text-white font-medium"
          >
            {isConnecting === 'twitch' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to Twitch...
              </>
            ) : (
              <>
                <Twitch className="w-5 h-5" />
                Connect with Twitch
              </>
            )}
          </button>

          {/* YouTube Option */}
          <button
            onClick={handleYouTubeConnect}
            disabled={isConnecting !== null}
            className="w-full p-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 rounded-lg transition-colors flex items-center justify-center gap-3 text-white font-medium"
          >
            {isConnecting === 'youtube' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to YouTube...
              </>
            ) : (
              <>
                <Youtube className="w-5 h-5" />
                Connect with YouTube
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="bg-citadel-steel/5 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-citadel-light-gray mb-3">What happens next:</h4>
          <div className="space-y-2 text-sm text-citadel-steel">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-citadel-orange" />
              <span>Real-time chat monitoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-citadel-orange" />
              <span>Automated moderation actions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-citadel-orange" />
              <span>Live analytics dashboard</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 p-3 bg-citadel-orange/10 border border-citadel-orange/30 rounded-lg">
          <p className="text-xs text-citadel-orange">
            <strong>Note:</strong> You'll be redirected to authorize with your chosen platform, then taken to your live streaming dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
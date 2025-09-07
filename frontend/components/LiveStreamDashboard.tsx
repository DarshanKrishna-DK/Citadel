import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, MessageSquare, Ban, Clock, Pause, Play, Zap, AlertTriangle } from 'lucide-react';
import { MarketplaceNavbar } from './MarketplaceNavbar';

interface LiveStats {
  chatsAnalyzed: number;
  bansIssued: number;
  timeoutsIssued: number;
  activeViewers: number;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isActedUpon: boolean;
  actionType?: 'deleted' | 'timeout' | 'ban';
}

interface LiveStreamDashboardProps {
  moderatorId: string;
  platform: 'Twitch' | 'YouTube';
  onBackToLanding?: () => void;
  onEndStream?: () => void;
}

// Mock data
const mockModerator = {
  id: "suite-01",
  name: "Aegis Warden",
  logoUrl: "/aegis-logo.png"
};

const generateMockChatMessage = (): ChatMessage => {
  const usernames = ['StreamFan123', 'GamerGirl', 'ChatMaster', 'ViewerBot', 'TrollHunter', 'ModSquad'];
  const messages = [
    'Great stream!',
    'Love this game',
    'When is the next stream?',
    'This is awesome!',
    'Can you play my song?',
    'First time here, loving it!',
    'Your setup is amazing',
    'How long have you been streaming?'
  ];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    username: usernames[Math.floor(Math.random() * usernames.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toLocaleTimeString(),
    isActedUpon: Math.random() < 0.1, // 10% chance of being acted upon
    actionType: Math.random() < 0.5 ? 'deleted' : 'timeout'
  };
};

export const LiveStreamDashboard: React.FC<LiveStreamDashboardProps> = ({
  platform,
  onBackToLanding,
  onEndStream
}) => {
  const [isLive, setIsLive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    chatsAnalyzed: 1247,
    bansIssued: 3,
    timeoutsIssued: 12,
    activeViewers: 1834
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [manualBanUsername, setManualBanUsername] = useState('');
  const [manualTimeoutUsername, setManualTimeoutUsername] = useState('');
  const [showBanInput, setShowBanInput] = useState(false);
  const [showTimeoutInput, setShowTimeoutInput] = useState(false);

  // Simulate real-time chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive && !isPaused) {
        const newMessage = generateMockChatMessage();
        setChatMessages(prev => [newMessage, ...prev.slice(0, 49)]); // Keep last 50 messages
        
        // Update stats occasionally
        if (Math.random() < 0.3) {
          setLiveStats(prev => ({
            ...prev,
            chatsAnalyzed: prev.chatsAnalyzed + 1,
            bansIssued: prev.bansIssued + (Math.random() < 0.05 ? 1 : 0),
            timeoutsIssued: prev.timeoutsIssued + (Math.random() < 0.1 ? 1 : 0),
            activeViewers: prev.activeViewers + Math.floor(Math.random() * 10 - 5)
          }));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, isPaused]);

  const handleEndStream = () => {
    setIsLive(false);
    onEndStream?.();
  };

  const handleManualBan = () => {
    if (manualBanUsername.trim()) {
      // In a real app, this would call the platform API
      console.log(`Manually banned user: ${manualBanUsername}`);
      setManualBanUsername('');
      setShowBanInput(false);
      setLiveStats(prev => ({ ...prev, bansIssued: prev.bansIssued + 1 }));
    }
  };

  const handleManualTimeout = () => {
    if (manualTimeoutUsername.trim()) {
      // In a real app, this would call the platform API
      console.log(`Manually timed out user: ${manualTimeoutUsername}`);
      setManualTimeoutUsername('');
      setShowTimeoutInput(false);
      setLiveStats(prev => ({ ...prev, timeoutsIssued: prev.timeoutsIssued + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Navbar */}
      <MarketplaceNavbar onBackToLanding={onBackToLanding} />

      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 citadel-dots-bg opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-citadel-orange/4 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-citadel-orange/6 to-transparent rounded-full animate-pulse-slower"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header / Status Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-bold">LIVE</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    platform === 'Twitch' ? 'bg-purple-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {platform === 'Twitch' ? 'T' : 'Y'}
                  </div>
                  <span className="text-citadel-light-gray">{platform}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleEndStream}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              End Stream
            </button>
          </div>

          {/* Live Stats Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="citadel-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-citadel-orange" />
                <span className="text-citadel-light-gray text-sm">Chats Analyzed</span>
              </div>
              <div className="text-2xl font-bold text-white">{liveStats.chatsAnalyzed.toLocaleString()}</div>
            </div>
            
            <div className="citadel-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-4 h-4 text-red-400" />
                <span className="text-citadel-light-gray text-sm">Bans Issued</span>
              </div>
              <div className="text-2xl font-bold text-white">{liveStats.bansIssued}</div>
            </div>
            
            <div className="citadel-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-citadel-light-gray text-sm">Timeouts Issued</span>
              </div>
              <div className="text-2xl font-bold text-white">{liveStats.timeoutsIssued}</div>
            </div>
            
            <div className="citadel-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-citadel-orange" />
                <span className="text-citadel-light-gray text-sm">Active Viewers</span>
              </div>
              <div className="text-2xl font-bold text-white">{liveStats.activeViewers.toLocaleString()}</div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Feed */}
            <div className="lg:col-span-3">
              <div className="citadel-card p-6">
                <h2 className="text-xl font-bold citadel-heading mb-4">Live Chat Feed</h2>
                <div className="h-96 overflow-y-auto space-y-2 bg-citadel-black-light/30 rounded-lg p-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 p-2 rounded ${
                        message.isActedUpon 
                          ? 'bg-red-500/10 border border-red-500/20 opacity-60' 
                          : 'hover:bg-citadel-steel/10'
                      }`}
                    >
                      <div className="text-xs text-citadel-steel-light min-w-[60px]">
                        {message.timestamp}
                      </div>
                      <div className="flex-1">
                        <span className="text-citadel-orange font-medium text-sm">
                          {message.username}:
                        </span>
                        <span className="text-citadel-light-gray ml-2">
                          {message.message}
                        </span>
                        {message.isActedUpon && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 text-xs">
                              {message.actionType === 'deleted' ? 'Message deleted' : 
                               message.actionType === 'timeout' ? 'User timed out' : 'User banned'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Control Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Active Moderator */}
              <div className="citadel-card p-6">
                <h3 className="text-lg font-bold citadel-heading mb-4">Active Moderator</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-citadel-orange" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{mockModerator.name}</div>
                    <div className="text-citadel-light-gray text-sm">Level 5</div>
                  </div>
                </div>
                <button className="w-full citadel-btn-secondary text-sm">
                  Select Moderator
                </button>
              </div>

              {/* Manual Override Controls */}
              <div className="citadel-card p-6">
                <h3 className="text-lg font-bold citadel-heading mb-4">Manual Controls</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isPaused 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Resume AI' : 'Pause AI'}
                  </button>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowBanInput(!showBanInput)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Manual Ban User
                    </button>
                    {showBanInput && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualBanUsername}
                          onChange={(e) => setManualBanUsername(e.target.value)}
                          placeholder="Username"
                          className="flex-1 bg-citadel-black-light border border-citadel-steel/30 rounded px-3 py-2 text-white text-sm"
                        />
                        <button
                          onClick={handleManualBan}
                          className="citadel-btn-primary text-sm px-3"
                        >
                          Ban
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowTimeoutInput(!showTimeoutInput)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Manual Timeout User
                    </button>
                    {showTimeoutInput && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualTimeoutUsername}
                          onChange={(e) => setManualTimeoutUsername(e.target.value)}
                          placeholder="Username"
                          className="flex-1 bg-citadel-black-light border border-citadel-steel/30 rounded px-3 py-2 text-white text-sm"
                        />
                        <button
                          onClick={handleManualTimeout}
                          className="citadel-btn-primary text-sm px-3"
                        >
                          Timeout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

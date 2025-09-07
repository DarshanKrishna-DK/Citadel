import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { io, Socket } from 'socket.io-client';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  Ban, 
  Clock, 
  Activity,
  Home,
  Settings,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Zap,
  Eye,
  Pause,
  Play,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Twitch,
  ArrowLeft
} from 'lucide-react';
import Footer from './Footer';

interface LiveDashboardProps {
  onBackToLanding?: () => void;
  onBackToDashboard?: () => void;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isModerator: boolean;
  isSubscriber: boolean;
  badges: string[];
  action?: 'timeout' | 'ban' | 'delete';
}

interface StreamStats {
  isLive: boolean;
  viewerCount: number;
  uptime: string;
  title: string;
  category: string;
}

interface ModerationStats {
  chatsAnalyzed: number;
  timeoutsIssued: number;
  bansIssued: number;
  messagesDeleted: number;
  spamBlocked: number;
  toxicityScore: number;
}

const LiveDashboard: React.FC<LiveDashboardProps> = ({ onBackToLanding, onBackToDashboard }) => {
  const { account, connected, disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [moderatorName, setModeratorName] = useState('AI Moderator');
  const [twitchUsername, setTwitchUsername] = useState('');
  
  const [streamStats, setStreamStats] = useState<StreamStats>({
    isLive: false,
    viewerCount: 0,
    uptime: '0m',
    title: 'Stream Offline',
    category: 'N/A'
  });

  const [moderationStats, setModerationStats] = useState<ModerationStats>({
    chatsAnalyzed: 0,
    timeoutsIssued: 0,
    bansIssued: 0,
    messagesDeleted: 0,
    spamBlocked: 0,
    toxicityScore: 0
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Initialize WebSocket connection and extract URL parameters
  useEffect(() => {
    console.log('🔍 LiveDashboard: Initializing real-time connection');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Hash:', window.location.hash);
    console.log('📍 Search:', window.location.search);

    // Extract URL parameters
    let urlParams = new URLSearchParams(window.location.search);
    
    // If no params in search, check if they're after the hash
    if (!urlParams.has('moderator') && !urlParams.has('twitch')) {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const hashParams = hash.split('?')[1];
        urlParams = new URLSearchParams(hashParams);
        console.log('📍 Using hash-based parameters:', hashParams);
      }
    }
    
    const moderatorParam = urlParams.get('moderator');
    const twitchParam = urlParams.get('twitch');
    
    console.log('📊 Extracted parameters:', { moderatorParam, twitchParam });
    
    if (moderatorParam) {
      console.log('✅ Setting moderator name:', moderatorParam);
      setModeratorName(moderatorParam);
    }
    if (twitchParam) {
      console.log('✅ Setting Twitch username:', twitchParam);
      setTwitchUsername(twitchParam);
      setShowWelcomeMessage(true);
      setTimeout(() => setShowWelcomeMessage(false), 5000);
    }

    // Initialize Socket.IO connection
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    // Connection status handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to real-time server');
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time server');
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    // Real-time data handlers
    socket.on('chatMessage', (message: ChatMessage) => {
      console.log('💬 Real chat message received:', message);
      setChatMessages(prev => [...prev.slice(-49), message]);
    });

    socket.on('moderationStats', (stats: ModerationStats) => {
      console.log('📊 Moderation stats updated:', stats);
      setModerationStats(stats);
    });

    socket.on('streamStatus', (status: StreamStats) => {
      console.log('📺 Stream status updated:', status);
      setStreamStats(status);
    });

    socket.on('connectionStatus', (status: { connected: boolean; channel?: string; reason?: string }) => {
      console.log('🎮 Twitch connection status:', status);
      setIsConnected(status.connected);
      if (status.connected && status.channel) {
        setConnectionStatus(`Connected to ${status.channel}`);
      } else {
        setConnectionStatus(status.reason || 'Disconnected');
      }
    });

    socket.on('moderationAction', (action: any) => {
      console.log('🚨 Moderation action taken:', action);
      // You could show notifications here
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, []);

  // Real-time chat auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end this moderation session?')) {
      setIsSessionActive(false);
      setConnectionStatus('Disconnecting...');
      
      try {
        // Disconnect from Twitch chat
        const response = await fetch('http://localhost:3000/api/auth/twitch/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelName: twitchUsername })
        });

        if (response.ok) {
          console.log('✅ Successfully disconnected from Twitch chat');
        } else {
          console.error('❌ Failed to disconnect from Twitch chat');
        }
      } catch (error) {
        console.error('❌ Error disconnecting from Twitch:', error);
      }

      // Disconnect WebSocket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      alert('Moderation session ended. Redirecting to dashboard...');
      setTimeout(() => {
        onBackToDashboard?.();
      }, 2000);
    }
  };

  const handlePauseSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Welcome Message */}
      {showWelcomeMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 border border-green-500 rounded-lg p-4 shadow-lg animate-slide-in-right">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-bold text-white">Successfully Connected!</h3>
              <p className="text-green-100 text-sm">
                Your AI moderator is now monitoring {twitchUsername ? `@${twitchUsername}'s` : 'your'} Twitch chat
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-steel/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center animate-glow-pulse">
                <Shield className="w-6 h-6 text-citadel-black" />
              </div>
              <h1 className="text-2xl font-bold citadel-heading">CITADEL</h1>
              <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-400">LIVE</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {connected && account ? (
                <div className="hidden sm:flex items-center gap-3 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-citadel-light-gray bg-citadel-steel/20 px-4 py-2 rounded-lg border border-citadel-orange/30 hover:border-citadel-orange/50 transition-colors"
                  >
                    <span className="font-mono text-citadel-orange">
                      {formatAddress(account.address?.toString() || '')}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isWalletDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-citadel-black-light border border-citadel-orange/30 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            onBackToDashboard?.();
                            setIsWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            disconnect();
                            setIsWalletDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="wallet-selector-container">
                  <WalletSelector />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-citadel-steel/30 bg-citadel-black/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button 
                  onClick={() => {
                    onBackToDashboard?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    onBackToLanding?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-citadel-light-gray hover:text-citadel-orange transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 min-h-screen">
        {/* Status Header */}
        <div className="bg-citadel-black-light border-b border-citadel-steel/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-citadel-orange/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-citadel-orange" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{moderatorName}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      <Twitch className="w-4 h-4 text-purple-400" />
                      <span className="text-citadel-light-gray">@{twitchUsername || 'connecting'}</span>
                      <div className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs">{connectionStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {streamStats.isLive && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-citadel-orange" />
                      <span className="text-white font-medium">{streamStats.viewerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-citadel-orange" />
                      <span className="text-white font-medium">{streamStats.uptime}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePauseSession}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSessionActive 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSessionActive ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause AI
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Resume AI
                    </>
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Analytics Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Moderation Stats */}
              <div className="citadel-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Live Analytics</h2>
                  <Activity className="w-5 h-5 text-citadel-orange" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-citadel-light-gray text-sm">Chats Analyzed</span>
                    <span className="text-white font-bold">{moderationStats.chatsAnalyzed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-citadel-light-gray text-sm">Timeouts Issued</span>
                    <span className="text-yellow-400 font-bold">{moderationStats.timeoutsIssued}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-citadel-light-gray text-sm">Bans Issued</span>
                    <span className="text-red-400 font-bold">{moderationStats.bansIssued}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-citadel-light-gray text-sm">Messages Deleted</span>
                    <span className="text-orange-400 font-bold">{moderationStats.messagesDeleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-citadel-light-gray text-sm">Spam Blocked</span>
                    <span className="text-blue-400 font-bold">{moderationStats.spamBlocked}</span>
                  </div>
                </div>

                {/* Toxicity Score */}
                <div className="mt-6 pt-4 border-t border-citadel-steel/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-citadel-light-gray text-sm">Toxicity Score</span>
                    <span className={`font-bold ${
                      moderationStats.toxicityScore < 0.3 ? 'text-green-400' :
                      moderationStats.toxicityScore < 0.7 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {(moderationStats.toxicityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-citadel-steel/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        moderationStats.toxicityScore < 0.3 ? 'bg-green-400' :
                        moderationStats.toxicityScore < 0.7 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${moderationStats.toxicityScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stream Info */}
              <div className="citadel-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Stream Info</h2>
                  <Twitch className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-citadel-light-gray text-xs">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${streamStats.isLive ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">{streamStats.isLive ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-citadel-light-gray text-xs">Title</p>
                    <p className="text-white text-sm">{streamStats.title}</p>
                  </div>
                  <div>
                    <p className="text-citadel-light-gray text-xs">Category</p>
                    <p className="text-white text-sm">{streamStats.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Chat Feed */}
            <div className="lg:col-span-3">
              <div className="citadel-card h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Live Chat Feed</h2>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-citadel-orange" />
                    <span className="text-sm text-citadel-light-gray">{chatMessages.length} messages</span>
                  </div>
                </div>
                
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto space-y-2 bg-citadel-steel/5 rounded-lg p-4"
                >
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-citadel-steel mx-auto mb-3" />
                      <p className="text-citadel-light-gray">Waiting for chat messages...</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3 p-2 hover:bg-citadel-steel/10 rounded">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            message.isModerator ? 'bg-green-500 text-white' :
                            message.isSubscriber ? 'bg-purple-500 text-white' :
                            'bg-citadel-steel text-citadel-light-gray'
                          }`}>
                            {message.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm ${
                              message.isModerator ? 'text-green-400' :
                              message.isSubscriber ? 'text-purple-400' :
                              'text-white'
                            }`}>
                              {message.username}
                            </span>
                            {message.badges.map((badge) => (
                              <span key={badge} className="text-xs bg-citadel-steel/30 px-1 rounded text-citadel-light-gray">
                                {badge}
                              </span>
                            ))}
                            <span className="text-xs text-citadel-steel">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-citadel-light-gray text-sm break-words">{message.message}</p>
                          {message.action && (
                            <div className="mt-1 flex items-center gap-1 text-xs">
                              {message.action === 'timeout' && <Clock className="w-3 h-3 text-yellow-400" />}
                              {message.action === 'ban' && <Ban className="w-3 h-3 text-red-400" />}
                              {message.action === 'delete' && <XCircle className="w-3 h-3 text-orange-400" />}
                              <span className="text-citadel-orange">AI Action: {message.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Status */}
                <div className="mt-4 pt-4 border-t border-citadel-steel/20">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <span className="text-citadel-light-gray">
                          AI Moderator: {isSessionActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-citadel-light-gray">
                          Chat: {connectionStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-citadel-steel">
                      {streamStats.isLive ? `Live for ${streamStats.uptime}` : 'Stream Offline'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LiveDashboard;

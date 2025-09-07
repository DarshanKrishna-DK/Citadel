import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Shield, Menu, X, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import Button from './ui/Button';
import Footer from './Footer';

interface MainPageProps {
  onViewMarketplace?: () => void;
  onViewDashboard?: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onViewMarketplace, onViewDashboard }) => {
  const { connected, account, disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  const handleDisconnect = () => {
    disconnect();
    setIsWalletDropdownOpen(false);
  };

  const handleDashboard = () => {
    onViewDashboard?.();
    setIsWalletDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-citadel-black text-citadel-light-gray overflow-hidden">
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
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200">
                Features
              </a>
              <a href="#how-it-works" className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200">
                How It Works
              </a>
              <a href="#marketplace" className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200">
                The Hall
              </a>
              <a href="#community" className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200">
                Community
              </a>
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
                          onClick={handleDashboard}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => setIsWalletDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:bg-citadel-orange/10 hover:text-citadel-orange transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <hr className="my-2 border-citadel-steel/30" />
                        <button
                          onClick={handleDisconnect}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-citadel-steel/30">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#marketplace"
                  className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  The Hall
                </a>
                <a
                  href="#community"
                  className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Community
                </a>
                {connected && account && (
                  <div className="px-4 py-2 text-sm text-citadel-light-gray bg-citadel-steel/20 rounded-lg border border-citadel-orange/30 mx-4">
                    Connected: <span className="font-mono text-citadel-orange">
                      {formatAddress(account.address?.toString() || '')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Modern Dotted Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-citadel-black via-citadel-black to-citadel-black-light"></div>

        {/* Animated dot pattern */}
        <div className="absolute inset-0 citadel-dots-bg"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-citadel-orange/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-citadel-orange/8 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-citadel-orange/3 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-citadel-orange/6 rounded-full blur-2xl animate-float-reverse"></div>

        {/* Moving gradient orbs */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-radial from-citadel-orange/4 to-transparent rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-radial from-citadel-orange/6 to-transparent rounded-full animate-pulse-slower"></div>

        {/* Scanning lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-citadel-orange/20 to-transparent animate-scan-horizontal"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-citadel-orange/15 to-transparent animate-scan-vertical"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Hero Background Elements */}
          <div className="absolute inset-0 z-0">
            {/* Subtle Particle Effects */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-citadel-orange/60 rounded-full animate-particle-1"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-citadel-orange/40 rounded-full animate-particle-2"></div>
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-citadel-orange/50 rounded-full animate-particle-3"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-citadel-orange/30 rounded-full animate-particle-4"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto w-full px-4 hero-compact">
            <div className="text-center space-y-4 md:space-y-6">
              {/* Animated Badge */}
              <div className="inline-flex items-center bg-citadel-orange/10 border border-citadel-orange/30 rounded-full px-4 py-2 hover:scale-105 transition-transform duration-300">
                <div className="w-2 h-2 bg-citadel-orange rounded-full mr-2"></div>
                <span className="text-citadel-orange font-medium text-sm">🚀 Built on Aptos Blockchain</span>
              </div>

              {/* Main Title with Stagger Animation */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-white block animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                    The Future of
                  </span>
                  <span className="text-citadel-orange block animate-slide-in-up" style={{animationDelay: '0.4s'}}>
                    Livestream Moderation
                  </span>
                </h1>

                {/* Subtitle with Animation */}
                <p className="text-lg md:text-xl text-citadel-light-gray max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  Transform your community management with intelligent, affordable AI moderators.
                  Pay only for what you use, while creators earn from their innovations.
                </p>
              </div>

              {/* Action Buttons with Hover Effects */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto citadel-btn-hero group px-6 py-3"
                  onClick={onViewMarketplace}
                >
                  <span className="flex items-center gap-2">
                    Enter Citadel
                    <div className="w-0 group-hover:w-4 h-px bg-citadel-black transition-all duration-300"></div>
                  </span>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto citadel-btn-secondary-hero px-6 py-3">
                  Learn More
                </Button>
              </div>

              {/* Compact Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto animate-fade-in-up stats-compact" style={{animationDelay: '1s'}}>
                <div className="citadel-card p-4 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-pulse">
                    <span className="text-xl">💰</span>
                  </div>
                  <div className="text-2xl font-bold text-citadel-orange mb-1 counter-animation">$18-22</div>
                  <div className="text-citadel-light-gray text-sm">Cost per hour for human moderators</div>
                  <div className="mt-3 h-1 bg-citadel-steel/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-citadel-orange to-citadel-orange-bright w-0 group-hover:w-full transition-all duration-1000"></div>
                  </div>
                </div>

                <div className="citadel-card p-4 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-pulse">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="text-2xl font-bold text-citadel-orange mb-1 counter-animation">24/7</div>
                  <div className="text-citadel-light-gray text-sm">AI moderation availability</div>
                  <div className="mt-3 h-1 bg-citadel-steel/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-citadel-orange to-citadel-orange-bright w-0 group-hover:w-full transition-all duration-1000 delay-200"></div>
                  </div>
                </div>

                <div className="citadel-card p-4 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange/20 to-citadel-orange/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-pulse">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div className="text-2xl font-bold text-citadel-orange mb-1 counter-animation">Pay-as-you-go</div>
                  <div className="text-citadel-light-gray text-sm">Flexible pricing model</div>
                  <div className="mt-3 h-1 bg-citadel-steel/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-citadel-orange to-citadel-orange-bright w-0 group-hover:w-full transition-all duration-1000 delay-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-citadel-steel/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                The Moderator Tax on Creativity
              </h2>
              <p className="text-xl text-citadel-light-gray max-w-4xl mx-auto">
                Human moderation costs $18-22 per hour, creating a massive barrier for streamers. 
                This "moderator tax" forces creators to choose between financial strain and toxic communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">❌</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Prohibitive Costs</h3>
                    <p className="text-citadel-light-gray">$18-22/hour makes professional moderation unaffordable for most creators</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">❌</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Limited Scalability</h3>
                    <p className="text-citadel-light-gray">Human moderators can't scale with growing communities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">❌</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Inconsistent Quality</h3>
                    <p className="text-citadel-light-gray">Varying availability and specialized knowledge gaps</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-citadel-steel/20 to-citadel-orange/10 rounded-2xl p-8 border border-citadel-orange/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💸</div>
                    <h3 className="text-2xl font-bold text-white mb-4">The Hidden Cost</h3>
                    <p className="text-citadel-light-gray mb-6">
                      New streamers face an impossible choice: compromise community safety or face financial strain from day one.
                    </p>
                    <div className="bg-citadel-black/50 rounded-lg p-4">
                      <div className="text-citadel-orange font-bold text-lg">$15,000+</div>
                      <div className="text-sm text-citadel-light-gray">Annual moderation cost for 20hrs/week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our Solution: <span className="text-citadel-orange">Citadel</span>
              </h2>
              <p className="text-xl text-citadel-light-gray max-w-4xl mx-auto">
                A decentralized platform that transforms livestream moderation into an open, 
                dynamic creator economy powered by intelligent AI moderators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-4">Affordable AI Moderators</h3>
                <p className="text-citadel-light-gray mb-4">
                  Access powerful AI moderators on a pay-as-you-go basis. Professional-grade community management for everyone.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">Pay only for what you use</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-white mb-4">Open Creator Marketplace</h3>
                <p className="text-citadel-light-gray mb-4">
                  Build, train, and monetize your own AI moderators. Earn passive income from your innovations.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">Competitive ecosystem</div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">🔑</div>
                <h3 className="text-xl font-bold text-white mb-4">Flexible Ownership</h3>
                <p className="text-citadel-light-gray mb-4">
                  License moderators affordably or purchase outright. All managed transparently on Aptos blockchain.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">On-chain transparency</div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-white mb-4">Evolving Intelligence</h3>
                <p className="text-citadel-light-gray mb-4">
                  Your moderator learns and improves. Get performance reports and provide feedback for continuous upgrades.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">Personalized AI</div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-4">Community-Driven Reputation</h3>
                <p className="text-citadel-light-gray mb-4">
                  Upvoting and ranking system ensures the best moderators rise to the top. Discover weekly performers.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">Quality assurance</div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-8 border border-citadel-orange/20 hover:border-citadel-orange/40 transition-all duration-300">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-white mb-4">Seamless Onboarding</h3>
                <p className="text-citadel-light-gray mb-4">
                  Get started in seconds with Aptos Keyless. Sign in with Google or connect your existing wallet.
                </p>
                <div className="bg-citadel-black/30 rounded-lg p-3">
                  <div className="text-citadel-orange font-semibold">Web3 power, Web2 simplicity</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-citadel-steel/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
              <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto">
                Three simple steps to revolutionize your community management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-citadel-orange/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-citadel-orange">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Connect & Browse</h3>
                <p className="text-citadel-light-gray">
                  Connect your wallet and explore our marketplace of AI moderators. 
                  Find the perfect fit for your community's needs.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-citadel-orange/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-citadel-orange">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">License or Own</h3>
                <p className="text-citadel-light-gray">
                  Choose your preferred model: license for affordable access or 
                  purchase outright for full ownership and control.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-citadel-orange/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-citadel-orange">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Deploy & Evolve</h3>
                <p className="text-citadel-light-gray">
                  Deploy your AI moderator and watch it learn. Provide feedback 
                  to continuously improve its performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Preview */}
        <section id="marketplace" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Explore the <span className="text-citadel-orange">Marketplace</span>
              </h2>
              <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto">
                Discover AI moderators built by creators worldwide, each with unique specializations and capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Sample Moderator Cards */}
              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-6 border border-citadel-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">ToxicityShield Pro</h3>
                  <div className="bg-citadel-orange/20 rounded-full px-3 py-1">
                    <span className="text-citadel-orange text-sm font-semibold">⭐ 4.9</span>
                  </div>
                </div>
                <p className="text-citadel-light-gray text-sm mb-4">
                  Advanced toxicity detection with context awareness. Perfect for gaming streams.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-citadel-orange font-semibold">$0.05/hour</div>
                  <Button size="sm">License</Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-6 border border-citadel-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">SpamBuster Elite</h3>
                  <div className="bg-citadel-orange/20 rounded-full px-3 py-1">
                    <span className="text-citadel-orange text-sm font-semibold">⭐ 4.8</span>
                  </div>
                </div>
                <p className="text-citadel-light-gray text-sm mb-4">
                  Intelligent spam detection with learning algorithms. Adapts to your community.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-citadel-orange font-semibold">$0.03/hour</div>
                  <Button size="sm">License</Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-citadel-steel/10 to-citadel-orange/5 rounded-2xl p-6 border border-citadel-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">VibeKeeper AI</h3>
                  <div className="bg-citadel-orange/20 rounded-full px-3 py-1">
                    <span className="text-citadel-orange text-sm font-semibold">⭐ 4.7</span>
                  </div>
                </div>
                <p className="text-citadel-light-gray text-sm mb-4">
                  Maintains positive community vibes while allowing healthy discussion.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-citadel-orange font-semibold">$0.04/hour</div>
                  <Button size="sm">License</Button>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                onClick={onViewMarketplace}
              >
                View Full Marketplace
              </Button>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 bg-citadel-steel/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the <span className="text-citadel-orange">Revolution</span>
            </h2>
            <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto mb-12">
              Be part of the community that's reshaping livestream moderation. 
              Whether you're a streamer or an AI creator, there's a place for you in Citadel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-citadel-orange/10 to-citadel-steel/10 rounded-2xl p-8 border border-citadel-orange/20">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-white mb-4">For Streamers</h3>
                <p className="text-citadel-light-gray mb-6">
                  Access affordable, intelligent moderation that scales with your community. 
                  Focus on creating while AI handles the rest.
                </p>
                <Button className="w-full">Start Streaming Safely</Button>
              </div>

              <div className="bg-gradient-to-br from-citadel-orange/10 to-citadel-steel/10 rounded-2xl p-8 border border-citadel-orange/20">
                <div className="text-4xl mb-4">🛠️</div>
                <h3 className="text-2xl font-bold text-white mb-4">For AI Creators</h3>
                <p className="text-citadel-light-gray mb-6">
                  Build and monetize innovative AI moderators. Earn passive income 
                  while solving real problems for creators worldwide.
                </p>
                <Button className="w-full">Start Building</Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-citadel-orange/20 to-citadel-steel/20 rounded-3xl p-12 border border-citadel-orange/30">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Community?
              </h2>
              <p className="text-xl text-citadel-light-gray mb-8">
                Join thousands of creators who've already revolutionized their moderation with Citadel.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={onViewMarketplace}
                >
                  Enter Citadel Now
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  📚 Read Documentation
                </Button>
              </div>


            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainPage;
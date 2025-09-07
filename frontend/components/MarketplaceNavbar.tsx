import React, { useState, useRef, useEffect } from 'react';
import { Shield, Menu, X, ChevronDown, User, List, LogOut, Search, Users, Zap, Home } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface MarketplaceNavbarProps {
  onBackToLanding?: () => void;
}

export const MarketplaceNavbar: React.FC<MarketplaceNavbarProps> = ({ onBackToLanding }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { connected, account, disconnect } = useWallet();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatWalletAddress = (address: any) => {
    if (!address) return '';
    const addressString = typeof address === 'string' ? address : String(address);
    return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const navItems = [
    { name: 'Home', onClick: onBackToLanding, icon: <Home className="w-4 h-4" /> },
    { name: 'Marketplace', href: '#marketplace', icon: <Search className="w-4 h-4" />, active: true },
    { name: 'Community', href: '#community', icon: <Users className="w-4 h-4" /> },
    { name: 'Features', href: '#features', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-orange/30 shadow-2xl shadow-citadel-orange/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="w-8 h-8 text-citadel-orange group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-citadel-orange/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-citadel-orange bg-clip-text text-transparent">
                CITADEL
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? 'bg-citadel-orange/20 text-citadel-orange border border-citadel-orange/30'
                        : 'text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? 'bg-citadel-orange/20 text-citadel-orange border border-citadel-orange/30'
                        : 'text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* User Profile / Connect Wallet */}
          <div className="flex items-center space-x-4">
            {connected && account ? (
              /* Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-citadel-orange/10 border border-citadel-orange/30 rounded-xl hover:bg-citadel-orange/20 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-citadel-black" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-white">
                      {formatWalletAddress(account.address)}
                    </div>
                    <div className="text-xs text-citadel-steel-light">
                      Connected
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-citadel-orange transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-citadel-black border border-citadel-steel/30 rounded-xl shadow-2xl shadow-citadel-orange/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-citadel-steel/20">
                      <div className="text-sm font-medium text-white">
                        {formatWalletAddress(account.address)}
                      </div>
                      <div className="text-xs text-citadel-steel-light">
                        Aptos Wallet Connected
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <a
                        href="#dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10 transition-all"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </a>
                      <a
                        href="#listings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10 transition-all"
                      >
                        <List className="w-4 h-4" />
                        My Listings
                      </a>
                      <div className="border-t border-citadel-steel/20 my-2"></div>
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Connect Wallet Button */
              <button className="citadel-btn-primary">
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10 transition-all"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-citadel-black/98 backdrop-blur-sm border-t border-citadel-steel/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 w-full text-left ${
                    item.active
                      ? 'bg-citadel-orange/20 text-citadel-orange border border-citadel-orange/30'
                      : 'text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-citadel-orange/20 text-citadel-orange border border-citadel-orange/30'
                      : 'text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </a>
              )
            ))}
            
            {/* Mobile Profile Links */}
            {connected && account && (
              <>
                <div className="border-t border-citadel-steel/20 my-3"></div>
                <a
                  href="#dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </a>
                <a
                  href="#listings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-citadel-light-gray hover:text-citadel-orange hover:bg-citadel-orange/10 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <List className="w-5 h-5" />
                  My Listings
                </a>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

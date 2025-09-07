import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';

interface NavbarProps {
  onNavigate?: (page: 'home' | 'marketplace' | 'dashboard') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { connected, account, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-citadel-black/95 backdrop-blur-sm border-b border-citadel-orange/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-citadel-orange">
                🏰 Citadel
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => onNavigate?.('home')}
                className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate?.('marketplace')}
                className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
              >
                Marketplace
              </button>
              {connected && (
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200"
                >
                  Dashboard
                </button>
              )}
              <a href="#community" className="text-citadel-light-gray hover:text-citadel-orange transition-colors duration-200">
                Community
              </a>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            {connected && account ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-citadel-light-gray bg-citadel-steel/20 px-4 py-2 rounded-lg border border-citadel-orange/30">
                  Connected: <span className="font-mono text-citadel-orange">
                    {formatAddress(account.address.toString())}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="bg-citadel-steel hover:bg-citadel-steel/80 text-citadel-light-gray px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="wallet-selector-container">
                <WalletSelector />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

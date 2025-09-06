import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { ArrowRight, Shield, Users, TrendingUp, Star, Zap, Globe } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export const MainPage: React.FC = () => {
  const { connected, account } = useWallet();
  const { setUserRole } = useUser();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnterCitadel = () => {
    setUserRole(null); // This will trigger the role selection
  };

  return (
    <div className="min-h-screen bg-citadel-black text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-citadel-orange">Citadel</h1>
            <div className="flex items-center gap-4">
              {!connected ? (
                <div className="bg-citadel-orange hover:bg-citadel-orange-dark text-citadel-black px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                  <WalletSelector />
                </div>
              ) : (
                <div className="text-sm text-citadel-light-gray">
                  Connected: {typeof account?.address === 'string'
                    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                    : account?.address?.data
                      ? `${account.address.data.slice(0, 6)}...${account.address.data.slice(-4)}`
                      : 'Unknown'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-citadel-orange to-citadel-orange-dark opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to <span className="text-citadel-orange">Citadel</span>
            </h1>
            <p className="text-xl md:text-2xl text-citadel-light-gray mb-8 max-w-4xl mx-auto">
              The premier decentralized marketplace for AI-powered livestream moderation, built on the Aptos blockchain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!connected ? (
                <div className="bg-citadel-orange hover:bg-citadel-orange-dark text-citadel-black px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <WalletSelector />
                </div>
              ) : (
                <button
                  onClick={handleEnterCitadel}
                  className="bg-citadel-orange hover:bg-citadel-orange-dark text-citadel-black px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Enter Citadel
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => scrollToSection('about')}
                className="border-2 border-citadel-orange text-citadel-orange hover:bg-citadel-orange hover:text-citadel-black px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-citadel-orange opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-citadel-orange opacity-30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 bg-citadel-orange opacity-25 rounded-full animate-pulse delay-500"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-citadel-dark-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Revolutionizing Community Management</h2>
            <p className="text-xl text-citadel-light-gray max-w-3xl mx-auto">
              Our mission is to revolutionize community management by creating a transparent and robust ecosystem
              connecting AI creators directly with livestreamers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-citadel-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-citadel-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Safer Spaces</h3>
              <p className="text-citadel-light-gray">
                We empower content creators to build safer, smarter, and more engaging online spaces by providing
                access to a new generation of powerful, verifiable, and customizable moderation tools.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-citadel-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-citadel-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Decentralized Power</h3>
              <p className="text-citadel-light-gray">
                Citadel bridges the gap between advanced AI and practical community needs, ensuring every streamer
                has the power to protect and cultivate their audience on their own terms.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-citadel-orange rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-citadel-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
              <p className="text-citadel-light-gray">
                Built around a unique dual-role system designed to foster a vibrant creator economy and constantly
                evolving ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-citadel-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How Citadel Works</h2>
            <p className="text-xl text-citadel-light-gray">
              Our platform is built around a unique dual-role system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Creator Role */}
            <div className="bg-citadel-dark-gray rounded-2xl p-8 border-2 border-citadel-orange">
              <div className="flex items-center mb-6">
                <div className="bg-citadel-orange rounded-full p-3 mr-4">
                  <Shield className="w-8 h-8 text-citadel-black" />
                </div>
                <h3 className="text-3xl font-bold">For Creators</h3>
              </div>
              <p className="text-citadel-light-gray mb-6">
                Creators, such as AI development companies and organizations, are given access to our exclusive
                platform to mint, list, and monetize their proprietary AI moderator models.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Mint new AI Moderators</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>List on the marketplace</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Earn from licenses</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Track performance analytics</span>
                </li>
              </ul>
            </div>

            {/* Streamer Role */}
            <div className="bg-citadel-dark-gray rounded-2xl p-8 border-2 border-citadel-orange">
              <div className="flex items-center mb-6">
                <div className="bg-citadel-orange rounded-full p-3 mr-4">
                  <Users className="w-8 h-8 text-citadel-black" />
                </div>
                <h3 className="text-3xl font-bold">For Streamers</h3>
              </div>
              <p className="text-citadel-light-gray mb-6">
                Streamers can browse the extensive marketplace to license these moderators on a flexible,
                pay-as-you-go basis, with the ability to upgrade their licensed moderators.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Browse moderator marketplace</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>License professional tools</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Upgrade existing moderators</span>
                </li>
                <li className="flex items-center">
                  <Star className="w-5 h-5 text-citadel-orange mr-3" />
                  <span>Manage your collection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-citadel-dark-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Key Features</h2>
            <p className="text-xl text-citadel-light-gray">
              Experience the future of AI moderation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
              <p className="text-citadel-light-gray">
                Track performance, revenue, and usage metrics in real-time for all your moderators.
              </p>
            </div>

            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Moderation</h3>
              <p className="text-citadel-light-gray">
                State-of-the-art AI moderation tools with customizable personalities and rules.
              </p>
            </div>

            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Decentralized Marketplace</h3>
              <p className="text-citadel-light-gray">
                True ownership and transparency powered by Aptos blockchain technology.
              </p>
            </div>

            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Deployment</h3>
              <p className="text-citadel-light-gray">
                Deploy moderators instantly to your streams with one-click integration.
              </p>
            </div>

            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Driven</h3>
              <p className="text-citadel-light-gray">
                Built by the community, for the community. Join thousands of creators and streamers.
              </p>
            </div>

            <div className="bg-citadel-black rounded-xl p-6 border border-citadel-orange">
              <div className="bg-citadel-orange rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-citadel-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Upgrade System</h3>
              <p className="text-citadel-light-gray">
                Continuously improve your moderators with our unique upgrade and feedback system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-citadel-orange to-citadel-orange-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-citadel-black mb-6">
            Ready to Join Citadel?
          </h2>
          <p className="text-xl text-citadel-black mb-8">
            Be part of the future of AI-powered community management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!connected ? (
              <div className="bg-citadel-black hover:bg-citadel-dark-gray text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <WalletSelector />
              </div>
            ) : (
              <button
                onClick={handleEnterCitadel}
                className="bg-citadel-black hover:bg-citadel-dark-gray text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Enter Citadel
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-citadel-dark-gray py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-citadel-orange mb-4">Citadel</h3>
            <p className="text-citadel-light-gray mb-6">
              The decentralized marketplace for AI moderators
            </p>
            <p className="text-sm text-citadel-light-gray">
              Built on Aptos • Powered by AI • Driven by Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

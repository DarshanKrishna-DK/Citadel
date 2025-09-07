import React from 'react';
import { Shield, Twitter, Github, MessageCircle, Book, FileText, HelpCircle, Newspaper } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 bg-citadel-black/95 backdrop-blur-sm border-t border-citadel-orange/30 shadow-2xl shadow-citadel-orange/10">
      {/* Footer dotted background */}
      <div className="absolute inset-0 citadel-dots-bg opacity-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-citadel-orange to-citadel-orange-bright rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-citadel-black" />
              </div>
              <div className="text-3xl font-bold citadel-heading">CITADEL</div>
            </div>
            <p className="text-citadel-light-gray mb-8 max-w-md leading-relaxed">
              The decentralized marketplace for AI moderators. Create, trade, and deploy intelligent guardians
              for your digital communities on the Aptos blockchain.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="citadel-btn-secondary p-3 hover:scale-110 transition-all duration-300"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="citadel-btn-secondary p-3 hover:scale-110 transition-all duration-300"
                title="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="citadel-btn-secondary p-3 hover:scale-110 transition-all duration-300"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Navigate</h3>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-citadel-orange rounded-full"></div>
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-citadel-orange rounded-full"></div>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#marketplace" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-citadel-orange rounded-full"></div>
                  The Hall
                </a>
              </li>
              <li>
                <a href="#community" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-citadel-orange rounded-full"></div>
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-citadel-light-gray hover:text-citadel-orange transition-colors flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-citadel-steel/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-citadel-steel-light text-sm">
              © 2024 Citadel. All rights reserved. Built on
              <span className="text-citadel-orange font-medium ml-1">Aptos</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-citadel-steel-light hover:text-citadel-orange transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-citadel-steel-light hover:text-citadel-orange transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-citadel-steel-light hover:text-citadel-orange transition-colors text-sm">
                Cookie Policy
              </a>
              <a href="#" className="text-citadel-steel-light hover:text-citadel-orange transition-colors text-sm">
                Security
              </a>
            </div>
          </div>

          {/* Powered by Aptos Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-citadel-steel/10 border border-citadel-orange/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-citadel-orange rounded-full animate-pulse"></div>
              <span className="text-citadel-light-gray text-xs">
                Secured by Aptos Blockchain
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

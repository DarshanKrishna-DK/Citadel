import React from 'react';
import { Header } from './Header';
import Marketplace from './Marketplace';

export const StreamerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-citadel-black">
      <Header />
      <Marketplace />
    </div>
  );
};

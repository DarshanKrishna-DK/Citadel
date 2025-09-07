export interface User {
  id: string;
  walletAddress: string;
  role: 'CREATOR' | 'STREAMER';
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  onChainAddress: string;
  creatorId: string;
  name: string;
  description: string;
  personality: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  creator?: User;
  licenses?: License[];
}

export interface License {
  id: string;
  onChainAddress: string;
  ownerId: string;
  aiModelId: string;
  level: number;
  isUpgraded: boolean;
  acquiredAt: Date;
  updatedAt: Date;
  owner?: User;
  aiModel?: AIModel;
  sessions?: DeploymentSession[];
}

export interface DeploymentSession {
  id: string;
  licenseId: string;
  platform: 'TWITCH' | 'YOUTUBE';
  startTime: Date;
  endTime?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  license?: License;
}

export interface AuthRequest {
  user?: {
    id: string;
    walletAddress: string;
  };
}

export interface MarketplaceFilters {
  search?: string;
  personality?: string;
  creator?: string;
  page?: number;
  limit?: number;
}

export interface SessionMetrics {
  duration: number;
  cost: number;
  platform: string;
  aiModel: string;
}



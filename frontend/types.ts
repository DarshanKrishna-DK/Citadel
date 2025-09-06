export type UserRole = 'creator' | 'streamer' | null;

export interface AIModerator {
  id: string;
  name: string;
  personality: string;
  description: string;
  creator: string;
  price: number;
  licenseCount: number;
  totalUsageHours: number;
  revenue: number;
  createdAt: Date;
  documents?: File[];
  upgrades?: Upgrade[];
}

export interface Upgrade {
  id: string;
  originalModeratorId: string;
  upgradedBy: string;
  changes: string;
  feedback: string;
  documents?: File[];
  createdAt: Date;
}

export interface User {
  address: string;
  role: UserRole;
  name?: string;
  email?: string;
}

export interface CartItem {
  moderator: AIModerator;
  quantity: number;
}

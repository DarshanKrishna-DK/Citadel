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
  avatar?: string;
  skills?: ModeratorSkills;
  rating?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface ModeratorSkills {
  toxicityDetection: number;
  spamFiltering: number;
  contextAwareness: number;
  responseSpeed: number;
  customization: number;
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
  licenseType?: 'basic' | 'premium' | 'enterprise';
}

export interface ViewMode {
  current: 'landing' | 'role-selection' | 'marketplace' | 'dashboard' | 'moderator-detail' | 'cart';
  previousView?: ViewMode['current'];
}

export interface NavigationState {
  selectedModeratorId?: string;
  cartItems: CartItem[];
  searchQuery?: string;
  selectedFilters?: {
    personality?: string;
    priceRange?: [number, number];
    rating?: number;
  };
}

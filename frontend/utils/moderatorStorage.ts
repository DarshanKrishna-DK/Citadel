// Utility for managing moderator data in localStorage

export interface StoredModerator {
  id: string;
  name: string;
  description: string;
  personality: string;
  category: string;
  creator: string;
  hourlyPrice: number;
  monthlyPrice: number;
  buyoutPrice: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  upvotes: number;
  totalUsers: number;
  rating: number;
  transactionHash?: string;
}

const STORAGE_KEY = 'citadel_moderators';
const UPVOTES_KEY = 'citadel_upvotes';

export const moderatorStorage = {
  // Get all stored moderators
  getAll(): StoredModerator[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading moderators from storage:', error);
      return [];
    }
  },

  // Add a new moderator
  add(moderator: StoredModerator): void {
    try {
      const existing = this.getAll();
      const updated = [...existing, moderator];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving moderator to storage:', error);
    }
  },

  // Update an existing moderator
  update(id: string, updates: Partial<StoredModerator>): void {
    try {
      const existing = this.getAll();
      const index = existing.findIndex(mod => mod.id === id);
      if (index !== -1) {
        existing[index] = { ...existing[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Error updating moderator in storage:', error);
    }
  },

  // Get a specific moderator by ID
  getById(id: string): StoredModerator | null {
    try {
      const moderators = this.getAll();
      return moderators.find(mod => mod.id === id) || null;
    } catch (error) {
      console.error('Error getting moderator from storage:', error);
      return null;
    }
  },

  // Check if user has already upvoted a moderator
  hasUserUpvoted(moderatorId: string, userAddress: string): boolean {
    try {
      const upvotes = localStorage.getItem(UPVOTES_KEY);
      if (!upvotes) return false;
      
      const upvoteData = JSON.parse(upvotes);
      return upvoteData[`${moderatorId}_${userAddress}`] === true;
    } catch (error) {
      console.error('Error checking upvote status:', error);
      return false;
    }
  },

  // Upvote a moderator (limited to 1 per user)
  upvote(id: string, userAddress: string): boolean {
    try {
      // Check if user has already upvoted
      if (this.hasUserUpvoted(id, userAddress)) {
        return false; // Already upvoted
      }

      const moderator = this.getById(id);
      if (moderator) {
        // Update moderator upvote count
        this.update(id, { upvotes: moderator.upvotes + 1 });
        
        // Record that this user has upvoted
        const upvotes = localStorage.getItem(UPVOTES_KEY);
        const upvoteData = upvotes ? JSON.parse(upvotes) : {};
        upvoteData[`${id}_${userAddress}`] = true;
        localStorage.setItem(UPVOTES_KEY, JSON.stringify(upvoteData));
        
        return true; // Successfully upvoted
      }
      return false;
    } catch (error) {
      console.error('Error upvoting moderator:', error);
      return false;
    }
  },

  // Clear all moderators (for testing)
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing moderators from storage:', error);
    }
  }
};

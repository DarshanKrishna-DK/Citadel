// Utility for managing user dashboard data in localStorage

export interface UserModerator {
  id: string;
  name: string;
  description: string;
  personality: string;
  category: string;
  creator: string;
  purchaseType: 'hourly' | 'license' | 'buyout';
  purchaseDate: string;
  transactionHash?: string;
  hourlyPrice?: number;
  monthlyPrice?: number;
  buyoutPrice?: number;
  totalUsageHours?: number;
  lastUsed?: string;
  isActive: boolean;
}

export interface StreamSession {
  id: string;
  moderatorId: string;
  platform: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  viewerCount?: number;
  messagesModerated?: number;
  actionsPerformed?: number;
  status: 'active' | 'completed' | 'cancelled';
}

const USER_MODERATORS_KEY = 'citadel_user_moderators';
const STREAM_SESSIONS_KEY = 'citadel_stream_sessions';

export const userDashboard = {
  // Get user's moderators
  getUserModerators(userAddress: string): UserModerator[] {
    try {
      const stored = localStorage.getItem(`${USER_MODERATORS_KEY}_${userAddress}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading user moderators:', error);
      return [];
    }
  },

  // Add moderator to user's dashboard
  addModerator(userAddress: string, moderator: UserModerator): void {
    try {
      const existing = this.getUserModerators(userAddress);
      const updated = [...existing, moderator];
      localStorage.setItem(`${USER_MODERATORS_KEY}_${userAddress}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding moderator to dashboard:', error);
    }
  },

  // Get user's stream sessions
  getStreamSessions(userAddress: string): StreamSession[] {
    try {
      const stored = localStorage.getItem(`${STREAM_SESSIONS_KEY}_${userAddress}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stream sessions:', error);
      return [];
    }
  },

  // Add stream session
  addStreamSession(userAddress: string, session: StreamSession): void {
    try {
      const existing = this.getStreamSessions(userAddress);
      const updated = [...existing, session];
      localStorage.setItem(`${STREAM_SESSIONS_KEY}_${userAddress}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding stream session:', error);
    }
  },

  // Update stream session
  updateStreamSession(userAddress: string, sessionId: string, updates: Partial<StreamSession>): void {
    try {
      const sessions = this.getStreamSessions(userAddress);
      const index = sessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        sessions[index] = { ...sessions[index], ...updates };
        localStorage.setItem(`${STREAM_SESSIONS_KEY}_${userAddress}`, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error updating stream session:', error);
    }
  },

  // Get analytics for user
  getAnalytics(userAddress: string) {
    const moderators = this.getUserModerators(userAddress);
    const sessions = this.getStreamSessions(userAddress);

    const totalModerators = moderators.length;
    const hourlyModerators = moderators.filter(m => m.purchaseType === 'hourly').length;
    const licensedModerators = moderators.filter(m => m.purchaseType === 'license').length;
    const ownedModerators = moderators.filter(m => m.purchaseType === 'buyout').length;

    const totalSessions = sessions.length;
    const activeSessions = sessions.filter(s => s.status === 'active').length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60; // Convert minutes to hours
    const totalMessages = sessions.reduce((sum, s) => sum + (s.messagesModerated || 0), 0);
    const totalActions = sessions.reduce((sum, s) => sum + (s.actionsPerformed || 0), 0);

    return {
      moderators: {
        total: totalModerators,
        hourly: hourlyModerators,
        licensed: licensedModerators,
        owned: ownedModerators
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
        completed: completedSessions
      },
      usage: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalMessages,
        totalActions
      }
    };
  }
};

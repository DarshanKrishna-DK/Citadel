interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
}

interface StreamStatus {
  isLive: boolean;
  title?: string;
  viewerCount?: number;
  startTime?: string;
  category?: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  isVerified: boolean;
  isModerator: boolean;
  badges: string[];
}

interface TwitterApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

class TwitterApiService {
  private baseUrl = 'https://api.twitter.com/2';
  private bearerToken: string | null = null;
  private userId: string | null = null;

  constructor() {
    // In a real implementation, you'd get this from your backend
    this.bearerToken = process.env.VITE_TWITTER_BEARER_TOKEN || null;
  }

  // OAuth 2.0 PKCE flow for Twitter authentication
  async initiateAuth(): Promise<string> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    // Store code verifier for later use
    localStorage.setItem('twitter_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.VITE_TWITTER_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/twitter/callback`,
      scope: 'tweet.read users.read offline.access',
      state: this.generateRandomString(32),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async handleAuthCallback(code: string): Promise<TwitterApiResponse<TwitterUser>> {
    try {
      const codeVerifier = localStorage.getItem('twitter_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('/api/twitter/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: `${window.location.origin}/auth/twitter/callback`
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Store access token
      localStorage.setItem('twitter_access_token', tokenData.access_token);
      
      // Get user info
      const userInfo = await this.getCurrentUser();
      return userInfo;

    } catch (error) {
      console.error('Twitter auth error:', error);
      return {
        data: {} as TwitterUser,
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  async getCurrentUser(): Promise<TwitterApiResponse<TwitterUser>> {
    try {
      const accessToken = localStorage.getItem('twitter_access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${this.baseUrl}/users/me?user.fields=profile_image_url,verified,public_metrics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      return {
        data: {
          id: userData.data.id,
          username: userData.data.username,
          name: userData.data.name,
          profile_image_url: userData.data.profile_image_url,
          verified: userData.data.verified || false,
          followers_count: userData.data.public_metrics?.followers_count || 0,
          following_count: userData.data.public_metrics?.following_count || 0
        },
        success: true
      };

    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        data: {} as TwitterUser,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user data'
      };
    }
  }

  // Mock stream status - in real implementation, this would integrate with streaming platforms
  async getStreamStatus(username: string): Promise<TwitterApiResponse<StreamStatus>> {
    try {
      // This is a mock implementation
      // In reality, you'd integrate with Twitch/YouTube APIs
      const mockStreamData: StreamStatus = {
        isLive: Math.random() > 0.5, // Random for demo
        title: 'Building the Future of AI Moderation on Citadel',
        viewerCount: Math.floor(Math.random() * 1000) + 100,
        startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        category: 'Science & Technology'
      };

      return {
        data: mockStreamData,
        success: true
      };

    } catch (error) {
      return {
        data: { isLive: false },
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stream status'
      };
    }
  }

  // Mock chat messages - in real implementation, this would connect to live chat APIs
  async getChatMessages(streamId?: string): Promise<TwitterApiResponse<ChatMessage[]>> {
    try {
      // Mock chat messages for demo
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          username: 'cryptodev_alice',
          message: 'This AI moderation system looks amazing! 🚀',
          timestamp: Date.now() - 30000,
          isVerified: true,
          isModerator: false,
          badges: ['verified']
        },
        {
          id: '2',
          username: 'streamer_bob',
          message: 'Finally, affordable moderation for small streamers!',
          timestamp: Date.now() - 25000,
          isVerified: false,
          isModerator: true,
          badges: ['moderator']
        },
        {
          id: '3',
          username: 'ai_enthusiast',
          message: 'How does the pricing work? Can I try it for free?',
          timestamp: Date.now() - 20000,
          isVerified: false,
          isModerator: false,
          badges: []
        },
        {
          id: '4',
          username: 'citadel_creator',
          message: 'Check out the marketplace - so many great AI moderators!',
          timestamp: Date.now() - 15000,
          isVerified: true,
          isModerator: true,
          badges: ['verified', 'moderator', 'creator']
        },
        {
          id: '5',
          username: 'blockchain_betty',
          message: 'Love that it\'s built on Aptos! Fast and cheap transactions 💎',
          timestamp: Date.now() - 10000,
          isVerified: false,
          isModerator: false,
          badges: []
        }
      ];

      return {
        data: mockMessages,
        success: true
      };

    } catch (error) {
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chat messages'
      };
    }
  }

  // Utility functions
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('twitter_access_token');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('twitter_access_token');
    localStorage.removeItem('twitter_code_verifier');
    this.userId = null;
  }
}

export const twitterApi = new TwitterApiService();
export type { TwitterUser, StreamStatus, ChatMessage, TwitterApiResponse };

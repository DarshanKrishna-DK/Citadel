import tmi, { Client, ChatUserstate } from 'tmi.js';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isModerator: boolean;
  isSubscriber: boolean;
  badges: string[];
  action?: 'timeout' | 'ban' | 'delete';
  channel: string;
}

interface ModerationStats {
  chatsAnalyzed: number;
  timeoutsIssued: number;
  bansIssued: number;
  messagesDeleted: number;
  spamBlocked: number;
  toxicityScore: number;
}

interface StreamStatus {
  isLive: boolean;
  viewerCount: number;
  uptime: string;
  title: string;
  category: string;
  startedAt?: string;
}

export class TwitchChatService {
  private client: Client | null = null;
  private io: SocketIOServer | null = null;
  private moderationStats: ModerationStats = {
    chatsAnalyzed: 0,
    timeoutsIssued: 0,
    bansIssued: 0,
    messagesDeleted: 0,
    spamBlocked: 0,
    toxicityScore: 0
  };

  // Comprehensive banned words list
  private bannedWords = [
    'anal', 'anus', 'arse', 'ass', 'asshole', 'bastard', 'bitch', 'bloody', 
    'blowjob', 'bollocks', 'boner', 'boob', 'bugger', 'bullshit', 'clit', 
    'clitoris', 'cock', 'crap', 'cunt', 'damn', 'dick', 'dildo', 'dyke', 
    'fag', 'faggot', 'fanny', 'fellate', 'fellatio', 'felch', 'fuck', 
    'gangbang', 'goddamn', 'handjob', 'hell', 'horny', 'jerk', 'jizz', 
    'kike', 'kys', 'lust', 'milf', 'motherfucker', 'nazi', 'nude', 'nigger', 
    'orgy', 'penis', 'piss', 'porn', 'prick', 'pussy', 'queer', 'retard', 
    'scrotum', 'sex', 'sexy', 'shit', 'slut', 'smegma', 'spic', 'suicide', 
    'testicle', 'tit', 'turd', 'vagina', 'viagra', 'vulva', 'wank', 'whore', 'xxx'
  ];

  private activeChannels: Set<string> = new Set();
  private channelTokens: Map<string, { accessToken: string; refreshToken: string }> = new Map();

  constructor() {
    console.log('🎮 TwitchChatService initialized');
  }

  public initializeSocketIO(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('🔌 Client connected to WebSocket:', socket.id);
      
      // Send current moderation stats to new client
      socket.emit('moderationStats', this.moderationStats);

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });

    console.log('🔌 Socket.IO server initialized');
  }

  public async connectToChannel(
    channelName: string, 
    accessToken: string, 
    refreshToken: string,
    moderatorId: string
  ): Promise<boolean> {
    try {
      console.log(`🎮 Connecting to Twitch channel: ${channelName}`);

      // Store tokens for this channel
      this.channelTokens.set(channelName, { accessToken, refreshToken });

      // Check if user is currently streaming
      const streamStatus = await this.getStreamStatus(channelName, accessToken);
      
      // Initialize TMI client
      this.client = new Client({
        options: { debug: true },
        connection: {
          secure: true,
          reconnect: true,
        },
        identity: {
          username: 'citadel_ai_moderator', // Bot username
          password: `oauth:${accessToken}`,
        },
        channels: [channelName],
      });

      // Set up event handlers
      this.setupEventHandlers(channelName, moderatorId);

      // Connect to Twitch
      await this.client.connect();
      this.activeChannels.add(channelName);

      // Emit stream status to frontend
      if (this.io) {
        this.io.emit('streamStatus', streamStatus);
      }

      console.log(`✅ Successfully connected to ${channelName}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to connect to Twitch channel:', error);
      return false;
    }
  }

  private setupEventHandlers(channelName: string, moderatorId: string): void {
    if (!this.client) return;

    // Handle incoming messages
    this.client.on('message', async (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
      if (self) return; // Ignore messages from the bot itself

      const chatMessage: ChatMessage = {
        id: tags.id || Date.now().toString(),
        username: tags.username || 'Unknown',
        message: message,
        timestamp: new Date().toISOString(),
        isModerator: tags.mod || false,
        isSubscriber: tags.subscriber || false,
        badges: this.extractBadges(tags.badges),
        channel: channel
      };

      console.log(`💬 [${channel}] ${chatMessage.username}: ${message}`);

      // Update stats
      this.moderationStats.chatsAnalyzed++;

      // Check for banned content
      const moderationAction = await this.moderateMessage(chatMessage, channel, tags);
      
      if (moderationAction) {
        chatMessage.action = moderationAction;
      }

      // Emit to frontend
      if (this.io) {
        this.io.emit('chatMessage', chatMessage);
        this.io.emit('moderationStats', this.moderationStats);
      }
    });

    // Handle connection events
    this.client.on('connected', (addr: string, port: number) => {
      console.log(`✅ Connected to Twitch IRC: ${addr}:${port}`);
      if (this.io) {
        this.io.emit('connectionStatus', { connected: true, channel: channelName });
      }
    });

    this.client.on('disconnected', (reason: string) => {
      console.log(`❌ Disconnected from Twitch IRC: ${reason}`);
      if (this.io) {
        this.io.emit('connectionStatus', { connected: false, reason });
      }
    });

    // Handle moderation events
    this.client.on('timeout', (channel: string, username: string, reason: string, duration: number) => {
      console.log(`⏰ User ${username} timed out for ${duration}s: ${reason}`);
      if (this.io) {
        this.io.emit('moderationAction', {
          type: 'timeout',
          username,
          reason,
          duration,
          channel
        });
      }
    });

    this.client.on('ban', (channel: string, username: string, reason: string) => {
      console.log(`🚫 User ${username} banned: ${reason}`);
      if (this.io) {
        this.io.emit('moderationAction', {
          type: 'ban',
          username,
          reason,
          channel
        });
      }
    });
  }

  private async moderateMessage(
    chatMessage: ChatMessage, 
    channel: string, 
    tags: ChatUserstate
  ): Promise<'timeout' | 'ban' | 'delete' | null> {
    const message = chatMessage.message.toLowerCase();
    
    // Skip moderation for moderators and subscribers (optional)
    if (chatMessage.isModerator) {
      return null;
    }

    // Check for banned words
    const containsBannedWord = this.bannedWords.some(word => {
      const regex = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i');
      return regex.test(message);
    });

    if (containsBannedWord) {
      console.log(`🚨 Banned content detected from ${chatMessage.username}: ${chatMessage.message}`);
      
      try {
        // Delete the message first
        if (this.client && tags.id) {
          await this.client.deletemessage(channel, tags.id);
          this.moderationStats.messagesDeleted++;
          console.log(`🗑️ Deleted message from ${chatMessage.username}`);
        }

        // Timeout the user (10 minutes)
        if (this.client) {
          await this.client.timeout(channel, chatMessage.username, 600, 'Inappropriate language detected by AI moderator');
          this.moderationStats.timeoutsIssued++;
          console.log(`⏰ Timed out ${chatMessage.username} for 10 minutes`);
        }

        // Update toxicity score
        this.moderationStats.toxicityScore = Math.min(1, this.moderationStats.toxicityScore + 0.1);

        return 'timeout';

      } catch (error) {
        console.error('❌ Failed to moderate message:', error);
        return null;
      }
    }

    // Check for spam (repeated messages, excessive caps, etc.)
    if (this.isSpam(message)) {
      this.moderationStats.spamBlocked++;
      
      try {
        if (this.client && tags.id) {
          await this.client.deletemessage(channel, tags.id);
          await this.client.timeout(channel, chatMessage.username, 300, 'Spam detected by AI moderator');
          this.moderationStats.timeoutsIssued++;
        }
        return 'timeout';
      } catch (error) {
        console.error('❌ Failed to moderate spam:', error);
      }
    }

    // Gradually decrease toxicity score for clean messages
    this.moderationStats.toxicityScore = Math.max(0, this.moderationStats.toxicityScore - 0.001);

    return null;
  }

  private isSpam(message: string): boolean {
    // Check for excessive caps (more than 70% uppercase)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.7 && message.length > 10) {
      return true;
    }

    // Check for excessive repetition
    const words = message.split(' ');
    const uniqueWords = new Set(words);
    if (words.length > 5 && uniqueWords.size / words.length < 0.3) {
      return true;
    }

    return false;
  }

  private extractBadges(badges: { [key: string]: string } | undefined): string[] {
    if (!badges) return [];
    return Object.keys(badges);
  }

  public async getStreamStatus(channelName: string, accessToken: string): Promise<StreamStatus> {
    try {
      // Get user ID first
      const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID!,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json() as any;
      const userId = userData.data[0]?.id;

      if (!userId) {
        throw new Error('User not found');
      }

      // Check stream status
      const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID!,
        },
      });

      if (!streamResponse.ok) {
        throw new Error('Failed to get stream info');
      }

      const streamData = await streamResponse.json() as any;
      const stream = streamData.data[0];

      if (stream) {
        // Stream is live
        const startedAt = new Date(stream.started_at);
        const uptime = this.calculateUptime(startedAt);

        return {
          isLive: true,
          viewerCount: stream.viewer_count,
          uptime,
          title: stream.title,
          category: stream.game_name,
          startedAt: stream.started_at
        };
      } else {
        // Stream is offline
        return {
          isLive: false,
          viewerCount: 0,
          uptime: '0m',
          title: 'Stream Offline',
          category: 'N/A'
        };
      }

    } catch (error) {
      console.error('❌ Failed to get stream status:', error);
      return {
        isLive: false,
        viewerCount: 0,
        uptime: '0m',
        title: 'Unable to fetch stream info',
        category: 'N/A'
      };
    }
  }

  private calculateUptime(startedAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - startedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  public async disconnectFromChannel(channelName: string): Promise<void> {
    try {
      if (this.client) {
        await this.client.disconnect();
        this.client = null;
      }
      
      this.activeChannels.delete(channelName);
      this.channelTokens.delete(channelName);
      
      // Reset stats
      this.moderationStats = {
        chatsAnalyzed: 0,
        timeoutsIssued: 0,
        bansIssued: 0,
        messagesDeleted: 0,
        spamBlocked: 0,
        toxicityScore: 0
      };

      if (this.io) {
        this.io.emit('connectionStatus', { connected: false, channel: channelName });
        this.io.emit('moderationStats', this.moderationStats);
      }

      console.log(`✅ Disconnected from ${channelName}`);
    } catch (error) {
      console.error('❌ Failed to disconnect from channel:', error);
    }
  }

  public getModerationStats(): ModerationStats {
    return { ...this.moderationStats };
  }

  public getActiveChannels(): string[] {
    return Array.from(this.activeChannels);
  }
}

export default TwitchChatService;

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const tmi = require('tmi.js');

console.log('🚀 Starting Citadel Real Twitch Integration Server...');

const app = express();
const server = createServer(app);
const PORT = 3000;

// Twitch configuration
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || 'zhgi6wffhqg4l55i6kl892tk5su0w7';
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '7lrolzo21j5ndldn367v5jx31e6sv5';
const TWITCH_REDIRECT_URI = 'http://localhost:3000/auth/twitch/callback';

// Store active connections
let activeConnections = new Map();
let twitchClient = null;
let currentChannel = null;
let moderationStats = {
  chatsAnalyzed: 0,
  timeoutsIssued: 0,
  bansIssued: 0,
  messagesDeleted: 0,
  spamBlocked: 0,
  toxicityScore: 0
};

// Your banned words list
const bannedWords = [
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

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ["GET", "POST"]
  }
});

// AI Moderation function
function containsBannedWords(message) {
  const lowerMessage = message.toLowerCase();
  return bannedWords.some(word => {
    const regex = new RegExp(`\\b${word.replace(/\*/g, '.')}\\b`, 'i');
    return regex.test(lowerMessage);
  });
}

// Check if message is spam
function isSpam(message) {
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

// Connect to Twitch chat
async function connectToTwitchChat(channelName, accessToken) {
  try {
    console.log(`🎮 Connecting to ${channelName}'s Twitch chat...`);
    
    // Disconnect existing client if any
    if (twitchClient) {
      await twitchClient.disconnect();
    }

    // Create new TMI client
    twitchClient = new tmi.Client({
      options: { debug: false },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: 'citadel_ai_moderator',
        password: `oauth:${accessToken}`,
      },
      channels: [channelName],
    });

    // Set up event handlers
    twitchClient.on('message', async (channel, tags, message, self) => {
      if (self) return; // Ignore bot's own messages

      console.log(`💬 [${channel}] ${tags.username}: ${message}`);
      
      // Update stats
      moderationStats.chatsAnalyzed++;

      // Create chat message object
      const chatMessage = {
        id: tags.id || Date.now().toString(),
        username: tags.username || 'Unknown',
        message: message,
        timestamp: new Date().toISOString(),
        isModerator: tags.mod || false,
        isSubscriber: tags.subscriber || false,
        badges: tags.badges ? Object.keys(tags.badges) : [],
        channel: channel
      };

      // Check for banned content
      let actionTaken = null;
      
      if (!tags.mod) { // Don't moderate moderators
        if (containsBannedWords(message)) {
          console.log(`🚨 BANNED WORD detected from ${tags.username}: ${message}`);
          
          try {
            // Delete the message
            if (tags.id) {
              await twitchClient.deletemessage(channel, tags.id);
              moderationStats.messagesDeleted++;
              console.log(`🗑️ Deleted message from ${tags.username}`);
            }

            // Timeout the user (10 minutes)
            await twitchClient.timeout(channel, tags.username, 600, 'Inappropriate language detected by AI moderator');
            moderationStats.timeoutsIssued++;
            moderationStats.toxicityScore = Math.min(1, moderationStats.toxicityScore + 0.1);
            
            actionTaken = 'timeout';
            chatMessage.action = 'timeout';
            
            console.log(`⏰ Timed out ${tags.username} for 10 minutes`);
          } catch (error) {
            console.error('❌ Failed to moderate message:', error);
          }
        } else if (isSpam(message)) {
          console.log(`🚨 SPAM detected from ${tags.username}: ${message}`);
          
          try {
            if (tags.id) {
              await twitchClient.deletemessage(channel, tags.id);
              moderationStats.messagesDeleted++;
            }
            
            await twitchClient.timeout(channel, tags.username, 300, 'Spam detected by AI moderator');
            moderationStats.timeoutsIssued++;
            moderationStats.spamBlocked++;
            
            actionTaken = 'timeout';
            chatMessage.action = 'timeout';
            
            console.log(`⏰ Timed out ${tags.username} for spam (5 minutes)`);
          } catch (error) {
            console.error('❌ Failed to moderate spam:', error);
          }
        }
      }

      // Gradually decrease toxicity score for clean messages
      if (!actionTaken) {
        moderationStats.toxicityScore = Math.max(0, moderationStats.toxicityScore - 0.001);
      }

      // Emit to frontend
      io.emit('chatMessage', chatMessage);
      io.emit('moderationStats', moderationStats);
    });

    twitchClient.on('connected', (addr, port) => {
      console.log(`✅ Connected to Twitch IRC: ${addr}:${port}`);
      currentChannel = channelName;
      io.emit('connectionStatus', { connected: true, channel: channelName });
    });

    twitchClient.on('disconnected', (reason) => {
      console.log(`❌ Disconnected from Twitch IRC: ${reason}`);
      currentChannel = null;
      io.emit('connectionStatus', { connected: false, reason });
    });

    // Connect to Twitch
    await twitchClient.connect();
    return true;

  } catch (error) {
    console.error('❌ Failed to connect to Twitch chat:', error);
    return false;
  }
}

// Get real stream status from Twitch API
async function getStreamStatus(channelName, accessToken) {
  try {
    // Get user ID first
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const userId = userData.data[0]?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    // Check stream status
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    if (!streamResponse.ok) {
      throw new Error('Failed to get stream info');
    }

    const streamData = await streamResponse.json();
    const stream = streamData.data[0];

    if (stream) {
      // Stream is live
      const startedAt = new Date(stream.started_at);
      const now = new Date();
      const diffMs = now.getTime() - startedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      const uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Citadel Real Twitch Integration Server',
    activeChannel: currentChannel,
    moderationStats
  });
});

// Initiate Twitch OAuth
app.post('/api/auth/twitch', (req, res) => {
  const { moderatorId, userId } = req.body;
  console.log('🎮 Real Twitch OAuth initiated for:', { moderatorId, userId });
  
  const state = Buffer.from(JSON.stringify({ moderatorId, userId, timestamp: Date.now() })).toString('base64');
  const scopes = [
    'chat:read', 'chat:edit', 'channel:moderate', 'moderator:manage:banned_users',
    'moderator:manage:chat_messages', 'user:read:email'
  ].join(' ');

  const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
    `client_id=${TWITCH_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${encodeURIComponent(state)}`;

  console.log('🔗 Generated REAL Twitch OAuth URL:', authUrl);
  res.json({ authUrl });
});

// Handle Twitch OAuth callback
app.get('/auth/twitch/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Twitch OAuth error:', error);
      return res.redirect(`http://localhost:5173?error=twitch_auth_failed`);
    }

    if (!code || !state) {
      return res.redirect(`http://localhost:5173?error=missing_parameters`);
    }

    // Decode state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (err) {
      return res.redirect(`http://localhost:5173?error=invalid_state`);
    }

    const { moderatorId, userId } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TWITCH_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Get user info from Twitch
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Twitch');
    }

    const userData = await userResponse.json();
    const twitchUser = userData.data[0];

    console.log('✅ REAL Twitch authentication successful:', {
      userId,
      moderatorId,
      twitchUsername: twitchUser.login,
      twitchUserId: twitchUser.id,
    });

    // Store the connection
    activeConnections.set(twitchUser.login, {
      accessToken: access_token,
      refreshToken: refresh_token,
      userId: twitchUser.id,
      moderatorId
    });

    // Connect to Twitch chat with REAL user account
    const chatConnected = await connectToTwitchChat(twitchUser.login, access_token);

    if (!chatConnected) {
      console.error('❌ Failed to connect to REAL Twitch chat');
      return res.redirect(`http://localhost:5173?error=chat_connection_failed`);
    }

    // Get REAL stream status
    const streamStatus = await getStreamStatus(twitchUser.login, access_token);
    io.emit('streamStatus', streamStatus);

    console.log(`✅ Successfully connected to ${twitchUser.login}'s REAL Twitch chat with AI moderation`);

    // Redirect to live dashboard with REAL username
    res.redirect(`http://localhost:5173/#live-dashboard?moderator=${moderatorId}&twitch=${twitchUser.login}`);
  } catch (error) {
    console.error('Twitch OAuth callback error:', error);
    res.redirect(`http://localhost:5173?error=twitch_callback_failed`);
  }
});

// Disconnect from Twitch chat
app.post('/api/auth/twitch/disconnect', async (req, res) => {
  try {
    const { channelName } = req.body;
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    if (twitchClient) {
      await twitchClient.disconnect();
      twitchClient = null;
    }
    
    activeConnections.delete(channelName);
    currentChannel = null;
    
    // Reset stats
    moderationStats = {
      chatsAnalyzed: 0,
      timeoutsIssued: 0,
      bansIssued: 0,
      messagesDeleted: 0,
      spamBlocked: 0,
      toxicityScore: 0
    };

    io.emit('connectionStatus', { connected: false, channel: channelName });
    io.emit('moderationStats', moderationStats);

    console.log(`✅ Disconnected from ${channelName}'s REAL Twitch chat`);
    
    res.json({ 
      success: true, 
      message: `Disconnected from ${channelName}` 
    });
  } catch (error) {
    console.error('Failed to disconnect from Twitch chat:', error);
    res.status(500).json({ error: 'Failed to disconnect from chat' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Send current connection status
  socket.emit('connectionStatus', { 
    connected: !!currentChannel, 
    channel: currentChannel 
  });
  
  // Send current moderation stats
  socket.emit('moderationStats', moderationStats);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 REAL Twitch Integration Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket server ready for REAL-TIME chat`);
  console.log(`🎮 Twitch OAuth: http://localhost:${PORT}/api/auth/twitch`);
  console.log(`⚠️  NO MOCK DATA - Everything is REAL Twitch integration`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  if (twitchClient) {
    await twitchClient.disconnect();
  }
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

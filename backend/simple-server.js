const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

console.log('🚀 Starting Citadel Backend Server...');

const app = express();
const server = createServer(app);
const PORT = 3000;

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

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Citadel Backend Server Running'
  });
});

// Twitch OAuth initiation (simplified)
app.post('/api/auth/twitch', (req, res) => {
  const { moderatorId, userId } = req.body;
  console.log('🎮 Twitch OAuth initiated for:', { moderatorId, userId });
  
  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || 'zhgi6wffhqg4l55i6kl892tk5su0w7';
  const TWITCH_REDIRECT_URI = 'http://localhost:3000/auth/twitch/callback';
  
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

  console.log('🔗 Generated Twitch OAuth URL:', authUrl);
  res.json({ authUrl });
});

// Twitch OAuth callback (simplified)
app.get('/auth/twitch/callback', (req, res) => {
  const { code, state } = req.query;
  console.log('🎮 Twitch OAuth callback received:', { code: !!code, state: !!state });
  
  if (!code || !state) {
    return res.redirect('http://localhost:5173?error=missing_parameters');
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { moderatorId } = stateData;
    
    // For now, simulate successful auth and redirect to live dashboard
    console.log('✅ Simulating successful Twitch auth for moderator:', moderatorId);
    res.redirect(`http://localhost:5173/#live-dashboard?moderator=${moderatorId}&twitch=testuser`);
  } catch (error) {
    console.error('❌ Error processing Twitch callback:', error);
    res.redirect('http://localhost:5173?error=callback_failed');
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Send initial connection status
  socket.emit('connectionStatus', { connected: true, channel: 'testuser' });
  
  // Send mock stream status
  socket.emit('streamStatus', {
    isLive: false,
    viewerCount: 0,
    uptime: '0m',
    title: 'Stream Offline - Connect to start monitoring',
    category: 'N/A'
  });
  
  // Send initial moderation stats
  socket.emit('moderationStats', {
    chatsAnalyzed: 0,
    timeoutsIssued: 0,
    bansIssued: 0,
    messagesDeleted: 0,
    spamBlocked: 0,
    toxicityScore: 0
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket server ready for real-time chat`);
  console.log(`🎮 Twitch OAuth: http://localhost:${PORT}/api/auth/twitch`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

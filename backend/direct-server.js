// Direct server startup - bypasses npm issues
const path = require('path');
const fs = require('fs');

// Load environment variables manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/"/g, '');
    }
  });
}

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Twitch OAuth configuration
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REDIRECT_URI = `http://localhost:3001/api/auth/twitch/callback`;

console.log('🔧 Server Configuration:');
console.log('  - Port:', PORT);
console.log('  - Twitch Client ID:', TWITCH_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('  - Twitch Client Secret:', TWITCH_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  - Redirect URI:', TWITCH_REDIRECT_URI);
console.log('');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    twitchConfigured: !!(TWITCH_CLIENT_ID && TWITCH_CLIENT_SECRET),
    port: PORT
  });
});

// Initiate Twitch OAuth
app.post('/api/auth/twitch', async (req, res) => {
  try {
    console.log('🎮 Twitch auth request received:', {
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    const { moderatorId, userId } = req.body;

    if (!TWITCH_CLIENT_ID) {
      console.error('❌ Twitch client ID not configured');
      return res.status(500).json({ error: 'Twitch client ID not configured' });
    }

    if (!TWITCH_CLIENT_SECRET) {
      console.error('❌ Twitch client secret not configured');
      return res.status(500).json({ error: 'Twitch client secret not configured' });
    }

    // Generate a state parameter for security
    const state = Buffer.from(JSON.stringify({ 
      moderatorId, 
      userId, 
      timestamp: Date.now() 
    })).toString('base64');

    // Construct Twitch OAuth URL
    const scopes = [
      'chat:read',
      'chat:edit',
      'channel:moderate',
      'moderator:manage:banned_users',
      'moderator:manage:chat_messages',
      'user:read:email'
    ].join(' ');

    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${TWITCH_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${encodeURIComponent(state)}`;

    console.log('✅ Generated auth URL successfully');
    console.log('🔗 Redirecting user to Twitch OAuth...');
    
    res.json({ authUrl });
  } catch (error) {
    console.error('❌ Twitch OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Twitch authentication',
      details: error.message 
    });
  }
});

// Handle Twitch OAuth callback
app.get('/api/auth/twitch/callback', async (req, res) => {
  try {
    console.log('🔄 Twitch callback received:', {
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
    const { code, state, error } = req.query;

    if (error) {
      console.error('❌ Twitch OAuth error:', error);
      return res.redirect(`http://localhost:5174?error=twitch_auth_failed&details=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('❌ Missing parameters:', { code: !!code, state: !!state });
      return res.redirect(`http://localhost:5174?error=missing_parameters`);
    }

    // Decode state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      console.log('📋 State data decoded:', stateData);
    } catch (err) {
      console.error('❌ Invalid state parameter:', err);
      return res.redirect(`http://localhost:5174?error=invalid_state`);
    }

    const { moderatorId, userId } = stateData;

    // Exchange code for access token
    console.log('🔄 Exchanging authorization code for access token...');
    
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
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return res.redirect(`http://localhost:5174?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;
    console.log('✅ Access token received successfully');

    // Get user info from Twitch
    console.log('🔄 Fetching user information from Twitch...');
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ Failed to get user info:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return res.redirect(`http://localhost:5174?error=user_info_failed`);
    }

    const userData = await userResponse.json();
    const twitchUser = userData.data[0];

    console.log('✅ Twitch authentication completed successfully!');
    console.log('👤 User Info:', {
      userId,
      moderatorId,
      twitchUsername: twitchUser.login,
      twitchUserId: twitchUser.id,
      twitchDisplayName: twitchUser.display_name
    });

    // Redirect to live dashboard with success parameters
    const redirectUrl = `http://localhost:5174/#/live-stream?` +
      `moderator=${encodeURIComponent(moderatorId)}&` +
      `twitch=${encodeURIComponent(twitchUser.login)}&` +
      `twitchId=${encodeURIComponent(twitchUser.id)}&` +
      `success=true`;
    
    console.log('🎯 Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Twitch OAuth callback error:', error);
    res.redirect(`http://localhost:5174?error=callback_failed&details=${encodeURIComponent(error.message)}`);
  }
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/twitch',
      'GET /api/auth/twitch/callback'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Citadel Backend Server Started Successfully!');
  console.log('');
  console.log('📊 Server Information:');
  console.log(`  - URL: http://localhost:${PORT}`);
  console.log(`  - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  - Twitch Auth: http://localhost:${PORT}/api/auth/twitch`);
  console.log('');
  console.log('🎮 Twitch Integration:');
  console.log(`  - Client ID: ${TWITCH_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  - Client Secret: ${TWITCH_CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  console.log('🔗 Ready to accept connections from frontend!');
  console.log('');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Please stop any other servers running on this port and try again.');
  } else {
    console.error('❌ Failed to start server:', err);
  }
  process.exit(1);
});

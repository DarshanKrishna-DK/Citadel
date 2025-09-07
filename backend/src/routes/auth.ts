import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// We'll get the twitchChatService instance from the request context
declare global {
  namespace Express {
    interface Request {
      twitchChatService?: any;
    }
  }
}

// Twitch OAuth configuration
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REDIRECT_URI = `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/twitch/callback`;

// Initiate Twitch OAuth
router.post('/twitch', async (req, res) => {
  try {
    const { moderatorId, userId } = req.body;

    console.log('🎮 Twitch OAuth initiated for:', { moderatorId, userId });

    if (!TWITCH_CLIENT_ID) {
      return res.status(500).json({ error: 'Twitch client ID not configured' });
    }

    // Generate a state parameter for security
    const state = Buffer.from(JSON.stringify({ moderatorId, userId, timestamp: Date.now() })).toString('base64');

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

    console.log('🔗 Generated Twitch OAuth URL:', authUrl);
    console.log('📍 Redirect URI:', TWITCH_REDIRECT_URI);

    res.json({ authUrl });
  } catch (error) {
    console.error('Twitch OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate Twitch authentication' });
  }
});

// Handle Twitch OAuth callback
router.get('/twitch/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Twitch OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=twitch_auth_failed`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=missing_parameters`);
    }

    // Decode state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    } catch (err) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=invalid_state`);
    }

    const { moderatorId, userId } = stateData;

    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID!,
        client_secret: TWITCH_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: TWITCH_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json() as any;
    const { access_token, refresh_token } = tokenData;

    // Get user info from Twitch
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID!,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Twitch');
    }

    const userData = await userResponse.json() as any;
    const twitchUser = userData.data[0];

    // Store tokens in database (you'll need to create this table)
    // For now, we'll just log and redirect
    console.log('Twitch authentication successful:', {
      userId,
      moderatorId,
      twitchUsername: twitchUser.login,
      twitchUserId: twitchUser.id,
    });

    // Connect to Twitch chat with real-time moderation
    const chatConnected = await req.twitchChatService.connectToChannel(
      twitchUser.login,
      access_token,
      refresh_token,
      moderatorId
    );

    if (!chatConnected) {
      console.error('❌ Failed to connect to Twitch chat');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=chat_connection_failed`);
    }

    // TODO: Store tokens in database
    // await prisma.twitchAuth.create({
    //   data: {
    //     userId,
    //     twitchUserId: twitchUser.id,
    //     twitchUsername: twitchUser.login,
    //     accessToken: access_token,
    //     refreshToken: refresh_token,
    //     moderatorId,
    //   },
    // });

    console.log(`✅ Successfully connected to ${twitchUser.login}'s chat with AI moderation`);

    // Redirect to live dashboard
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#live-dashboard?moderator=${moderatorId}&twitch=${twitchUser.login}`);
  } catch (error) {
    console.error('Twitch OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=twitch_callback_failed`);
  }
});

// Get current moderation stats
router.get('/twitch/stats', (req, res) => {
  try {
    const stats = req.twitchChatService.getModerationStats();
    const activeChannels = req.twitchChatService.getActiveChannels();
    
    res.json({
      stats,
      activeChannels,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get moderation stats:', error);
    res.status(500).json({ error: 'Failed to get moderation stats' });
  }
});

// Disconnect from Twitch chat
router.post('/twitch/disconnect', async (req, res) => {
  try {
    const { channelName } = req.body;
    
    if (!channelName) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    await req.twitchChatService.disconnectFromChannel(channelName);
    
    res.json({ 
      success: true, 
      message: `Disconnected from ${channelName}` 
    });
  } catch (error) {
    console.error('Failed to disconnect from Twitch chat:', error);
    res.status(500).json({ error: 'Failed to disconnect from chat' });
  }
});

export default router;
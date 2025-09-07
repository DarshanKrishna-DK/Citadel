import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import TwitchChatService from './services/TwitchChatService';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import aiModelRoutes from './routes/aiModels';
import licenseRoutes from './routes/licenses';
import sessionRoutes from './routes/sessions';
import marketplaceRoutes from './routes/marketplace';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000; // Use port 3000 to match Twitch OAuth configuration

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize services
export const prisma = new PrismaClient();
export const twitchChatService = new TwitchChatService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inject twitchChatService into request context
app.use((req, res, next) => {
  req.twitchChatService = twitchChatService;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai-models', aiModelRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Twitch OAuth callback route (matches Twitch app configuration)
app.use('/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection (don't fail if it doesn't work)
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.warn('⚠️ Database connection failed, starting server without DB:', dbError);
    }

    // Initialize Socket.IO with TwitchChatService
    twitchChatService.initializeSocketIO(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket server ready for real-time chat`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();


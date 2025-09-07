import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// POST /api/sessions/start
router.post('/start', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const { licenseId, platform } = req.body;

    if (!licenseId || !platform) {
      return res.status(400).json({ error: 'License ID and platform are required' });
    }

    // Validate platform
    if (!['TWITCH', 'YOUTUBE'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform. Must be TWITCH or YOUTUBE' });
    }

    // Check if license exists and belongs to user
    const license = await prisma.license.findFirst({
      where: {
        id: licenseId,
        ownerId: req.user!.id
      }
    });

    if (!license) {
      return res.status(404).json({ error: 'License not found or access denied' });
    }

    // Check if there's already an active session for this license
    const activeSession = await prisma.deploymentSession.findFirst({
      where: {
        licenseId,
        status: 'ACTIVE'
      }
    });

    if (activeSession) {
      return res.status(400).json({ error: 'An active session already exists for this license' });
    }

    // TODO: Call Aptos smart contract to start session
    // For now, we'll create the session in database
    const session = await prisma.deploymentSession.create({
      data: {
        licenseId,
        platform: platform as 'TWITCH' | 'YOUTUBE',
        startTime: new Date()
      },
      include: {
        license: {
          include: {
            aiModel: {
              select: {
                id: true,
                name: true,
                personality: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      session,
      message: 'Session started successfully',
      transactionHash: `mock_session_tx_${Date.now()}`
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// POST /api/sessions/end
router.post('/end', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Find the active session
    const session = await prisma.deploymentSession.findFirst({
      where: {
        id: sessionId,
        license: {
          ownerId: req.user!.id
        },
        status: 'ACTIVE'
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session not found or access denied' });
    }

    const endTime = new Date();

    // TODO: Call Aptos smart contract to end session and calculate payment
    // For now, we'll update the database
    const updatedSession = await prisma.deploymentSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        status: 'COMPLETED'
      },
      include: {
        license: {
          include: {
            aiModel: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    });

    // Calculate session duration and cost
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const cost = durationHours * updatedSession.license.aiModel.price;

    res.json({
      session: updatedSession,
      duration: durationHours,
      cost,
      message: 'Session ended successfully',
      transactionHash: `mock_end_tx_${Date.now()}`
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// GET /api/sessions/active
router.get('/active', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const activeSessions = await prisma.deploymentSession.findMany({
      where: {
        license: {
          ownerId: req.user!.id
        },
        status: 'ACTIVE'
      },
      include: {
        license: {
          include: {
            aiModel: {
              select: {
                id: true,
                name: true,
                personality: true,
                price: true
              }
            }
          }
        }
      }
    });

    // Calculate current costs
    const enhancedSessions = activeSessions.map(session => {
      const now = new Date();
      const durationMs = now.getTime() - session.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      const currentCost = durationHours * session.license.aiModel.price;

      return {
        ...session,
        currentDuration: durationHours,
        currentCost
      };
    });

    res.json({ sessions: enhancedSessions });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// GET /api/sessions/history
router.get('/history', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      prisma.deploymentSession.findMany({
        where: {
          license: {
            ownerId: req.user!.id
          },
          status: 'COMPLETED'
        },
        include: {
          license: {
            include: {
              aiModel: {
                select: {
                  id: true,
                  name: true,
                  personality: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.deploymentSession.count({
        where: {
          license: {
            ownerId: req.user!.id
          },
          status: 'COMPLETED'
        }
      })
    ]);

    // Calculate costs and durations
    const enhancedSessions = sessions.map(session => {
      const durationMs = session.endTime!.getTime() - session.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      const cost = durationHours * session.license.aiModel.price;

      return {
        ...session,
        duration: durationHours,
        cost
      };
    });

    res.json({
      sessions: enhancedSessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// GET /api/sessions/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.deploymentSession.findFirst({
      where: {
        id,
        license: {
          ownerId: req.user!.id
        }
      },
      include: {
        license: {
          include: {
            aiModel: {
              select: {
                id: true,
                name: true,
                description: true,
                personality: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Calculate session metrics
    let duration = null;
    let cost = null;

    if (session.endTime) {
      const durationMs = session.endTime.getTime() - session.startTime.getTime();
      duration = durationMs / (1000 * 60 * 60); // hours
      cost = duration * session.license.aiModel.price;
    }

    res.json({
      session: {
        ...session,
        duration,
        cost
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

export default router;



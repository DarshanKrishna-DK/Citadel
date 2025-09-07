import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// POST /api/licenses/acquire
router.post('/acquire', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const { aiModelId } = req.body;

    if (!aiModelId) {
      return res.status(400).json({ error: 'AI Model ID is required' });
    }

    // Check if AI model exists
    const aiModel = await prisma.aIModel.findUnique({
      where: { id: aiModelId }
    });

    if (!aiModel) {
      return res.status(404).json({ error: 'AI Model not found' });
    }

    // Check if user already owns this license
    const existingLicense = await prisma.license.findFirst({
      where: {
        ownerId: req.user!.id,
        aiModelId
      }
    });

    if (existingLicense) {
      return res.status(400).json({ error: 'You already own a license for this AI model' });
    }

    // TODO: Call Aptos smart contract to purchase license
    // For now, we'll generate a mock on-chain address
    const mockOnChainAddress = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

    // Create the license in database
    const license = await prisma.license.create({
      data: {
        onChainAddress: mockOnChainAddress,
        ownerId: req.user!.id,
        aiModelId
      },
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
    });

    res.status(201).json({
      license,
      message: 'License acquired successfully',
      transactionHash: `mock_tx_${Date.now()}`
    });
  } catch (error) {
    console.error('Acquire license error:', error);
    res.status(500).json({ error: 'Failed to acquire license' });
  }
});

// POST /api/licenses/upgrade
router.post('/upgrade', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const { licenseId, changes, feedback } = req.body;

    if (!licenseId || !changes) {
      return res.status(400).json({ error: 'License ID and changes are required' });
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

    // TODO: Call Aptos smart contract to upgrade license
    // For now, we'll update the database directly
    const mockUpgradeAddress = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: {
        level: license.level + 1,
        isUpgraded: true,
        onChainAddress: mockUpgradeAddress // In reality, this would be a new NFT
      },
      include: {
        aiModel: {
          select: {
            id: true,
            name: true,
            description: true,
            personality: true
          }
        }
      }
    });

    res.json({
      license: updatedLicense,
      message: 'License upgraded successfully',
      transactionHash: `mock_upgrade_tx_${Date.now()}`
    });
  } catch (error) {
    console.error('Upgrade license error:', error);
    res.status(500).json({ error: 'Failed to upgrade license' });
  }
});

// GET /api/licenses/my-licenses
router.get('/my-licenses', authenticateToken, requireRole(['STREAMER']), async (req: AuthRequest, res) => {
  try {
    const licenses = await prisma.license.findMany({
      where: { ownerId: req.user!.id },
      include: {
        aiModel: {
          select: {
            id: true,
            name: true,
            description: true,
            personality: true,
            price: true
          }
        },
        sessions: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            platform: true,
            startTime: true,
            endTime: true,
            status: true
          },
          orderBy: {
            startTime: 'desc'
          }
        }
      },
      orderBy: {
        acquiredAt: 'desc'
      }
    });

    // Calculate usage statistics
    const enhancedLicenses = licenses.map(license => ({
      ...license,
      stats: {
        totalSessions: license.sessions.length,
        totalUsageTime: license.sessions.reduce((total, session) => {
          if (session.endTime) {
            return total + (session.endTime.getTime() - session.startTime.getTime());
          }
          return total;
        }, 0),
        lastUsed: license.sessions.length > 0 ? license.sessions[0].startTime : null
      }
    }));

    res.json({ licenses: enhancedLicenses });
  } catch (error) {
    console.error('Get my licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch your licenses' });
  }
});

// GET /api/licenses/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const license = await prisma.license.findFirst({
      where: {
        id,
        ownerId: req.user!.id
      },
      include: {
        aiModel: {
          select: {
            id: true,
            name: true,
            description: true,
            personality: true,
            price: true
          }
        },
        sessions: {
          orderBy: {
            startTime: 'desc'
          }
        }
      }
    });

    if (!license) {
      return res.status(404).json({ error: 'License not found or access denied' });
    }

    res.json({ license });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Failed to fetch license' });
  }
});

export default router;



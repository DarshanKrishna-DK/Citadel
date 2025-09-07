import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// GET /api/user/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        aiModels: {
          include: {
            licenses: {
              select: {
                id: true,
                level: true,
                isUpgraded: true,
                acquiredAt: true
              }
            }
          }
        },
        licenses: {
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
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate analytics for creators
    let analytics = null;
    if (user.role === 'CREATOR') {
      const totalLicenses = user.aiModels.reduce((sum, model) =>
        sum + model.licenses.length, 0
      );

      const totalRevenue = user.aiModels.reduce((sum, model) =>
        sum + (model.licenses.length * model.price), 0
      );

      analytics = {
        totalModels: user.aiModels.length,
        totalLicenses,
        totalRevenue,
        models: user.aiModels.map(model => ({
          id: model.id,
          name: model.name,
          licenses: model.licenses.length,
          revenue: model.licenses.length * model.price
        }))
      };
    }

    res.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name,
        email: user.email
      },
      ...(user.role === 'CREATOR' && { aiModels: user.aiModels }),
      ...(user.role === 'STREAMER' && { licenses: user.licenses }),
      analytics
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, email, role } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        walletAddress: true,
        role: true,
        name: true,
        email: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;



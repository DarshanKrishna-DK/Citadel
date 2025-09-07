import express from 'express';
import { prisma } from '../server';

const router = express.Router();

// GET /api/marketplace
router.get('/', async (req, res) => {
  try {
    const { search, personality, creator, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { personality: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (personality && personality !== 'all') {
      where.personality = personality as string;
    }

    if (creator) {
      where.creator = {
        walletAddress: creator as string
      };
    }

    const [aiModels, total] = await Promise.all([
      prisma.aIModel.findMany({
        where,
        include: {
          creator: {
            select: {
              walletAddress: true,
              name: true
            }
          },
          licenses: {
            select: {
              id: true,
              level: true,
              isUpgraded: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.aIModel.count({ where })
    ]);

    // Enhance with calculated fields
    const enhancedModels = aiModels.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      personality: model.personality,
      price: model.price,
      onChainAddress: model.onChainAddress,
      creator: model.creator,
      totalLicenses: model.licenses.length,
      createdAt: model.createdAt,
      // Mock reputation score (in real app, this would come from blockchain)
      reputationScore: Math.floor(Math.random() * 100) + 1
    }));

    res.json({
      models: enhancedModels,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Marketplace error:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace data' });
  }
});

// GET /api/marketplace/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const aiModel = await prisma.aIModel.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            walletAddress: true,
            name: true
          }
        },
        licenses: {
          include: {
            owner: {
              select: {
                walletAddress: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!aiModel) {
      return res.status(404).json({ error: 'AI Model not found' });
    }

    // Calculate statistics
    const stats = {
      totalLicenses: aiModel.licenses.length,
      activeUsers: aiModel.licenses.length, // In real app, filter by active sessions
      averageRating: 4.5, // Mock rating
      reputationScore: Math.floor(Math.random() * 100) + 1
    };

    res.json({
      model: {
        ...aiModel,
        stats
      }
    });
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({ error: 'Failed to fetch model details' });
  }
});

// GET /api/marketplace/stats
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalModels, totalUsers, totalLicenses] = await Promise.all([
      prisma.aIModel.count(),
      prisma.user.count(),
      prisma.license.count()
    ]);

    res.json({
      totalModels,
      totalUsers,
      totalLicenses,
      totalRevenue: 0 // Would calculate from actual transactions
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;



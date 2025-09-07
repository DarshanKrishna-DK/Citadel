import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// POST /api/ai-models/mint
router.post('/mint', authenticateToken, requireRole(['CREATOR']), async (req: AuthRequest, res) => {
  try {
    const { name, description, personality, price } = req.body;

    // Validate input
    if (!name || !description || !personality || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    // TODO: Call Aptos smart contract to mint the AI model
    // For now, we'll generate a mock on-chain address
    const mockOnChainAddress = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

    // Create the AI model in database
    const aiModel = await prisma.aIModel.create({
      data: {
        onChainAddress: mockOnChainAddress,
        creatorId: req.user!.id,
        name,
        description,
        personality,
        price: parseFloat(price)
      },
      include: {
        creator: {
          select: {
            walletAddress: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      model: aiModel,
      message: 'AI Model minted successfully',
      transactionHash: `mock_tx_${Date.now()}`
    });
  } catch (error) {
    console.error('Mint AI model error:', error);
    res.status(500).json({ error: 'Failed to mint AI model' });
  }
});

// GET /api/ai-models/my-models
router.get('/my-models', authenticateToken, requireRole(['CREATOR']), async (req: AuthRequest, res) => {
  try {
    const aiModels = await prisma.aIModel.findMany({
      where: { creatorId: req.user!.id },
      include: {
        licenses: {
          select: {
            id: true,
            level: true,
            isUpgraded: true,
            acquiredAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate analytics for each model
    const enhancedModels = aiModels.map(model => ({
      ...model,
      analytics: {
        totalLicenses: model.licenses.length,
        revenue: model.licenses.length * model.price,
        averageLevel: model.licenses.length > 0
          ? model.licenses.reduce((sum, license) => sum + license.level, 0) / model.licenses.length
          : 0
      }
    }));

    res.json({ models: enhancedModels });
  } catch (error) {
    console.error('Get my models error:', error);
    res.status(500).json({ error: 'Failed to fetch your models' });
  }
});

// PUT /api/ai-models/:id
router.put('/:id', authenticateToken, requireRole(['CREATOR']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, personality, price } = req.body;

    // Verify ownership
    const existingModel = await prisma.aIModel.findFirst({
      where: {
        id,
        creatorId: req.user!.id
      }
    });

    if (!existingModel) {
      return res.status(404).json({ error: 'AI Model not found or access denied' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (personality) updateData.personality = personality;
    if (price) updateData.price = parseFloat(price);

    const updatedModel = await prisma.aIModel.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            walletAddress: true,
            name: true
          }
        }
      }
    });

    res.json({ model: updatedModel });
  } catch (error) {
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

// DELETE /api/ai-models/:id
router.delete('/:id', authenticateToken, requireRole(['CREATOR']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingModel = await prisma.aIModel.findFirst({
      where: {
        id,
        creatorId: req.user!.id
      }
    });

    if (!existingModel) {
      return res.status(404).json({ error: 'AI Model not found or access denied' });
    }

    // Check if model has active licenses
    const activeLicenses = await prisma.license.count({
      where: { aiModelId: id }
    });

    if (activeLicenses > 0) {
      return res.status(400).json({ error: 'Cannot delete model with active licenses' });
    }

    await prisma.aIModel.delete({
      where: { id }
    });

    res.json({ message: 'AI Model deleted successfully' });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

export default router;



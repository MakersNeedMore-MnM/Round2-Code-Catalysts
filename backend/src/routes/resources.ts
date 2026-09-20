import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { emitResourceUpdated } from '../sockets/socketManager';

const router = Router();

// GET /api/resources
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.status = String(status);
    if (type) where.type = String(type);

    const resources = await prisma.resource.findMany({
      where,
      include: {
        assignments: {
          where: { status: { not: 'COMPLETED' } },
          include: { incident: { select: { incidentNumber: true, type: true, status: true } } },
          take: 1,
          orderBy: { assignedAt: 'desc' }
        }
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }]
    });

    res.json({ resources });
  } catch {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, type, latitude, longitude, locationName, capability, capacity, contactInfo } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    const resource = await prisma.resource.create({
      data: { name, type, latitude: Number(latitude) || 17.3850, longitude: Number(longitude) || 78.4867, locationName, capability: capability || type, capacity: Number(capacity) || 10, contactInfo }
    });

    emitResourceUpdated(resource);
    res.status(201).json({ resource });
  } catch {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PATCH /api/resources/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, latitude, longitude, locationName } = req.body;
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(latitude && { latitude: Number(latitude) }),
        ...(longitude && { longitude: Number(longitude) }),
        ...(locationName && { locationName })
      }
    });
    emitResourceUpdated(resource);
    res.json({ resource });
  } catch {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

export default router;

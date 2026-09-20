import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const { unread } = req.query;
    const where: any = {};
    if (unread === 'true') where.isRead = false;

    const alerts = await prisma.alert.findMany({
      where,
      include: { incident: { select: { incidentNumber: true, type: true, priorityScore: true, status: true, latitude: true, longitude: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.alert.count({ where: { isRead: false } });
    res.json({ alerts, unreadCount });
  } catch {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PATCH /api/alerts/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { isRead, isAcknowledged } = req.body;
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(isAcknowledged !== undefined && { isAcknowledged, acknowledgedAt: isAcknowledged ? new Date() : undefined })
      }
    });
    res.json({ alert });
  } catch {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// PATCH /api/alerts/mark-all-read
router.patch('/mark-all-read', authenticate, async (req, res) => {
  try {
    await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
    res.json({ message: 'All alerts marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to mark alerts as read' });
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { ai } from '../ai';
import { emitIncidentUpdated, emitAlertNew } from '../sockets/socketManager';
type IncidentStatus = 'REPORTED' | 'AI_PROCESSING' | 'VERIFIED' | 'NEEDS_VERIFICATION' | 'PRIORITIZED' | 'RESOURCE_RECOMMENDED' | 'RESOURCE_ASSIGNED' | 'RESCUE_EN_ROUTE' | 'RESOLVED' | 'CLOSED' | string;

const router = Router();

// GET /api/incidents
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type, priority, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = String(status);
    if (type) where.type = String(type);
    if (search) where.OR = [
      { description: { contains: String(search), mode: 'insensitive' } },
      { locationName: { contains: String(search), mode: 'insensitive' } },
      { incidentNumber: { contains: String(search), mode: 'insensitive' } }
    ];
    if (priority === 'critical') where.priorityScore = { gte: 86 };
    else if (priority === 'very_high') where.priorityScore = { gte: 71, lt: 86 };
    else if (priority === 'high') where.priorityScore = { gte: 51, lt: 71 };

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          reports: { select: { id: true, type: true, verificationStatus: true } },
          assignments: {
            include: { resource: { select: { name: true, type: true } } },
            where: { status: { not: 'COMPLETED' } }
          },
          _count: { select: { reports: true } }
        },
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit)
      }),
      prisma.incident.count({ where })
    ]);

    res.json({ incidents, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/incidents/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        reports: {
          include: { reporter: { select: { name: true, email: true, role: true } } },
          orderBy: { createdAt: 'desc' }
        },
        assignments: {
          include: { resource: true },
          orderBy: { assignedAt: 'desc' }
        },
        alerts: { orderBy: { createdAt: 'desc' } },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Calculate fresh priority
    const priorityResult = await ai.calculatePriority({
      peopleAffected: incident.peopleAffected,
      vulnerablePeople: incident.vulnerablePeople,
      severity: incident.severity,
      accessibility: incident.accessibility,
      timeSensitivity: incident.timeSensitivity,
      confidenceScore: incident.confidenceScore,
      createdAt: incident.createdAt
    });

    // Get resource recommendations
    const recommendations = await ai.recommendResource(
      incident.id,
      incident.latitude,
      incident.longitude,
      incident.type
    );

    res.json({ incident, priorityResult, recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// PATCH /api/incidents/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status, peopleAffected, vulnerablePeople, severity, accessibility, timeSensitivity, locationName } = req.body;
    const { user } = req as any;

    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Incident not found' });

    const updateData: any = {};
    if (status) updateData.status = status as IncidentStatus;
    if (peopleAffected !== undefined) updateData.peopleAffected = Number(peopleAffected);
    if (vulnerablePeople !== undefined) updateData.vulnerablePeople = Boolean(vulnerablePeople);
    if (severity) updateData.severity = severity;
    if (accessibility) updateData.accessibility = accessibility;
    if (timeSensitivity) updateData.timeSensitivity = timeSensitivity;
    if (locationName) updateData.locationName = locationName;
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    // Recalculate priority if params changed
    if (peopleAffected || severity || accessibility) {
      const priorityResult = await ai.calculatePriority({
        peopleAffected: Number(peopleAffected || existing.peopleAffected),
        vulnerablePeople: vulnerablePeople !== undefined ? Boolean(vulnerablePeople) : existing.vulnerablePeople,
        severity: severity || existing.severity,
        accessibility: accessibility || existing.accessibility,
        timeSensitivity: timeSensitivity || existing.timeSensitivity,
        confidenceScore: existing.confidenceScore,
        createdAt: existing.createdAt
      });
      updateData.priorityScore = priorityResult.score;
    }

    const updated = await prisma.incident.update({
      where: { id: req.params.id },
      data: updateData,
      include: { assignments: { include: { resource: true } } }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        incidentId: req.params.id,
        action: `Status changed to ${status || 'updated'}`,
        details: JSON.stringify({ from: existing.status, to: status, updatedBy: user?.name })
      }
    });

    // Alert on critical status changes
    if (status === 'RESCUE_EN_ROUTE') {
      const alert = await prisma.alert.create({
        data: {
          incidentId: req.params.id,
          title: `RESCUE EN ROUTE: ${existing.incidentNumber}`,
          message: `Rescue team en route to ${existing.locationName || 'incident location'}`,
          severity: 'HIGH'
        }
      });
      emitAlertNew(alert);
    }

    emitIncidentUpdated(updated);
    res.json({ incident: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update incident', details: error.message });
  }
});

export default router;

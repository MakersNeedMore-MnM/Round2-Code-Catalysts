import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { emitResourceUpdated, emitIncidentUpdated, emitAlertNew } from '../sockets/socketManager';

const router = Router();

// POST /api/assignments — Assign resource to incident
router.post('/', authenticate, async (req, res) => {
  try {
    const { incidentId, resourceId, eta, notes } = req.body;
    const { user } = req as any;

    if (!incidentId || !resourceId) {
      return res.status(400).json({ error: 'incidentId and resourceId are required' });
    }

    const [incident, resource] = await Promise.all([
      prisma.incident.findUnique({ where: { id: incidentId } }),
      prisma.resource.findUnique({ where: { id: resourceId } })
    ]);

    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    if (resource.status !== 'AVAILABLE') return res.status(409).json({ error: 'Resource is not available' });

    const assignment = await prisma.resourceAssignment.create({
      data: { incidentId, resourceId, eta: eta ? Number(eta) : null, notes, status: 'ASSIGNED' },
      include: { resource: true, incident: true }
    });

    // Update resource and incident status
    const [updatedResource, updatedIncident] = await Promise.all([
      prisma.resource.update({ where: { id: resourceId }, data: { status: 'ASSIGNED' } }),
      prisma.incident.update({ where: { id: incidentId }, data: { status: 'RESOURCE_ASSIGNED' } })
    ]);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        incidentId,
        action: `Resource ${resource.name} assigned`,
        details: JSON.stringify({ resourceId, eta, assignedBy: user?.name })
      }
    });

    // Alert
    const alert = await prisma.alert.create({
      data: {
        incidentId,
        title: `RESOURCE ASSIGNED: ${incident.incidentNumber}`,
        message: `${resource.name} assigned to incident. ETA: ${eta || 'TBD'} minutes`,
        severity: 'HIGH'
      }
    });

    emitResourceUpdated(updatedResource);
    emitIncidentUpdated(updatedIncident);
    emitAlertNew(alert);

    res.status(201).json({ assignment, resource: updatedResource, incident: updatedIncident });
  } catch (error: any) {
    res.status(500).json({ error: 'Assignment failed', details: error.message });
  }
});

// PATCH /api/assignments/:id — Update assignment status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await prisma.resourceAssignment.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      },
      include: { resource: true, incident: true }
    });

    if (status === 'EN_ROUTE') {
      const [updatedResource, updatedIncident] = await Promise.all([
        prisma.resource.update({ where: { id: assignment.resourceId }, data: { status: 'EN_ROUTE' } }),
        prisma.incident.update({ where: { id: assignment.incidentId }, data: { status: 'RESCUE_EN_ROUTE' } })
      ]);
      emitResourceUpdated(updatedResource);
      emitIncidentUpdated(updatedIncident);
    }

    if (status === 'COMPLETED') {
      await prisma.resource.update({ where: { id: assignment.resourceId }, data: { status: 'AVAILABLE' } });
    }

    res.json({ assignment });
  } catch {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

export default router;

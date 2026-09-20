import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/citizen-stats — Citizen personalized report statistics
router.get('/citizen-stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const [totalReports, underReview, inProgress, resolved, recentReports] = await Promise.all([
      prisma.report.count({ where: { reporterId: userId } }),
      prisma.report.count({ where: { reporterId: userId, verificationStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_VERIFICATION'] } } }),
      prisma.report.count({ where: { reporterId: userId, verificationStatus: { in: ['VERIFIED', 'PRIORITIZED', 'RESOURCE_ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.report.count({ where: { reporterId: userId, verificationStatus: 'RESOLVED' } }),
      prisma.report.findMany({
        where: { reporterId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          incident: {
            select: {
              id: true,
              incidentNumber: true,
              status: true,
              severity: true,
              priorityScore: true
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalReports,
        underReview,
        inProgress,
        resolved
      },
      recentReports
    });
  } catch (error: any) {
    console.error('Citizen stats error:', error);
    res.status(500).json({ error: 'Failed to fetch citizen stats' });
  }
});

// GET /api/dashboard/stats — Command Center Admin Stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [
      activeIncidents,
      criticalIncidents,
      availableResources,
      peopleAtRisk,
      resolvedToday,
      totalReports,
      duplicateReports,
      incidentsByType,
      incidentsByStatus,
      recentIncidents,
      alertsUnread
    ] = await Promise.all([
      prisma.incident.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count({ where: { priorityScore: { gte: 86 }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.resource.count({ where: { status: 'AVAILABLE' } }),
      prisma.incident.aggregate({ where: { status: { notIn: ['RESOLVED', 'CLOSED'] } }, _sum: { peopleAffected: true } }),
      prisma.incident.count({ where: { status: 'RESOLVED', resolvedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.report.count(),
      prisma.report.count({ where: { verificationStatus: 'CORROBORATED' } }),
      prisma.incident.groupBy({ by: ['type'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      prisma.incident.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.incident.findMany({
        where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
        orderBy: { priorityScore: 'desc' },
        take: 5,
        select: { id: true, incidentNumber: true, type: true, locationName: true, priorityScore: true, status: true, createdAt: true }
      }),
      prisma.alert.count({ where: { isRead: false } })
    ]);

    // Response time stats (for analytics)
    const resolvedIncidents = await prisma.incident.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 20
    });

    const avgResponseTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((acc, i) => {
          if (i.resolvedAt) return acc + (i.resolvedAt.getTime() - i.createdAt.getTime()) / 60000;
          return acc;
        }, 0) / resolvedIncidents.length
      : 0;

    res.json({
      stats: {
        activeIncidents,
        criticalIncidents,
        availableResources,
        peopleAtRisk: peopleAtRisk._sum.peopleAffected || 0,
        resolvedToday,
        totalReports,
        duplicateReports,
        alertsUnread,
        avgResponseTimeMinutes: Math.round(avgResponseTime)
      },
      incidentsByType: incidentsByType.map(i => ({ type: i.type, count: i._count.id })),
      incidentsByStatus: incidentsByStatus.map(i => ({ status: i.status, count: i._count.id })),
      recentIncidents
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [byPriority, resourceUtilization, reportsByDay, incidentsByType] = await Promise.all([
      prisma.incident.findMany({
        where: { createdAt: { gte: since } },
        select: { priorityScore: true }
      }),
      prisma.resource.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.report.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.incident.groupBy({ by: ['type'], _count: { id: true }, where: { createdAt: { gte: since } } })
    ]);

    // Bucket incidents by priority classification
    const priorityBuckets = { Low: 0, Moderate: 0, High: 0, 'Very High': 0, Critical: 0 };
    byPriority.forEach(i => {
      if (i.priorityScore >= 86) priorityBuckets.Critical++;
      else if (i.priorityScore >= 71) priorityBuckets['Very High']++;
      else if (i.priorityScore >= 51) priorityBuckets.High++;
      else if (i.priorityScore >= 31) priorityBuckets.Moderate++;
      else priorityBuckets.Low++;
    });

    res.json({
      priorityDistribution: Object.entries(priorityBuckets).map(([name, value]) => ({ name, value })),
      resourceUtilization: resourceUtilization.map(r => ({ status: r.status, count: r._count.id })),
      incidentsByType: incidentsByType.map(i => ({ type: i.type, count: i._count.id })),
      reportCount: reportsByDay.length
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

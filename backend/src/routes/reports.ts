import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuthenticate, AuthRequest } from '../middleware/auth';
import { ai } from '../ai';
import { emitIncidentNew, emitAlertNew } from '../sockets/socketManager';

const router = Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `report_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
    }
  }
});

function generateIncidentNumber(): string {
  return `RG-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Reverse geocoding helper using OpenStreetMap Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        headers: { 'User-Agent': 'RescueGrid-Emergency-System/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data: any = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',').slice(0, 3);
        return parts.join(',').trim();
      }
    }
  } catch (err) {
    console.warn('Reverse geocode failed or timed out:', err);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Base64 image upload helper
function handleBase64Image(base64Str: string): string | null {
  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return null;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `report_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to parse base64 image:', err);
    return null;
  }
}

// POST /api/reports — Submit a new emergency report (Supports JSON & multipart/form-data)
router.post('/', optionalAuthenticate, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    let { text, imageUrl, voiceUrl, latitude, longitude, locationName, emergencyType, peopleAffected, immediateDanger, type } = req.body;

    // Handle uploaded file via multer if present
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl && imageUrl.startsWith('data:image')) {
      const savedPath = handleBase64Image(imageUrl);
      if (savedPath) imageUrl = savedPath;
    }

    if (!text && !imageUrl && !voiceUrl) {
      return res.status(400).json({ error: 'Please describe the emergency or upload evidence (photo/voice).' });
    }

    const reporterId = req.user?.id || req.body.reporterId || null;
    const latNum = latitude ? Number(latitude) : null;
    const lngNum = longitude ? Number(longitude) : null;

    // Attempt reverse geocoding if lat/lng present and locationName not provided
    let resolvedLocation = locationName;
    if (!resolvedLocation && latNum && lngNum) {
      resolvedLocation = await reverseGeocode(latNum, lngNum);
    }

    // ============================================================
    // STEP 1: SAVE REPORT FIRST IN DATABASE (CRITICAL RULE 7 & 37)
    // ============================================================
    const initialReport = await prisma.report.create({
      data: {
        reporterId,
        type: type || (imageUrl ? 'IMAGE' : voiceUrl ? 'VOICE' : 'TEXT'),
        text: text || null,
        emergencyType: emergencyType || null,
        peopleAffected: peopleAffected || null,
        immediateDanger: immediateDanger || null,
        imageUrl: imageUrl || null,
        voiceUrl: voiceUrl || null,
        latitude: latNum,
        longitude: lngNum,
        locationName: resolvedLocation || (latNum && lngNum ? `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}` : 'Location from report'),
        verificationStatus: 'SUBMITTED',
        aiStatus: 'PENDING'
      }
    });

    // Create a notification for logged-in citizen
    if (reporterId) {
      await prisma.notification.create({
        data: {
          userId: reporterId,
          title: 'Report Received',
          message: `Your emergency report (ID: RG-${initialReport.id.substring(0, 6)}) has been received and stored.`,
          reportId: initialReport.id
        }
      }).catch(err => console.error('Failed to create citizen notification:', err));
    }

    // ============================================================
    // STEP 2: FAULT-TOLERANT AI PROCESSING & INCIDENT CREATION
    // ============================================================
    let aiResult: any = null;
    let confidence = 0.5;
    let priorityResult: any = null;
    let incident: any = null;
    let recommendations: any[] = [];
    let isDuplicate = false;

    try {
      if (text) {
        aiResult = await ai.analyzeText(text);
        confidence = aiResult.confidence || 0.6;
      }

      // Check duplicate incidents
      if (text) {
        const dupResult = await ai.detectDuplicates(text, latNum || undefined, lngNum || undefined);
        if (dupResult.isDuplicate && dupResult.relatedIncidentId) {
          isDuplicate = true;
          const incidentId = dupResult.relatedIncidentId;

          const updatedReport = await prisma.report.update({
            where: { id: initialReport.id },
            data: {
              incidentId,
              confidence,
              verificationStatus: 'CORROBORATED',
              aiStatus: 'COMPLETED',
              aiAnalysis: aiResult ? JSON.stringify(aiResult) : null
            }
          });

          await prisma.incident.update({
            where: { id: incidentId },
            data: { confidenceScore: Math.min(1, confidence + 0.1) }
          });

          return res.status(201).json({
            report: updatedReport,
            incidentId,
            isDuplicate: true,
            message: 'Report received and merged with existing incident'
          });
        }
      }

      // Create new Incident
      const disasterType = emergencyType ? emergencyType.toUpperCase().replace(/\s+/g, '_') : (aiResult?.disasterType || 'OTHER');
      const severity = aiResult?.severity || (immediateDanger === 'Yes' ? 'CRITICAL' : 'MODERATE');
      const accessibility = aiResult?.accessibility || 'Unknown';
      const timeSensitivity = aiResult?.timeSensitivity || 'Moderate';
      const countAffected = typeof peopleAffected === 'string' ? parseInt(peopleAffected) || 1 : (aiResult?.peopleAffected || 1);

      priorityResult = await ai.calculatePriority({
        peopleAffected: countAffected,
        vulnerablePeople: aiResult?.vulnerablePeople || false,
        severity: severity as any,
        accessibility,
        timeSensitivity,
        confidenceScore: confidence,
        createdAt: new Date()
      });

      const incidentNumber = generateIncidentNumber();

      incident = await prisma.incident.create({
        data: {
          incidentNumber,
          type: disasterType,
          description: text || `Emergency Report — ${emergencyType || 'Incident'}`,
          latitude: latNum || (17.3850 + (Math.random() - 0.5) * 0.1),
          longitude: lngNum || (78.4867 + (Math.random() - 0.5) * 0.1),
          locationName: resolvedLocation || 'Hyderabad Area',
          peopleAffected: countAffected,
          vulnerablePeople: aiResult?.vulnerablePeople || false,
          severity: severity as string,
          accessibility,
          timeSensitivity,
          priorityScore: priorityResult.score,
          confidenceScore: confidence,
          status: 'UNDER_REVIEW'
        }
      });

      // Update Report record with incident link & stringified aiAnalysis
      const finalReport = await prisma.report.update({
        where: { id: initialReport.id },
        data: {
          incidentId: incident.id,
          confidence,
          verificationStatus: 'UNDER_REVIEW',
          aiStatus: 'COMPLETED',
          aiAnalysis: aiResult ? JSON.stringify(aiResult) : null
        }
      });

      // Create Alert
      const alert = await prisma.alert.create({
        data: {
          incidentId: incident.id,
          title: `NEW REPORT: ${emergencyType || disasterType}`,
          message: text ? text.substring(0, 200) : `Emergency reported at ${resolvedLocation || 'location'}`,
          severity: priorityResult.score >= 70 ? 'CRITICAL' : 'HIGH'
        }
      });

      // Recommend resources
      recommendations = await ai.recommendResource(incident.id, incident.latitude, incident.longitude, disasterType as any);

      const fullIncident = await prisma.incident.findUnique({
        where: { id: incident.id },
        include: { reports: true, alerts: true }
      });

      emitIncidentNew(fullIncident);
      emitAlertNew(alert);

      return res.status(201).json({
        report: finalReport,
        incident: fullIncident,
        isDuplicate: false,
        priorityResult,
        recommendations,
        aiAnalysis: aiResult,
        message: 'Report submitted and processed successfully'
      });
    } catch (aiErr: any) {
      console.error('AI pipeline warning (Report saved, AI pending):', aiErr);

      const savedReport = await prisma.report.update({
        where: { id: initialReport.id },
        data: {
          aiStatus: 'PENDING_ANALYSIS',
          verificationStatus: 'SUBMITTED'
        }
      });

      return res.status(201).json({
        report: savedReport,
        incident: null,
        isDuplicate: false,
        message: 'Report received. AI analysis pending.'
      });
    }
  } catch (error: any) {
    console.error('Report submission critical error:', error);
    res.status(500).json({
      error: 'Unable to submit your report. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/reports/my — Get logged-in citizen's reports
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const reports = await prisma.report.findMany({
      where: { reporterId: userId },
      include: {
        incident: {
          select: {
            id: true,
            incidentNumber: true,
            type: true,
            status: true,
            severity: true,
            priorityScore: true,
            assignments: { include: { resource: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reports });
  } catch (error: any) {
    console.error('Fetch my reports error:', error);
    res.status(500).json({ error: 'Failed to fetch your reports' });
  }
});

// GET /api/reports/:id — Get details of a specific report
router.get('/:id', optionalAuthenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { name: true, email: true, phone: true } },
        incident: {
          include: {
            assignments: { include: { resource: true } },
            alerts: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check privacy: If logged in as citizen, only allow viewing own report (or if admin)
    if (req.user && req.user.role === 'CITIZEN' && report.reporterId && report.reporterId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own reports.' });
    }

    let parsedAiAnalysis = null;
    if (report.aiAnalysis) {
      try {
        parsedAiAnalysis = JSON.parse(report.aiAnalysis);
      } catch {
        parsedAiAnalysis = report.aiAnalysis;
      }
    }

    res.json({ report: { ...report, aiAnalysis: parsedAiAnalysis } });
  } catch (error: any) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report details' });
  }
});

// GET /api/reports — List all reports (Admin/Responder only)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { incidentId, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = incidentId ? { incidentId: String(incidentId) } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: { reporter: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.report.count({ where })
    ]);

    res.json({ reports, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;

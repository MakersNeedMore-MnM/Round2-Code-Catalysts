import { Router } from 'express';
import { ai } from '../ai';
import { authenticate } from '../middleware/auth';
import { DisasterType, Severity } from '../ai/aiProvider';

const router = Router();

// POST /api/ai/analyze-report
router.post('/analyze-report', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const result = await ai.analyzeText(text);
    res.json({ result, provider: 'development', disclaimer: 'AI provides decision support only. Results must be verified by emergency authorities.' });
  } catch (error) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// POST /api/ai/calculate-priority
router.post('/calculate-priority', authenticate, async (req, res) => {
  try {
    const { peopleAffected, vulnerablePeople, severity, accessibility, timeSensitivity, confidenceScore, createdAt } = req.body;
    const result = await ai.calculatePriority({
      peopleAffected: Number(peopleAffected) || 0,
      vulnerablePeople: Boolean(vulnerablePeople),
      severity: (severity as Severity) || 'MODERATE',
      accessibility: accessibility || 'Unknown',
      timeSensitivity: timeSensitivity || 'Moderate',
      confidenceScore: Number(confidenceScore) || 0.5,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });
    res.json({ result });
  } catch {
    res.status(500).json({ error: 'Priority calculation failed' });
  }
});

// POST /api/ai/find-duplicates
router.post('/find-duplicates', authenticate, async (req, res) => {
  try {
    const { text, latitude, longitude, excludeIncidentId } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const result = await ai.detectDuplicates(text, latitude, longitude, excludeIncidentId);
    res.json({ result });
  } catch {
    res.status(500).json({ error: 'Duplicate detection failed' });
  }
});

// POST /api/ai/recommend-resource
router.post('/recommend-resource', authenticate, async (req, res) => {
  try {
    const { incidentId, latitude, longitude, disasterType } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });
    const result = await ai.recommendResource(incidentId, Number(latitude), Number(longitude), (disasterType as DisasterType) || 'OTHER');
    res.json({ recommendations: result });
  } catch {
    res.status(500).json({ error: 'Resource recommendation failed' });
  }
});

export default router;

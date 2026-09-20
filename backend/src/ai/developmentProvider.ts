/**
 * RescueGrid AI — Development AI Provider
 *
 * ⚠️  DEVELOPMENT PROVIDER — Rule-based mock implementation.
 *     This is NOT a trained ML model. It uses keyword extraction,
 *     weighted scoring, and text similarity for the prototype.
 *     Replace AIProvider with an OpenAI/Google/custom provider for production.
 */

import {
  AIProvider,
  DisasterType,
  Severity,
  TextAnalysisResult,
  ImageAnalysisResult,
  AudioTranscriptionResult,
  DuplicateDetectionResult,
  PriorityResult,
  PriorityFactors,
  ResourceRecommendation
} from './aiProvider';
import { prisma } from '../lib/prisma';

// ── Keyword maps ──────────────────────────────────────────────

const DISASTER_KEYWORDS: Record<DisasterType, string[]> = {
  FLOOD: ['flood', 'flooded', 'flooding', 'water', 'submerged', 'waterlogged', 'inundated', 'drowned'],
  FIRE: ['fire', 'burning', 'smoke', 'flames', 'blaze', 'arson', 'burn'],
  EARTHQUAKE: ['earthquake', 'quake', 'tremor', 'seismic', 'aftershock', 'collapsed'],
  LANDSLIDE: ['landslide', 'mudslide', 'rockslide', 'slope', 'debris'],
  CYCLONE: ['cyclone', 'hurricane', 'typhoon', 'storm', 'wind', 'gale'],
  BUILDING_COLLAPSE: ['collapse', 'collapsed building', 'structure', 'rubble', 'debris', 'demolish'],
  MEDICAL_EMERGENCY: ['medical', 'injury', 'injured', 'unconscious', 'hospital', 'ambulance', 'health', 'sick', 'ill', 'heart'],
  ROAD_ACCIDENT: ['accident', 'crash', 'collision', 'vehicle', 'truck', 'car', 'road', 'highway', 'traffic'],
  CHEMICAL_HAZARD: ['chemical', 'gas leak', 'toxic', 'hazardous', 'poison', 'fumes'],
  DROUGHT: ['drought', 'water shortage', 'dry', 'arid', 'no water'],
  TSUNAMI: ['tsunami', 'wave', 'tidal', 'sea wave'],
  OTHER: []
};

const SEVERITY_KEYWORDS = {
  CRITICAL: ['critical', 'trapped', 'unconscious', 'death', 'dead', 'dying', 'life-threatening', 'immediately', 'urgent'],
  VERY_HIGH: ['very high', 'serious', 'severe', 'multiple', 'many people', 'children', 'elderly'],
  HIGH: ['high', 'significant', 'injured', 'damage', 'blocked'],
  MODERATE: ['moderate', 'some', 'minor damage'],
  LOW: ['low', 'no injuries', 'safe', 'contained']
};

const VULNERABLE_KEYWORDS = ['children', 'child', 'kids', 'elderly', 'old', 'disabled', 'pregnant', 'infant', 'baby', 'school', 'hospital', 'senior'];

const ACCESSIBILITY_KEYWORDS = {
  Poor: ['blocked', 'inaccessible', 'no access', 'flooded road', 'debris', 'cut off', 'isolated'],
  Moderate: ['difficult', 'partial access', 'limited', 'some roads'],
  Good: ['accessible', 'road open', 'clear']
};

const TIME_SENSITIVITY_KEYWORDS = {
  Critical: ['immediately', 'right now', 'urgent', 'trapped', 'sinking', 'fire spreading'],
  High: ['soon', 'quickly', 'getting worse', 'rising'],
  Moderate: ['within hours'],
  Low: ['stable', 'contained', 'no immediate']
};

const RESOURCE_MAP: Record<string, string[]> = {
  FLOOD: ['Boat Rescue Team', 'Water Pump Unit', 'Evacuation Team', 'Medical Team'],
  FIRE: ['Fire Brigade', 'Fire Rescue Team', 'Medical Team', 'Evacuation Team'],
  EARTHQUAKE: ['Search and Rescue Team', 'Medical Team', 'Heavy Equipment', 'Volunteer Team'],
  LANDSLIDE: ['Search and Rescue Team', 'Heavy Equipment', 'Medical Team', 'Rescue Vehicle'],
  CYCLONE: ['Emergency Response Team', 'Medical Team', 'Evacuation Team', 'Rescue Vehicle'],
  BUILDING_COLLAPSE: ['Search and Rescue Team', 'Medical Team', 'Heavy Equipment', 'Ambulance'],
  MEDICAL_EMERGENCY: ['Ambulance', 'Medical Team', 'Emergency Paramedic'],
  ROAD_ACCIDENT: ['Ambulance', 'Medical Team', 'Traffic Response', 'Fire Team'],
  CHEMICAL_HAZARD: ['Hazmat Team', 'Evacuation Team', 'Medical Team', 'Fire Team'],
  DROUGHT: ['Water Supply Team', 'Relief Distribution', 'Medical Team'],
  TSUNAMI: ['Coastal Rescue Team', 'Boat Rescue Team', 'Evacuation Team', 'Medical Team'],
  OTHER: ['Emergency Response Team', 'Medical Team']
};

// ── Utility helpers ───────────────────────────────────────────

function extractNumbers(text: string): number[] {
  const matches = text.match(/\b(\d+)\b/g);
  if (!matches) return [];
  return matches.map(Number).filter(n => n > 0 && n < 10000);
}

function detectDisasterType(text: string): DisasterType {
  const lower = text.toLowerCase();
  let best: DisasterType = 'OTHER';
  let maxCount = 0;

  for (const [type, keywords] of Object.entries(DISASTER_KEYWORDS)) {
    const count = keywords.filter(k => lower.includes(k)).length;
    if (count > maxCount) {
      maxCount = count;
      best = type as DisasterType;
    }
  }
  return best;
}

function detectSeverity(text: string): Severity {
  const lower = text.toLowerCase();
  if (SEVERITY_KEYWORDS.CRITICAL.some(k => lower.includes(k))) return 'CRITICAL';
  if (SEVERITY_KEYWORDS.VERY_HIGH.some(k => lower.includes(k))) return 'VERY_HIGH';
  if (SEVERITY_KEYWORDS.HIGH.some(k => lower.includes(k))) return 'HIGH';
  if (SEVERITY_KEYWORDS.MODERATE.some(k => lower.includes(k))) return 'MODERATE';
  return 'MODERATE';
}

function detectVulnerable(text: string): boolean {
  const lower = text.toLowerCase();
  return VULNERABLE_KEYWORDS.some(k => lower.includes(k));
}

function detectAccessibility(text: string): string {
  const lower = text.toLowerCase();
  if (ACCESSIBILITY_KEYWORDS.Poor.some(k => lower.includes(k))) return 'Poor';
  if (ACCESSIBILITY_KEYWORDS.Moderate.some(k => lower.includes(k))) return 'Moderate';
  return 'Good';
}

function detectTimeSensitivity(text: string): string {
  const lower = text.toLowerCase();
  if (TIME_SENSITIVITY_KEYWORDS.Critical.some(k => lower.includes(k))) return 'Critical';
  if (TIME_SENSITIVITY_KEYWORDS.High.some(k => lower.includes(k))) return 'High';
  if (TIME_SENSITIVITY_KEYWORDS.Moderate.some(k => lower.includes(k))) return 'Moderate';
  return 'Moderate';
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

function textSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── Development AI Provider ───────────────────────────────────

export class DevelopmentAIProvider implements AIProvider {
  readonly providerName = 'Development Rule-Based Provider (NOT a production AI model)';

  async analyzeText(text: string): Promise<TextAnalysisResult> {
    const disasterType = detectDisasterType(text);
    const severity = detectSeverity(text);
    const vulnerablePeople = detectVulnerable(text);
    const accessibility = detectAccessibility(text);
    const timeSensitivity = detectTimeSensitivity(text);
    const numbers = extractNumbers(text);
    const peopleAffected = numbers.length > 0 ? Math.max(...numbers.filter(n => n < 1000)) : (severity === 'CRITICAL' ? 10 : 5);

    const locationPhrases = ['near', 'at', 'in', 'sector', 'road', 'street', 'village', 'town', 'city', 'school', 'hospital'];
    const words = text.split(' ');
    const locationHints: string[] = [];
    words.forEach((word, i) => {
      if (locationPhrases.includes(word.toLowerCase()) && words[i+1]) {
        locationHints.push(`${word} ${words[i+1]}`);
      }
    });

    const confidence = Math.min(0.95, 0.5 + (text.length / 500) * 0.3 + (numbers.length > 0 ? 0.1 : 0) + (locationHints.length > 0 ? 0.1 : 0));

    return {
      disasterType,
      peopleAffected,
      vulnerablePeople,
      severity,
      accessibility,
      timeSensitivity,
      situationDescription: text.substring(0, 200),
      requiredResources: RESOURCE_MAP[disasterType] || RESOURCE_MAP.OTHER,
      locationHints,
      confidence,
      rawExtracted: { numbers, locationHints, keywords: Object.keys(DISASTER_KEYWORDS).filter(k => {
        const kws = DISASTER_KEYWORDS[k as DisasterType];
        return kws.some(kw => text.toLowerCase().includes(kw));
      })}
    };
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    // Development mock — real implementation would call Google Vision / AWS Rekognition
    return {
      detected: 'Emergency Situation',
      confidence: 0.72,
      visualEvidence: 'Medium',
      details: [
        'Image received and logged',
        'Visual analysis pending real CV provider',
        'Metadata extracted from upload'
      ],
      mockProvider: true
    };
  }

  async transcribeAudio(audioUrl: string): Promise<AudioTranscriptionResult> {
    // Development mock — real implementation would call OpenAI Whisper / Google STT
    return {
      transcript: '[Audio transcription requires a speech-to-text provider. Configure OPENAI_API_KEY or GOOGLE_STT_KEY in .env]',
      confidence: 0,
      extractedInfo: {},
      mockProvider: true
    };
  }

  async detectDuplicates(
    reportText: string,
    lat?: number,
    lng?: number,
    excludeIncidentId?: string
  ): Promise<DuplicateDetectionResult> {
    try {
      const recentIncidents = await prisma.incident.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // last 6h
          id: excludeIncidentId ? { not: excludeIncidentId } : undefined
        },
        include: { reports: { select: { text: true }, take: 3 } },
        take: 50
      });

      let bestMatch: { id: string; confidence: number } | null = null;
      let relatedCount = 0;

      for (const incident of recentIncidents) {
        const incidentTexts = [incident.description, ...incident.reports.map(r => r.text || '')].join(' ');
        const similarity = textSimilarity(reportText, incidentTexts);

        let geoBonus = 0;
        if (lat && lng) {
          const dist = haversineKm(lat, lng, incident.latitude, incident.longitude);
          if (dist < 1) geoBonus = 0.3;
          else if (dist < 3) geoBonus = 0.15;
        }

        const combined = Math.min(1, similarity + geoBonus);

        if (combined > 0.4) {
          relatedCount++;
          if (!bestMatch || combined > bestMatch.confidence) {
            bestMatch = { id: incident.id, confidence: combined };
          }
        }
      }

      if (bestMatch && bestMatch.confidence > 0.55) {
        return {
          isDuplicate: true,
          relatedIncidentId: bestMatch.id,
          confidence: bestMatch.confidence,
          relatedReportCount: relatedCount,
          reason: `High text similarity (${(bestMatch.confidence * 100).toFixed(0)}%) with existing incident${lat && lng ? ' + nearby location' : ''}`
        };
      }

      return { isDuplicate: false, confidence: bestMatch?.confidence || 0, relatedReportCount: relatedCount, reason: 'No matching incident found' };
    } catch {
      return { isDuplicate: false, confidence: 0, relatedReportCount: 0, reason: 'Duplicate check unavailable' };
    }
  }

  async calculatePriority(params: {
    peopleAffected: number;
    vulnerablePeople: boolean;
    severity: Severity;
    accessibility: string;
    timeSensitivity: string;
    confidenceScore: number;
    createdAt: Date;
  }): Promise<PriorityResult> {
    // Weights (must sum to 1.0)
    const WEIGHTS = {
      peopleAffected: 0.25,
      vulnerablePeople: 0.20,
      threatSeverity: 0.25,
      accessibility: 0.10,
      timeSensitivity: 0.15,
      evidenceConfidence: 0.05,
    };

    // Raw scores 0-100
    const peopleScore = Math.min(100, (params.peopleAffected / 50) * 100);
    const vulnerableScore = params.vulnerablePeople ? 100 : 30;
    const severityScore = { LOW: 20, MODERATE: 40, HIGH: 65, VERY_HIGH: 82, CRITICAL: 100 }[params.severity] ?? 50;
    const accessScore = { Poor: 100, Moderate: 55, Good: 20, Unknown: 50 }[params.accessibility] ?? 50;
    const timeScore = { Critical: 100, High: 75, Moderate: 45, Low: 20 }[params.timeSensitivity] ?? 45;
    const confidenceScoreNorm = params.confidenceScore * 100;

    const ageMs = Date.now() - params.createdAt.getTime();
    const freshnessScore = Math.max(0, 100 - (ageMs / (3600 * 1000)) * 5); // decays over hours

    const weightedScore =
      peopleScore * WEIGHTS.peopleAffected +
      vulnerableScore * WEIGHTS.vulnerablePeople +
      severityScore * WEIGHTS.threatSeverity +
      accessScore * WEIGHTS.accessibility +
      timeScore * WEIGHTS.timeSensitivity +
      confidenceScoreNorm * WEIGHTS.evidenceConfidence;

    const score = Math.round(Math.min(100, Math.max(0, weightedScore)));

    let classification: PriorityResult['classification'] = 'Low';
    if (score > 85) classification = 'Critical';
    else if (score > 70) classification = 'Very High';
    else if (score > 50) classification = 'High';
    else if (score > 30) classification = 'Moderate';

    const factors: PriorityFactors = {
      peopleAffected: Math.round(peopleScore),
      vulnerablePeople: Math.round(vulnerableScore),
      threatSeverity: Math.round(severityScore),
      accessibility: Math.round(accessScore),
      timeSensitivity: Math.round(timeScore),
      evidenceConfidence: Math.round(confidenceScoreNorm),
      incidentFreshness: Math.round(freshnessScore)
    };

    const breakdown = [
      { factor: 'Threat Severity', weight: WEIGHTS.threatSeverity, rawScore: severityScore, weightedScore: severityScore * WEIGHTS.threatSeverity, label: params.severity },
      { factor: 'People Affected', weight: WEIGHTS.peopleAffected, rawScore: peopleScore, weightedScore: peopleScore * WEIGHTS.peopleAffected, label: String(params.peopleAffected) },
      { factor: 'Vulnerable Groups', weight: WEIGHTS.vulnerablePeople, rawScore: vulnerableScore, weightedScore: vulnerableScore * WEIGHTS.vulnerablePeople, label: params.vulnerablePeople ? 'Present' : 'Not Identified' },
      { factor: 'Accessibility', weight: WEIGHTS.accessibility, rawScore: accessScore, weightedScore: accessScore * WEIGHTS.accessibility, label: params.accessibility },
      { factor: 'Time Sensitivity', weight: WEIGHTS.timeSensitivity, rawScore: timeScore, weightedScore: timeScore * WEIGHTS.timeSensitivity, label: params.timeSensitivity },
      { factor: 'Evidence Confidence', weight: WEIGHTS.evidenceConfidence, rawScore: confidenceScoreNorm, weightedScore: confidenceScoreNorm * WEIGHTS.evidenceConfidence, label: `${Math.round(confidenceScoreNorm)}%` },
    ];

    return { score, classification, factors, breakdown };
  }

  async recommendResource(
    incidentId: string,
    lat: number,
    lng: number,
    disasterType: DisasterType
  ): Promise<ResourceRecommendation[]> {
    try {
      const resources = await prisma.resource.findMany({
        where: { status: 'AVAILABLE' }
      });

      const typeMap: Record<string, string[]> = {
        FLOOD: ['BOAT', 'RESCUE_TEAM', 'MEDICAL_TEAM'],
        FIRE: ['FIRE_TEAM', 'AMBULANCE', 'RESCUE_TEAM'],
        EARTHQUAKE: ['RESCUE_TEAM', 'MEDICAL_TEAM', 'AMBULANCE'],
        LANDSLIDE: ['RESCUE_TEAM', 'MEDICAL_TEAM', 'RESCUE_VEHICLE'],
        MEDICAL_EMERGENCY: ['AMBULANCE', 'MEDICAL_TEAM'],
        ROAD_ACCIDENT: ['AMBULANCE', 'MEDICAL_TEAM', 'FIRE_TEAM'],
        BUILDING_COLLAPSE: ['RESCUE_TEAM', 'MEDICAL_TEAM', 'AMBULANCE'],
        CYCLONE: ['RESCUE_TEAM', 'MEDICAL_TEAM', 'RESCUE_VEHICLE'],
        CHEMICAL_HAZARD: ['FIRE_TEAM', 'MEDICAL_TEAM', 'RESCUE_TEAM'],
        TSUNAMI: ['BOAT', 'RESCUE_TEAM', 'MEDICAL_TEAM'],
        DROUGHT: ['MEDICAL_TEAM', 'RESCUE_VEHICLE'],
        OTHER: ['RESCUE_TEAM', 'MEDICAL_TEAM']
      };

      const preferred = typeMap[disasterType] || typeMap.OTHER;

      const scored = resources.map(r => {
        const dist = haversineKm(lat, lng, r.latitude, r.longitude);
        const eta = Math.round(dist / 0.5); // ~30 km/h avg speed
        const typeScore = preferred.includes(r.type) ? 40 : 10;
        const distScore = Math.max(0, 50 - dist * 5);
        const total = typeScore + distScore;

        return {
          resourceId: r.id,
          resourceName: r.name,
          distance: Math.round(dist * 10) / 10,
          eta,
          capability: r.capability,
          reason: `${preferred.includes(r.type) ? 'Capability match' : 'Nearest available'} — ${dist.toFixed(1)} km away`,
          score: total
        };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 3);
    } catch {
      return [];
    }
  }
}

export const devAI = new DevelopmentAIProvider();

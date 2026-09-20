export type DisasterType = 'FLOOD' | 'FIRE' | 'EARTHQUAKE' | 'LANDSLIDE' | 'CYCLONE' | 'BUILDING_COLLAPSE' | 'MEDICAL_EMERGENCY' | 'ROAD_ACCIDENT' | 'CHEMICAL_HAZARD' | 'DROUGHT' | 'TSUNAMI' | 'OTHER' | string;
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL' | string;

// ============================================================
// AI Provider Interface
// ============================================================
export interface TextAnalysisResult {
  disasterType: DisasterType;
  peopleAffected: number;
  vulnerablePeople: boolean;
  severity: Severity;
  accessibility: string;
  timeSensitivity: string;
  situationDescription: string;
  requiredResources: string[];
  locationHints: string[];
  confidence: number;
  rawExtracted: Record<string, any>;
}

export interface PriorityFactors {
  peopleAffected: number;       // 0-100
  vulnerablePeople: number;     // 0-100
  threatSeverity: number;       // 0-100
  accessibility: number;        // 0-100
  timeSensitivity: number;      // 0-100
  evidenceConfidence: number;   // 0-100
  incidentFreshness: number;    // 0-100
}

export interface PriorityResult {
  score: number;                // 0-100
  classification: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Critical';
  factors: PriorityFactors;
  breakdown: PriorityBreakdownItem[];
}

export interface PriorityBreakdownItem {
  factor: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  label: string;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  relatedIncidentId?: string;
  confidence: number;
  relatedReportCount: number;
  reason: string;
}

export interface ImageAnalysisResult {
  detected: string;
  confidence: number;
  visualEvidence: 'High' | 'Medium' | 'Low' | 'None';
  details: string[];
  mockProvider: boolean;
}

export interface AudioTranscriptionResult {
  transcript: string;
  confidence: number;
  extractedInfo: Partial<TextAnalysisResult>;
  mockProvider: boolean;
}

export interface ResourceRecommendation {
  resourceId: string;
  resourceName: string;
  distance: number;
  eta: number;
  capability: string;
  reason: string;
  score: number;
}

export interface AIProvider {
  analyzeText(text: string): Promise<TextAnalysisResult>;
  analyzeImage(imageUrl: string): Promise<ImageAnalysisResult>;
  transcribeAudio(audioUrl: string): Promise<AudioTranscriptionResult>;
  detectDuplicates(reportText: string, lat?: number, lng?: number, incidentId?: string): Promise<DuplicateDetectionResult>;
  calculatePriority(params: {
    peopleAffected: number;
    vulnerablePeople: boolean;
    severity: Severity;
    accessibility: string;
    timeSensitivity: string;
    confidenceScore: number;
    createdAt: Date;
  }): Promise<PriorityResult>;
  recommendResource(incidentId: string, lat: number, lng: number, disasterType: DisasterType): Promise<ResourceRecommendation[]>;
}

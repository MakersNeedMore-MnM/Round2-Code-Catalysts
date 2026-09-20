// ── Shared types matching Prisma schema ──────────────────────

export type Role = 'CITIZEN' | 'VOLUNTEER' | 'NGO' | 'RESCUER' | 'AUTHORITY' | 'ADMIN';
export type DisasterType = 'FLOOD' | 'FIRE' | 'EARTHQUAKE' | 'LANDSLIDE' | 'CYCLONE' | 'BUILDING_COLLAPSE' | 'MEDICAL_EMERGENCY' | 'ROAD_ACCIDENT' | 'CHEMICAL_HAZARD' | 'DROUGHT' | 'TSUNAMI' | 'OTHER';
export type Severity = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'AI_PROCESSING' | 'VERIFIED' | 'NEEDS_VERIFICATION' | 'PRIORITIZED' | 'RESOURCE_RECOMMENDED' | 'RESOURCE_ASSIGNED' | 'RESCUE_EN_ROUTE' | 'RESOLVED' | 'CLOSED';
export type ResourceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'BUSY' | 'OFFLINE';
export type ResourceType = 'AMBULANCE' | 'BOAT' | 'FIRE_TEAM' | 'MEDICAL_TEAM' | 'RESCUE_TEAM' | 'VOLUNTEER_TEAM' | 'DRONE' | 'RESCUE_VEHICLE' | 'HELICOPTER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'SUSPICIOUS' | 'NEEDS_VERIFICATION' | 'LOW_CONFIDENCE' | 'CORROBORATED';
export type AlertSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
  role: Role;
  lastLogin?: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  type: DisasterType;
  description: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  peopleAffected: number;
  vulnerablePeople: boolean;
  severity: Severity;
  accessibility: string;
  timeSensitivity: string;
  priorityScore: number;
  confidenceScore: number;
  status: IncidentStatus;
  isDevelopmentData: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  reports?: Report[];
  assignments?: ResourceAssignment[];
  alerts?: Alert[];
  auditLogs?: AuditLog[];
  _count?: { reports: number };
}

export interface Report {
  id: string;
  incidentId?: string;
  reporterId?: string;
  type: string;
  text?: string;
  voiceUrl?: string;
  imageUrl?: string;
  transcript?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  aiAnalysis?: any;
  createdAt: string;
  reporter?: { name: string; email: string; role: string };
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
  locationName?: string;
  status: ResourceStatus;
  capability: string;
  capacity: number;
  contactInfo?: string;
  createdAt: string;
  assignments?: ResourceAssignment[];
}

export interface ResourceAssignment {
  id: string;
  incidentId: string;
  resourceId: string;
  assignedAt: string;
  eta?: number;
  status: string;
  notes?: string;
  completedAt?: string;
  resource?: Resource;
  incident?: Partial<Incident>;
}

export interface Alert {
  id: string;
  incidentId?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
  incident?: Partial<Incident>;
}

export interface AuditLog {
  id: string;
  userId?: string;
  incidentId?: string;
  action: string;
  details?: any;
  createdAt: string;
}

// ── AI Result Types ──────────────────────────────────────────

export interface PriorityBreakdownItem {
  factor: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  label: string;
}

export interface PriorityResult {
  score: number;
  classification: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Critical';
  factors: {
    peopleAffected: number;
    vulnerablePeople: number;
    threatSeverity: number;
    accessibility: number;
    timeSensitivity: number;
    evidenceConfidence: number;
    incidentFreshness: number;
  };
  breakdown: PriorityBreakdownItem[];
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
}

// ── Dashboard Stats ──────────────────────────────────────────

export interface DashboardStats {
  activeIncidents: number;
  criticalIncidents: number;
  availableResources: number;
  peopleAtRisk: number;
  resolvedToday: number;
  totalReports: number;
  duplicateReports: number;
  alertsUnread: number;
  avgResponseTimeMinutes: number;
}

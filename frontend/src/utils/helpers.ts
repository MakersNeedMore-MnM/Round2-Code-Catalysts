import type { DisasterType, IncidentStatus, ResourceStatus, Severity, AlertSeverity, ResourceType } from '../types';

// ── Priority helpers ─────────────────────────────────────────
export function getPriorityClass(score: number): string {
  if (score >= 86) return 'badge-critical';
  if (score >= 71) return 'badge-very-high';
  if (score >= 51) return 'badge-high';
  if (score >= 31) return 'badge-moderate';
  return 'badge-low';
}

export function getPriorityLabel(score: number): string {
  if (score >= 86) return 'Critical';
  if (score >= 71) return 'Very High';
  if (score >= 51) return 'High';
  if (score >= 31) return 'Moderate';
  return 'Low';
}

export function getPriorityColor(score: number): string {
  if (score >= 86) return '#dc2626';
  if (score >= 71) return '#ea580c';
  if (score >= 51) return '#d97706';
  if (score >= 31) return '#ca8a04';
  return '#16a34a';
}

export function getMarkerColor(score: number): string {
  if (score >= 86) return '#dc2626';
  if (score >= 71) return '#ea580c';
  if (score >= 51) return '#d97706';
  if (score >= 31) return '#facc15';
  return '#22c55e';
}

// ── Status helpers ───────────────────────────────────────────
export function getStatusLabel(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    REPORTED: 'Reported',
    AI_PROCESSING: 'AI Processing',
    VERIFIED: 'Verified',
    NEEDS_VERIFICATION: 'Needs Verification',
    PRIORITIZED: 'Prioritized',
    RESOURCE_RECOMMENDED: 'Resource Recommended',
    RESOURCE_ASSIGNED: 'Resource Assigned',
    RESCUE_EN_ROUTE: 'Rescue En Route',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  };
  return map[status] || status;
}

export function getStatusColor(status: IncidentStatus): string {
  const map: Record<string, string> = {
    REPORTED: 'bg-slate-100 text-slate-700',
    AI_PROCESSING: 'bg-violet-100 text-violet-700',
    VERIFIED: 'bg-blue-100 text-blue-700',
    NEEDS_VERIFICATION: 'bg-yellow-100 text-yellow-700',
    PRIORITIZED: 'bg-orange-100 text-orange-700',
    RESOURCE_RECOMMENDED: 'bg-amber-100 text-amber-700',
    RESOURCE_ASSIGNED: 'bg-cyan-100 text-cyan-700',
    RESCUE_EN_ROUTE: 'bg-indigo-100 text-indigo-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export function getResourceStatusClass(status: ResourceStatus): string {
  const map: Record<ResourceStatus, string> = {
    AVAILABLE: 'badge-available',
    ASSIGNED: 'badge-assigned',
    EN_ROUTE: 'badge-en-route',
    BUSY: 'badge-busy',
    OFFLINE: 'badge-offline',
  };
  return map[status] || 'badge-offline';
}

// ── Disaster type helpers ────────────────────────────────────
export function getDisasterLabel(type: DisasterType): string {
  const map: Record<DisasterType, string> = {
    FLOOD: 'Flood', FIRE: 'Fire', EARTHQUAKE: 'Earthquake', LANDSLIDE: 'Landslide',
    CYCLONE: 'Cyclone', BUILDING_COLLAPSE: 'Building Collapse', MEDICAL_EMERGENCY: 'Medical Emergency',
    ROAD_ACCIDENT: 'Road Accident', CHEMICAL_HAZARD: 'Chemical Hazard', DROUGHT: 'Drought',
    TSUNAMI: 'Tsunami', OTHER: 'Other'
  };
  return map[type] || type;
}

export function getDisasterIcon(type: DisasterType): string {
  const map: Record<DisasterType, string> = {
    FLOOD: '🌊', FIRE: '🔥', EARTHQUAKE: '⚡', LANDSLIDE: '🏔️', CYCLONE: '🌀',
    BUILDING_COLLAPSE: '🏚️', MEDICAL_EMERGENCY: '🏥', ROAD_ACCIDENT: '🚗',
    CHEMICAL_HAZARD: '☣️', DROUGHT: '🏜️', TSUNAMI: '🌊', OTHER: '⚠️'
  };
  return map[type] || '⚠️';
}

export function getResourceTypeLabel(type: ResourceType): string {
  const map: Record<ResourceType, string> = {
    AMBULANCE: 'Ambulance', BOAT: 'Boat', FIRE_TEAM: 'Fire Team', MEDICAL_TEAM: 'Medical Team',
    RESCUE_TEAM: 'Rescue Team', VOLUNTEER_TEAM: 'Volunteer Team', DRONE: 'Drone',
    RESCUE_VEHICLE: 'Rescue Vehicle', HELICOPTER: 'Helicopter'
  };
  return map[type] || type;
}

export function getResourceTypeIcon(type: ResourceType): string {
  const map: Record<ResourceType, string> = {
    AMBULANCE: '🚑', BOAT: '⛵', FIRE_TEAM: '🚒', MEDICAL_TEAM: '👨‍⚕️',
    RESCUE_TEAM: '🦺', VOLUNTEER_TEAM: '🙋', DRONE: '🚁',
    RESCUE_VEHICLE: '🚛', HELICOPTER: '🚁'
  };
  return map[type] || '🚨';
}

// ── Severity helpers ─────────────────────────────────────────
export function getSeverityLabel(severity: Severity): string {
  const map: Record<Severity, string> = {
    LOW: 'Low', MODERATE: 'Moderate', HIGH: 'High', VERY_HIGH: 'Very High', CRITICAL: 'Critical'
  };
  return map[severity] || severity;
}

// ── Alert severity helpers ───────────────────────────────────
export function getAlertSeverityClass(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    LOW: 'alert-strip-low', MODERATE: 'alert-strip-moderate',
    HIGH: 'alert-strip-high', CRITICAL: 'alert-strip-critical'
  };
  return map[severity] || 'alert-strip-moderate';
}

// ── Time helpers ─────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// ── Confidence helpers ────────────────────────────────────────
export function getConfidenceLabel(score: number): { label: string; color: string } {
  const pct = Math.round(score * 100);
  if (pct >= 85) return { label: 'Verified', color: 'text-emerald-700' };
  if (pct >= 70) return { label: 'Corroborated', color: 'text-blue-700' };
  if (pct >= 50) return { label: 'Needs Verification', color: 'text-yellow-700' };
  return { label: 'Low Confidence', color: 'text-red-700' };
}

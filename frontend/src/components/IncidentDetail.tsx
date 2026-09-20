import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incidentsApi, assignmentsApi } from '../services/api';
import type { Incident, Resource, PriorityResult, ResourceRecommendation } from '../types';
import { PriorityBreakdown, ConfidenceIndicator, StatusBadge, LoadingSpinner, AIDisclaimer } from './shared';
import {
  ChevronRight, Users, MapPin, Clock, AlertTriangle, CheckCircle,
  Zap, Navigation, X, ExternalLink, ShieldAlert
} from 'lucide-react';
import { getDisasterIcon, getDisasterLabel, getSeverityLabel, timeAgo, getResourceTypeIcon } from '../utils/helpers';

interface Props {
  incident: Incident;
  resources: Resource[];
  onUpdate: () => void;
}

export default function IncidentDetail({ incident, resources, onUpdate }: Props) {
  const [detail, setDetail] = useState<{ priorityResult: PriorityResult; recommendations: ResourceRecommendation[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignedMsg, setAssignedMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    incidentsApi.get(incident.id).then(res => {
      setDetail({ priorityResult: res.data.priorityResult, recommendations: res.data.recommendations });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [incident.id]);

  const handleAssign = async (rec: ResourceRecommendation) => {
    setAssigning(true);
    try {
      await assignmentsApi.create({ incidentId: incident.id, resourceId: rec.resourceId, eta: rec.eta });
      setAssignedMsg(`${rec.resourceName} assigned. ETA: ${rec.eta} min`);
      onUpdate();
    } catch (err: any) {
      setAssignedMsg(err.response?.data?.error || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await incidentsApi.update(incident.id, { status });
      onUpdate();
    } catch {}
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getDisasterIcon(incident.type)}</span>
          <div>
            <div className="font-semibold text-slate-800 text-sm">{getDisasterLabel(incident.type)}</div>
            <div className="text-xs font-mono text-slate-400">{incident.incidentNumber}</div>
          </div>
        </div>
        <Link to={`/incidents/${incident.id}`} className="text-navy-600 hover:text-navy-800">
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Dev data banner */}
        {incident.isDevelopmentData && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
            ⚠️ This is development/test data.
          </div>
        )}

        {/* Status + Basic info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <StatusBadge status={incident.status} />
            <span className="text-xs text-slate-400">{timeAgo(incident.createdAt)}</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5"><MapPin size={11} />{incident.locationName || 'Location not specified'}</div>
            <div className="flex items-center gap-1.5"><Users size={11} />{incident.peopleAffected} people affected {incident.vulnerablePeople && <span className="text-orange-500 font-medium">· Vulnerable groups present</span>}</div>
            <div className="flex items-center gap-1.5"><AlertTriangle size={11} />Severity: {getSeverityLabel(incident.severity)}</div>
            <div className="flex items-center gap-1.5"><Clock size={11} />Time sensitivity: {incident.timeSensitivity}</div>
            <div className="flex items-center gap-1.5"><Navigation size={11} />Accessibility: {incident.accessibility}</div>
          </div>
        </div>

        {/* Priority */}
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <LoadingSpinner size={14} />Calculating priority...
          </div>
        ) : detail?.priorityResult ? (
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Priority Score</p>
            <PriorityBreakdown result={detail.priorityResult} />
          </div>
        ) : null}

        {/* Confidence */}
        <div className="border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Report Confidence</p>
          <ConfidenceIndicator score={incident.confidenceScore} />
        </div>

        {/* Recommendations */}
        {detail?.recommendations && detail.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Recommended Resources</p>
            </div>
            <AIDisclaimer />
            {assignedMsg && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded border ${assignedMsg.includes('failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {assignedMsg.includes('failed') ? <X size={12} /> : <CheckCircle size={12} />}
                {assignedMsg}
              </div>
            )}
            {detail.recommendations.map((rec, i) => (
              <div key={rec.resourceId} className={`border rounded-lg p-3 space-y-2 ${i === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{rec.resourceName}</div>
                    <div className="text-xs text-slate-500">{rec.capability}</div>
                  </div>
                  {i === 0 && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Best Match</span>}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                  <div>📍 {rec.distance} km</div>
                  <div>⏱ {rec.eta} min ETA</div>
                </div>
                <div className="text-xs text-slate-500 italic">{rec.reason}</div>
                <button
                  onClick={() => handleAssign(rec)}
                  disabled={assigning || incident.status === 'RESOURCE_ASSIGNED' || incident.status === 'RESCUE_EN_ROUTE' || incident.status === 'RESOLVED'}
                  className="w-full py-1.5 bg-navy-800 hover:bg-navy-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {assigning ? 'Assigning...' : 'Assign Resource'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Status update buttons */}
        <div className="border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Update Status</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { status: 'VERIFIED', label: 'Verify' },
              { status: 'RESCUE_EN_ROUTE', label: 'En Route' },
              { status: 'RESOLVED', label: 'Resolved' },
              { status: 'CLOSED', label: 'Close' },
            ].map(({ status, label }) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={incident.status === status}
                className="py-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

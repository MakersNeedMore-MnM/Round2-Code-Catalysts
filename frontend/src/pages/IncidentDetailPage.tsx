import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { incidentsApi, assignmentsApi } from '../services/api';
import type { Incident, PriorityResult, ResourceRecommendation } from '../types';
import { LoadingSpinner, PriorityBreakdown, ConfidenceIndicator, StatusBadge, AIDisclaimer } from '../components/shared';
import { ArrowLeft, MapPin, Users, Clock, AlertTriangle, CheckCircle, Zap, FileText, Image, Mic, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { getDisasterLabel, getDisasterIcon, getSeverityLabel, formatDateTime, timeAgo, getResourceTypeIcon } from '../utils/helpers';
import { incidentsApi as api } from '../services/api';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ incident: Incident; priorityResult: PriorityResult; recommendations: ResourceRecommendation[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await incidentsApi.get(id);
      setData(res.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAssign = async (rec: ResourceRecommendation) => {
    if (!id) return;
    setAssigning(true);
    try {
      await assignmentsApi.create({ incidentId: id, resourceId: rec.resourceId, eta: rec.eta });
      setAssignMsg(`✓ ${rec.resourceName} assigned. ETA: ${rec.eta} min`);
      load();
    } catch (err: any) {
      setAssignMsg(`✗ ${err.response?.data?.error || 'Assignment failed'}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!id) return;
    await incidentsApi.update(id, { status });
    load();
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <LoadingSpinner size={36} />
    </div>
  );

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-500">Incident not found</p>
    </div>
  );

  const { incident, priorityResult, recommendations } = data;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/incidents" className="flex items-center gap-1 text-slate-500 hover:text-slate-800">
            <ArrowLeft size={14} />Incidents
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-slate-700">{incident.incidentNumber}</span>
          {incident.isDevelopmentData && <span className="badge bg-amber-100 text-amber-700 border-amber-200">Development Data</span>}
        </div>

        {/* Hero */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-3xl">
                  {getDisasterIcon(incident.type)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{getDisasterLabel(incident.type)}</h1>
                  <p className="text-slate-500 text-sm">{incident.locationName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={incident.status} />
                    <span className="text-xs text-slate-400">{formatDateTime(incident.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-4xl font-bold text-slate-900">{priorityResult.score}</div>
                <div className="text-sm font-semibold" style={{ color: '#dc2626' }}>{priorityResult.classification}</div>
                <div className="text-xs text-slate-400">Priority Score</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed">
              {incident.description}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left column */}
          <div className="col-span-2 space-y-5">
            {/* AI Intelligence */}
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-slate-800">AI Incident Intelligence</h2>
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Development Provider</span>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Disaster Type', value: getDisasterLabel(incident.type) },
                    { label: 'Severity', value: getSeverityLabel(incident.severity) },
                    { label: 'People Affected', value: incident.peopleAffected.toString() },
                    { label: 'Vulnerable Groups', value: incident.vulnerablePeople ? 'Present' : 'Not Identified' },
                    { label: 'Accessibility', value: incident.accessibility },
                    { label: 'Time Sensitivity', value: incident.timeSensitivity },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <AIDisclaimer />
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-slate-800">Evidence</h2>
                <span className="text-xs text-slate-400">{incident.reports?.length || 0} reports</span>
              </div>
              <div className="card-body space-y-3">
                {incident.reports?.length === 0 && <p className="text-sm text-slate-400">No reports attached</p>}
                {incident.reports?.map(report => (
                  <div key={report.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">
                        {report.type === 'TEXT' ? <FileText size={14} /> : report.type === 'IMAGE' ? <Image size={14} /> : <Mic size={14} />}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-600">{report.type} Report</span>
                          <span className={`badge text-xs ${report.verificationStatus === 'VERIFIED' ? 'badge-available' : 'badge-moderate'}`}>
                            {report.verificationStatus}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">{timeAgo(report.createdAt)}</span>
                        </div>
                        {report.text && <p className="text-sm text-slate-700">{report.text}</p>}
                        {report.imageUrl && <img src={report.imageUrl} alt="Evidence" className="mt-2 rounded-lg max-h-40 object-cover" />}
                        {report.latitude && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                            <MapPin size={10} />{report.latitude.toFixed(4)}, {report.longitude?.toFixed(4)}
                          </div>
                        )}
                        {report.reporter && (
                          <div className="text-xs text-slate-400 mt-1">By: {report.reporter.name} ({report.reporter.role})</div>
                        )}
                        <ConfidenceIndicator score={report.confidence} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            {incident.assignments && incident.assignments.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="font-semibold text-slate-800">Active Assignments</h2>
                </div>
                <div className="card-body space-y-2">
                  {incident.assignments.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span>{a.resource ? getResourceTypeIcon(a.resource.type as any) : '🚨'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{a.resource?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">ETA: {a.eta} min · {a.status}</div>
                      </div>
                      <span className={`badge ${a.status === 'EN_ROUTE' ? 'badge-en-route' : 'badge-assigned'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit log */}
            {incident.auditLogs && incident.auditLogs.length > 0 && (
              <div className="card">
                <button className="card-header w-full text-left" onClick={() => setShowAudit(!showAudit)}>
                  <h2 className="font-semibold text-slate-800">Audit History</h2>
                  {showAudit ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </button>
                {showAudit && (
                  <div className="card-body space-y-2">
                    {incident.auditLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-slate-700">{log.action}</span>
                          <span className="text-slate-400 ml-2">{timeAgo(log.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Priority breakdown */}
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-slate-800">Priority Breakdown</h2>
              </div>
              <div className="card-body">
                <PriorityBreakdown result={priorityResult} />
              </div>
            </div>

            {/* Resource recommendations */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  <h2 className="font-semibold text-slate-800">Resource Recommendations</h2>
                </div>
              </div>
              <div className="card-body space-y-3">
                <AIDisclaimer />
                {assignMsg && (
                  <div className={`text-xs px-3 py-2 rounded border ${assignMsg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {assignMsg}
                  </div>
                )}
                {recommendations.length === 0 && <p className="text-xs text-slate-400">No available resources found</p>}
                {recommendations.map((rec, i) => (
                  <div key={rec.resourceId} className={`border rounded-lg p-3 ${i === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-bold text-slate-800">{rec.resourceName}</div>
                      {i === 0 && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">Top Match</span>}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{rec.capability}</div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 mb-2">
                      <div>📍 {rec.distance} km</div>
                      <div>⏱ ETA {rec.eta} min</div>
                    </div>
                    <div className="text-xs text-slate-400 italic mb-2">{rec.reason}</div>
                    <button
                      onClick={() => handleAssign(rec)}
                      disabled={assigning || ['RESOURCE_ASSIGNED', 'RESCUE_EN_ROUTE', 'RESOLVED'].includes(incident.status)}
                      className="w-full py-1.5 bg-navy-800 hover:bg-navy-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-40"
                    >
                      {assigning ? 'Assigning...' : 'Assign Resource'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status update */}
            <div className="card">
              <div className="card-header"><h2 className="font-semibold text-slate-800">Update Status</h2></div>
              <div className="card-body space-y-2">
                {[
                  { status: 'VERIFIED', label: '✓ Mark Verified' },
                  { status: 'RESOURCE_ASSIGNED', label: '🚑 Resource Assigned' },
                  { status: 'RESCUE_EN_ROUTE', label: '🚨 Rescue En Route' },
                  { status: 'RESOLVED', label: '✅ Mark Resolved' },
                  { status: 'CLOSED', label: '🔒 Close Incident' },
                ].map(({ status, label }) => (
                  <button key={status} onClick={() => handleStatus(status)}
                    disabled={incident.status === status}
                    className="w-full py-2 text-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, incidentsApi, resourcesApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import type { Incident, DashboardStats, Resource } from '../types';
import { StatCard, IncidentCard, LoadingSpinner, EmptyState, AIDisclaimer } from '../components/shared';
import {
  AlertTriangle, Users, Shield, Clock, Radio, RefreshCw,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { getStatusLabel, getStatusColor, getResourceStatusClass, getResourceTypeIcon, getResourceTypeLabel, timeAgo, getDisasterLabel } from '../utils/helpers';
import DisasterMap from '../components/DisasterMap';
import IncidentDetail from '../components/IncidentDetail';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastIncident, lastAlert, connected } = useSocket();

  const load = useCallback(async () => {
    try {
      const [statsRes, incRes, resRes] = await Promise.all([
        dashboardApi.stats(),
        incidentsApi.list({ limit: 20 }),
        resourcesApi.list()
      ]);
      setStats(statsRes.data.stats);
      setIncidents(incRes.data.incidents);
      setResources(resRes.data.resources);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // React to real-time updates
  useEffect(() => {
    if (lastIncident) {
      setIncidents(prev => {
        const idx = prev.findIndex(i => i.id === lastIncident.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = lastIncident;
          return next;
        }
        return [lastIncident, ...prev].slice(0, 20);
      });
      load(); // refresh stats
    }
  }, [lastIncident]);

  useEffect(() => {
    if (lastAlert) load();
  }, [lastAlert]);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={40} className="mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900">RESCUEGRID COMMAND CENTER</h1>
          <p className="text-xs text-slate-400">Real-time disaster coordination · {new Date().toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs ${connected ? 'text-emerald-600' : 'text-red-500'}`}>
            <Radio size={12} className={connected ? 'animate-pulse' : ''} />
            {connected ? 'Live' : 'Offline'}
          </div>
          <button onClick={refresh} disabled={refreshing} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/report" className="btn-danger btn-sm">Report Emergency</Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 px-6 py-4 shrink-0 bg-slate-50 border-b border-slate-200">
          <StatCard label="Active Incidents" value={stats.activeIncidents} icon={Shield} color="text-navy-800" bgColor="bg-navy-100" />
          <StatCard label="Critical" value={stats.criticalIncidents} icon={AlertTriangle} color="text-red-700" bgColor="bg-red-100" subtext="Priority ≥86" />
          <StatCard label="Resources Available" value={stats.availableResources} icon={Users} color="text-emerald-700" bgColor="bg-emerald-100" />
          <StatCard label="People at Risk" value={stats.peopleAtRisk} icon={Clock} color="text-orange-700" bgColor="bg-orange-100" subtext="Active incidents only" />
        </div>
      )}

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Incident list */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Active Incidents</h2>
            <Link to="/incidents" className="text-xs text-navy-600 hover:text-navy-800 flex items-center gap-1">
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {incidents.length === 0 ? (
              <EmptyState icon={Shield} title="No active incidents" description="All clear — no ongoing emergencies" />
            ) : (
              incidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  selected={selectedIncident?.id === incident.id}
                  onClick={() => setSelectedIncident(incident)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative">
          <DisasterMap
            incidents={incidents}
            resources={resources}
            selectedId={selectedIncident?.id}
            onIncidentClick={setSelectedIncident}
          />
        </div>

        {/* Right: Incident detail */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          {selectedIncident ? (
            <IncidentDetail
              incident={selectedIncident}
              resources={resources}
              onUpdate={load}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <Shield size={22} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Select an incident</p>
              <p className="text-xs text-slate-400 mt-1">Click on an incident or map marker to view AI intelligence and resource recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom resource strip */}
      <div className="bg-white border-t border-slate-200 px-6 py-2 shrink-0">
        <div className="flex items-center gap-6 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Resources</span>
          {resources.slice(0, 8).map(r => (
            <div key={r.id} className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm">{getResourceTypeIcon(r.type)}</span>
              <span className="text-xs text-slate-700">{r.name}</span>
              <span className={`badge ${getResourceStatusClass(r.status)} text-xs`}>{r.status}</span>
            </div>
          ))}
          {resources.length > 8 && (
            <Link to="/resources" className="text-xs text-navy-600 hover:underline shrink-0">
              +{resources.length - 8} more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

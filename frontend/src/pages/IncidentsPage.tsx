import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { incidentsApi } from '../services/api';
import type { Incident, DisasterType, IncidentStatus } from '../types';
import { LoadingSpinner, EmptyState, StatusBadge } from '../components/shared';
import { Search, Filter, ChevronRight, AlertTriangle, Users, MapPin, Clock, BarChart2 } from 'lucide-react';
import { getDisasterLabel, getDisasterIcon, getPriorityLabel, getPriorityColor, timeAgo } from '../utils/helpers';

const DISASTER_TYPES: DisasterType[] = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'LANDSLIDE', 'CYCLONE', 'BUILDING_COLLAPSE', 'MEDICAL_EMERGENCY', 'ROAD_ACCIDENT', 'OTHER'];
const PRIORITY_OPTS = [{ value: '', label: 'All Priorities' }, { value: 'critical', label: 'Critical' }, { value: 'very_high', label: 'Very High' }, { value: 'high', label: 'High' }];
const STATUS_OPTS: IncidentStatus[] = ['REPORTED', 'VERIFIED', 'PRIORITIZED', 'RESOURCE_ASSIGNED', 'RESCUE_EN_ROUTE', 'RESOLVED'];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await incidentsApi.list(params);
      setIncidents(res.data.incidents);
      setTotal(res.data.total);
    } catch { } finally {
      setLoading(false);
    }
  }, [search, typeFilter, priorityFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Incident Management</h1>
            <p className="text-xs text-slate-400">{total} total incidents</p>
          </div>
          <Link to="/report" className="btn-danger">Report Emergency</Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search incidents, locations..."
              className="form-input pl-9 h-9"
              id="incident-search"
            />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="form-select h-9 w-44" id="filter-type">
            <option value="">All Disaster Types</option>
            {DISASTER_TYPES.map(t => <option key={t} value={t}>{getDisasterLabel(t)}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
            className="form-select h-9 w-36" id="filter-priority">
            {PRIORITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-select h-9 w-44" id="filter-status">
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size={32} />
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No incidents found" description="Try adjusting your filters" />
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                {['Incident', 'Location', 'People', 'Priority', 'Confidence', 'Status', 'Created', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.map(incident => (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
                  <td className="px-4 py-3">
                    {incident.isDevelopmentData && <span className="text-xs text-amber-600 mr-1">⚠️</span>}
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getDisasterIcon(incident.type)}</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{getDisasterLabel(incident.type)}</div>
                        <div className="text-xs text-slate-400 font-mono">{incident.incidentNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[160px]">
                    <div className="flex items-center gap-1"><MapPin size={10} /><span className="truncate">{incident.locationName || 'Unknown'}</span></div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1"><Users size={10} />{incident.peopleAffected}</div>
                    {incident.vulnerablePeople && <div className="text-orange-500 text-xs">Vulnerable</div>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: getPriorityColor(incident.priorityScore) }}>{incident.priorityScore}</span>
                      <span className="text-xs" style={{ color: getPriorityColor(incident.priorityScore) }}>{getPriorityLabel(incident.priorityScore)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{Math.round(incident.confidenceScore * 100)}%</td>
                  <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{timeAgo(incident.createdAt)}</td>
                  <td className="px-4 py-3">
                    <ChevronRight size={14} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

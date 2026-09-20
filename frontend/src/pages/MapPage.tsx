import { useState, useEffect, useCallback } from 'react';
import { incidentsApi, resourcesApi } from '../services/api';
import type { Incident, Resource } from '../types';
import DisasterMap from '../components/DisasterMap';
import IncidentDetail from '../components/IncidentDetail';
import { LoadingSpinner } from '../components/shared';
import { Search, Filter, Shield, RefreshCw } from 'lucide-react';
import { getDisasterLabel } from '../utils/helpers';

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const [incRes, resRes] = await Promise.all([
        incidentsApi.list({ limit: 100 }),
        resourcesApi.list()
      ]);
      setIncidents(incRes.data.incidents);
      setResources(resRes.data.resources);
    } catch (err) {
      console.error('Map load error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = search === '' || 
      (inc.description?.toLowerCase().includes(search.toLowerCase()) || 
       inc.locationName?.toLowerCase().includes(search.toLowerCase()) ||
       inc.incidentNumber?.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === '' || inc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size={36} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Filter Overlay */}
      <div className="bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter incidents on map..."
              className="form-input pl-9 h-9 w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="form-select h-9 w-44"
          >
            <option value="">All Types</option>
            <option value="FLOOD">Flood</option>
            <option value="FIRE">Fire</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="CYCLONE">Cyclone</option>
            <option value="BUILDING_COLLAPSE">Building Collapse</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </span>
          <button onClick={load} className="btn-secondary btn-sm">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          <DisasterMap
            incidents={filteredIncidents}
            resources={resources}
            selectedId={selectedIncident?.id}
            onIncidentClick={setSelectedIncident}
          />
        </div>

        {/* Floating Side Detail Panel if selected */}
        {selectedIncident && (
          <div className="w-88 border-l border-slate-200 bg-white flex flex-col z-10 shadow-lg overflow-hidden shrink-0">
            <IncidentDetail
              incident={selectedIncident}
              resources={resources}
              onUpdate={load}
            />
          </div>
        )}
      </div>
    </div>
  );
}

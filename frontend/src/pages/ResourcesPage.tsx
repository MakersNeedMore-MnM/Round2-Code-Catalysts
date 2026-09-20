import { useState, useEffect, useCallback } from 'react';
import { resourcesApi } from '../services/api';
import type { Resource, ResourceType, ResourceStatus } from '../types';
import { LoadingSpinner, EmptyState, StatusBadge } from '../components/shared';
import { Users, Search, Plus, MapPin, Phone, ShieldCheck, Radio, AlertCircle } from 'lucide-react';
import { getResourceTypeIcon, getResourceTypeLabel, getResourceStatusClass } from '../utils/helpers';

const TYPES: ResourceType[] = ['AMBULANCE', 'BOAT', 'FIRE_TEAM', 'MEDICAL_TEAM', 'RESCUE_TEAM', 'VOLUNTEER_TEAM', 'DRONE', 'RESCUE_VEHICLE', 'HELICOPTER'];
const STATUSES: ResourceStatus[] = ['AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'BUSY', 'OFFLINE'];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'RESCUE_TEAM' as ResourceType,
    capability: 'Search and rescue',
    capacity: 10,
    contactInfo: '+91 9876543210',
    locationName: 'Hyderabad Central Command',
    latitude: 17.3850,
    longitude: 78.4867
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.list();
      setResources(res.data.resources || []);
    } catch (err) {
      console.error('Resources load error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (resourceId: string, newStatus: ResourceStatus) => {
    try {
      await resourcesApi.updateStatus(resourceId, newStatus);
      load();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resourcesApi.create(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'RESCUE_TEAM',
        capability: 'Search and rescue',
        capacity: 10,
        contactInfo: '+91 9876543210',
        locationName: 'Hyderabad Central Command',
        latitude: 17.3850,
        longitude: 78.4867
      });
      load();
    } catch (err) {
      console.error('Failed to create resource', err);
    }
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.capability.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Emergency Response Resources</h1>
            <p className="text-xs text-slate-400">Deployed units, rescue teams, and emergency assets ({resources.length} total)</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} />
            Deploy New Unit
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resource name, capability..."
              className="form-input pl-9 h-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="form-select h-9 w-44"
          >
            <option value="">All Resource Types</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{getResourceTypeLabel(t)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select h-9 w-40"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No resources match your query" description="Try clearing filters or adding a new unit" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(res => (
              <div key={res.id} className="card p-5 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-50 border border-navy-100 rounded-lg flex items-center justify-center text-xl">
                      {getResourceTypeIcon(res.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{res.name}</h3>
                      <p className="text-xs text-slate-400">{getResourceTypeLabel(res.type)}</p>
                    </div>
                  </div>
                  <span className={`badge ${getResourceStatusClass(res.status)}`}>
                    {res.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={13} className="text-slate-400" />
                    <span>Capability: <strong>{res.capability}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-slate-400" />
                    <span>Capacity / Personnel: <strong>{res.capacity} persons</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400" />
                    <span className="truncate">{res.locationName || `${res.latitude.toFixed(3)}, ${res.longitude.toFixed(3)}`}</span>
                  </div>
                  {res.contactInfo && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{res.contactInfo}</span>
                    </div>
                  )}
                </div>

                {/* Status Switch Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Set Status:</span>
                  <select
                    value={res.status}
                    onChange={e => handleStatusChange(res.id, e.target.value as ResourceStatus)}
                    className="form-select h-7 text-xs py-0.5 px-2 rounded"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Deploy New Emergency Unit</h2>
            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NDRF Alpha Team 4"
                  className="form-input text-sm w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    className="form-select text-sm w-full"
                  >
                    {TYPES.map(t => (
                      <option key={t} value={t}>{getResourceTypeLabel(t)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    className="form-input text-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capability Description</label>
                <input
                  type="text"
                  value={formData.capability}
                  onChange={e => setFormData({ ...formData, capability: e.target.value })}
                  placeholder="e.g. Water rescue & evacuation"
                  className="form-input text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Location Name</label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g. Secunderabad Station"
                  className="form-input text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="form-input text-sm w-full"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

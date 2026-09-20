import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  FileText, Search, Filter, MapPin, Clock,
  AlertTriangle, ChevronRight, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportsApi.getMyReports();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      (r.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.verificationStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || (r.emergencyType || r.type) === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-red-500" />
            My Emergency Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time verification and response progress for all your submitted incidents.
          </p>
        </div>

        <button
          onClick={() => navigate('/report')}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Submit New Report
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, location, or RG ID..."
            className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESOURCE_ASSIGNED">Resource Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Road Accident">Road Accident</option>
            <option value="Fire">Fire</option>
            <option value="Flood">Flood</option>
            <option value="Building Collapse">Building Collapse</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Landslide">Landslide</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <LoadingSpinner size={36} />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'Try adjusting your search filters.'
              : 'You have not submitted any emergency reports yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => (
            <div
              key={report.id}
              onClick={() => navigate(`/my-reports/${report.id}`)}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 border border-red-900/50 px-2.5 py-0.5 rounded-md">
                    RG-{report.id.substring(0, 6).toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-200 uppercase">
                    {report.emergencyType || report.type || 'EMERGENCY'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                    report.verificationStatus === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : report.verificationStatus === 'SUBMITTED'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-blue-950 text-blue-400 border-blue-800'
                  }`}>
                    {report.verificationStatus.replace('_', ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                {report.text || 'Emergency report containing photo/voice evidence.'}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate max-w-[220px]">{report.locationName || 'GPS Location'}</span>
                  </div>
                  {report.imageUrl && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/60 border border-blue-900/50 px-2 py-0.5 rounded-md">
                      <ImageIcon className="w-3 h-3" /> Photo Attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

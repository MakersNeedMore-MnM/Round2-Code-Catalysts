import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  AlertTriangle, FileText, CheckCircle2, Clock, ShieldAlert,
  MapPin, Plus, ArrowRight, Activity, PhoneCall
} from 'lucide-react';

interface CitizenStats {
  totalReports: number;
  underReview: number;
  inProgress: number;
  resolved: number;
}

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CitizenStats>({
    totalReports: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLocation, setCopiedLocation] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.citizenStats();
      if (res.data) {
        setStats(res.data.stats || { totalReports: 0, underReview: 0, inProgress: 0, resolved: 0 });
        setRecentReports(res.data.recentReports || []);
      }
    } catch (err) {
      console.error('Failed to load citizen stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          navigator.clipboard.writeText(coords);
          setCopiedLocation(true);
          setTimeout(() => setCopiedLocation(false), 3000);
        },
        () => {
          alert('Location access denied or unavailable.');
        }
      );
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-900/40 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-800 text-red-400 text-xs px-3 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            24/7 Citizen Emergency Response Active
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {getTimeOfDay()}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Report disasters or distress situations instantly. AI automatically extracts key details, prioritizes high-impact incidents, and connects you with active emergency response teams.
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all transform hover:-translate-y-0.5"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Emergency Now
            </button>

            <button
              onClick={handleShareLocation}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl transition-all"
            >
              <MapPin className="w-4 h-4 text-red-400" />
              {copiedLocation ? 'GPS Copied to Clipboard!' : 'Share Current GPS'}
            </button>

            <button
              onClick={() => navigate('/my-reports')}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium rounded-xl transition-all"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              View My Reports
            </button>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <ShieldAlert className="absolute -bottom-8 -right-8 w-64 h-64 text-red-900/10 pointer-events-none" />
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-9 h-9 bg-blue-950 text-blue-400 border border-blue-800/50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {isLoading ? <LoadingSpinner size={24} /> : stats.totalReports}
          </div>
          <div className="text-xs text-slate-500">Submitted by your account</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Under Review</span>
            <div className="w-9 h-9 bg-amber-950 text-amber-400 border border-amber-800/50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {isLoading ? <LoadingSpinner size={24} /> : stats.underReview}
          </div>
          <div className="text-xs text-slate-500">AI analysis & verification pending</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 bg-purple-950 text-purple-400 border border-purple-800/50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {isLoading ? <LoadingSpinner size={24} /> : stats.inProgress}
          </div>
          <div className="text-xs text-slate-500">Rescuers assigned or en route</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved</span>
            <div className="w-9 h-9 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {isLoading ? <LoadingSpinner size={24} /> : stats.resolved}
          </div>
          <div className="text-xs text-slate-500">Emergency resolved safely</div>
        </div>
      </div>

      {/* Main Grid: My Recent Reports & Emergency Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              My Recent Emergency Reports
            </h2>
            <button
              onClick={() => navigate('/my-reports')}
              className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : recentReports.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-300">No emergency reports submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                If you encounter a medical emergency, flood, fire, or accident, click below to log a report immediately.
              </p>
              <button
                onClick={() => navigate('/report')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-xl shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/my-reports/${report.id}`)}
                  className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-900/50 px-2 py-0.5 rounded-md">
                        RG-{report.id.substring(0, 6).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 uppercase">
                        {report.emergencyType || report.type || 'EMERGENCY'}
                      </span>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      report.verificationStatus === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : report.verificationStatus === 'SUBMITTED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {report.verificationStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 line-clamp-2">
                    {report.text || 'Emergency report containing photo/voice evidence.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{report.locationName || 'GPS Location'}</span>
                    </div>
                    <div>{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Safety & Helpline Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-500" />
              National Emergency Helplines
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="font-medium text-slate-300">National Emergency Number</span>
                <span className="font-bold font-mono text-red-400 text-sm">112</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="font-medium text-slate-300">Police Department</span>
                <span className="font-bold font-mono text-blue-400 text-sm">100</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="font-medium text-slate-300">Fire & Rescue Department</span>
                <span className="font-bold font-mono text-amber-400 text-sm">101</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="font-medium text-slate-300">Ambulance & Medical</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">108 / 102</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="font-medium text-slate-300">Disaster Management (NDRF)</span>
                <span className="font-bold font-mono text-purple-400 text-sm">1078</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/help-safety')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              View Disaster Safety Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

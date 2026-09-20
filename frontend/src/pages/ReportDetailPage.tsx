import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  MapPin, Clock, CheckCircle2, ArrowLeft,
  Users, PhoneCall, Image as ImageIcon, AlertCircle
} from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    setIsLoading(true);
    try {
      const res = await reportsApi.getReport(id!);
      setReport(res.data.report);
    } catch (err: any) {
      console.error('Report detail error:', err);
      setError('Report not found or permission denied.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size={36} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Report Unavailable</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to load details for this emergency report.'}</p>
        <button
          onClick={() => navigate('/my-reports')}
          className="px-5 py-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
        >
          Back to My Reports
        </button>
      </div>
    );
  }

  const reportCode = `RG-${report.id.substring(0, 6).toUpperCase()}`;

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Report Submitted', desc: 'Received in system database' },
    { key: 'AI_PROCESSING', label: 'AI Extraction', desc: 'Priority & severity parsed' },
    { key: 'VERIFIED', label: 'Incident Verified', desc: 'Corroborated by responders' },
    { key: 'RESOURCE_ASSIGNED', label: 'Resource Assigned', desc: 'Emergency team dispatched' },
    { key: 'RESOLVED', label: 'Incident Resolved', desc: 'Situation secured & safe' }
  ];

  const currentStatusIndex = (() => {
    const status = report.verificationStatus;
    if (status === 'RESOLVED') return 4;
    if (status === 'RESOURCE_ASSIGNED' || status === 'IN_PROGRESS') return 3;
    if (status === 'VERIFIED') return 2;
    if (status === 'UNDER_REVIEW' || report.aiStatus === 'COMPLETED') return 1;
    return 0;
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-reports')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </button>
        <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 border border-red-900/50 px-3 py-1 rounded-full">
          {reportCode}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              {report.emergencyType || report.type || 'EMERGENCY REPORT'}
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              Incident {reportCode}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Logged on {new Date(report.createdAt).toLocaleString()}
            </div>
          </div>

          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border uppercase ${
            report.verificationStatus === 'RESOLVED'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : 'bg-amber-950 text-amber-400 border-amber-800'
          }`}>
            {report.verificationStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Dynamic Status Progress Timeline */}
        <div className="space-y-3 bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
            Response Dispatch Progress
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStatusIndex;

              return (
                <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Reported Description
          </label>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm leading-relaxed">
            {report.text || 'No text description provided.'}
          </div>
        </div>

        {/* Photo Evidence if Present */}
        {report.imageUrl && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-400" /> Photo Evidence
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 overflow-hidden max-h-96">
              <img
                src={report.imageUrl.startsWith('/') ? report.imageUrl : report.imageUrl}
                alt="Uploaded Evidence"
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Location & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Location Details
            </div>
            <div className="text-xs font-bold text-white">{report.locationName || 'GPS Location Attached'}</div>
            {report.latitude && report.longitude && (
              <div className="text-[11px] font-mono text-slate-500">
                Lat: {report.latitude.toFixed(5)}, Lng: {report.longitude.toFixed(5)}
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-red-400" /> Additional Details
            </div>
            <div className="text-xs text-slate-300">
              People Affected: <span className="font-bold text-white">{report.peopleAffected || 'N/A'}</span>
            </div>
            <div className="text-xs text-slate-300">
              Immediate Danger: <span className="font-bold text-white">{report.immediateDanger || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Emergency Helpline Box */}
        <div className="bg-gradient-to-r from-red-950/80 to-slate-950 border border-red-900/50 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Need Immediate Assistance?</div>
              <div className="text-[11px] text-slate-400">Call National Emergency Response Service directly.</div>
            </div>
          </div>
          <a
            href="tel:112"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Call 112 Now
          </a>
        </div>
      </div>
    </div>
  );
}

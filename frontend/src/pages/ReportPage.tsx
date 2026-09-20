import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import {
  AlertTriangle, MapPin, Camera, CheckCircle2,
  Upload, X, Send, Siren, ArrowLeft, ShieldAlert,
  AlertCircle, CheckCircle, Users
} from 'lucide-react';
import { LoadingSpinner } from '../components/shared';

type ReportStep = 'input' | 'processing' | 'result';

interface ProcessingStep { label: string; done: boolean; active: boolean; }

const EMERGENCY_TYPES = [
  { value: 'Road Accident', label: 'Road Accident / Vehicle Crash' },
  { value: 'Fire', label: 'Fire / Explosion' },
  { value: 'Flood', label: 'Flood / Waterlogging' },
  { value: 'Building Collapse', label: 'Building / Structural Collapse' },
  { value: 'Medical Emergency', label: 'Medical Emergency / Severe Injury' },
  { value: 'Landslide', label: 'Landslide / Rockfall' },
  { value: 'Missing Person', label: 'Missing Person in Disaster' },
  { value: 'Other', label: 'Other Disaster / Emergency' }
];

const PEOPLE_AFFECTED_OPTIONS = ['1', '2–5', '6–10', '11–20', '20+', 'Unknown'];

export default function ReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ReportStep>('input');
  const [reportText, setReportText] = useState('');
  const [emergencyType, setEmergencyType] = useState('Road Accident');
  const [peopleAffected, setPeopleAffected] = useState('2–5');
  const [immediateDanger, setImmediateDanger] = useState<'Yes' | 'No' | 'Unknown'>('Yes');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const stepsList = [
    'Registering emergency report into database',
    'Analyzing text & evidence via AI provider',
    'Checking location & spatial coordinates',
    'Running duplicate incident detection',
    'Calculating multi-factor priority score',
    'Generating response team recommendations'
  ];

  const handleGetLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, {
            headers: { 'User-Agent': 'RescueGrid-Citizen-App/1.0' }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                const parts = data.display_name.split(',').slice(0, 3).join(', ');
                setLocationName(parts);
              } else {
                setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }
            })
            .catch(() => setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`))
            .finally(() => setLocationLoading(false));
        },
        () => {
          setLocationLoading(false);
          // Default fallback coordinates (Hyderabad Gachibowli)
          setLocation({ lat: 17.4401, lng: 78.3489 });
          setLocationName('Gachibowli, Hyderabad, Telangana');
        }
      );
    } else {
      setLocationLoading(false);
      setLocation({ lat: 17.4401, lng: 78.3489 });
      setLocationName('Gachibowli, Hyderabad, Telangana');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!reportText.trim() && !imagePreview) {
      setError('Please provide a description or upload a photo of the emergency.');
      return;
    }
    setError('');
    setStep('processing');

    const stepsState = stepsList.map((label, i) => ({ label, done: false, active: i === 0 }));
    setProcessingSteps(stepsState);

    // Prepare payload
    let payload: any;
    if (imageFile) {
      const formData = new FormData();
      formData.append('text', reportText);
      formData.append('emergencyType', emergencyType);
      formData.append('peopleAffected', peopleAffected);
      formData.append('immediateDanger', immediateDanger);
      formData.append('image', imageFile);
      if (location) {
        formData.append('latitude', String(location.lat));
        formData.append('longitude', String(location.lng));
      }
      if (locationName) formData.append('locationName', locationName);
      payload = formData;
    } else {
      payload = {
        text: reportText,
        emergencyType,
        peopleAffected,
        immediateDanger,
        imageUrl: imagePreview || undefined,
        ...(location && { latitude: location.lat, longitude: location.lng }),
        ...(locationName && { locationName })
      };
    }

    // Step animations
    for (let i = 0; i < stepsList.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      setProcessingSteps(prev => prev.map((s, index) => ({
        ...s,
        done: index <= i,
        active: index === i + 1
      })));
    }

    try {
      const res = await reportsApi.submit(payload);
      setResultData(res.data);
      setStep('result');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to process report. Please check your connection and try again.');
      setStep('input');
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-950 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-900/40">
            <Siren className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">Processing Emergency Report</h2>
            <p className="text-xs text-slate-400 mt-1">Connecting with RescueGrid AI Intelligence Network</p>
          </div>

          <div className="space-y-3 text-left bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
            {processingSteps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                {s.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : s.active ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={s.done ? 'text-slate-200 font-medium' : s.active ? 'text-white font-semibold' : 'text-slate-500'}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && resultData) {
    const report = resultData.report;
    const incident = resultData.incident;
    const reportIdCode = incident?.incidentNumber || `RG-${report.id.substring(0, 6).toUpperCase()}`;

    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Success Card */}
        <div className="bg-slate-900 border border-emerald-800/60 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full font-mono font-bold">
              REPORT CONFIRMED — {reportIdCode}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Emergency Report Logged</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Your report has been successfully recorded in the RescueGrid database. Active response teams in your area have been alerted.
            </p>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xs">
            <div>
              <div className="text-slate-500 font-medium">Report Reference ID</div>
              <div className="text-white font-bold font-mono text-sm">{reportIdCode}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Status</div>
              <div className="text-emerald-400 font-semibold uppercase">{report.verificationStatus.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Emergency Category</div>
              <div className="text-slate-200 font-medium">{report.emergencyType || 'General Emergency'}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium">Location</div>
              <div className="text-slate-200 font-medium truncate">{report.locationName || 'GPS Coordinates Saved'}</div>
            </div>
          </div>

          {/* AI Result Notice */}
          {resultData.aiAnalysis && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <Siren className="w-4 h-4" /> AI Emergency Classification
              </div>
              <p className="text-xs text-slate-300">
                Severity Level: <span className="font-bold text-white">{resultData.aiAnalysis.severity || 'HIGH'}</span> |
                People Affected: <span className="font-bold text-white">{resultData.aiAnalysis.peopleAffected || '2–5'}</span>
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/my-reports')}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Track My Report
            </button>
            <button
              onClick={() => {
                setStep('input');
                setReportText('');
                setImageFile(null);
                setImagePreview(null);
                setResultData(null);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-all"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          Live Reporter
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Report an Emergency
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fill in the details below. Emergency teams will use this information to deploy immediate assistance.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Emergency Type Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Emergency Category *
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
            >
              {EMERGENCY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Describe the Situation *
            </label>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Provide exact details: What happened? How many people need help? Are there injuries or spreading hazards?"
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Options Grid: People Affected & Immediate Danger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-400" /> People Affected
              </label>
              <select
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500"
              >
                {PEOPLE_AFFECTED_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt} {opt === 'Unknown' ? '' : 'Person(s)'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Immediate Life Danger?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Yes', 'No', 'Unknown'] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setImmediateDanger(opt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      immediateDanger === opt
                        ? opt === 'Yes'
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                          : 'bg-slate-700 text-white border-slate-600'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Evidence Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-red-400" /> Photo Evidence (Optional, max 10MB)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-56 bg-slate-950">
                <img src={imagePreview} alt="Evidence Preview" className="w-full h-56 object-cover" />
                <button
                  onClick={clearImage}
                  type="button"
                  className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
              >
                <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">Click to upload photo evidence</div>
                <div className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 10MB</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* GPS Location Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Incident Location
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors shrink-0"
              >
                {locationLoading ? <LoadingSpinner size={16} /> : <MapPin className="w-4 h-4 text-red-400" />}
                {location ? 'Re-detect My GPS' : 'Detect My GPS Location'}
              </button>

              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 truncate">
                {locationName ? (
                  <span className="text-white font-medium">{locationName}</span>
                ) : location ? (
                  <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                ) : (
                  <span className="text-slate-500">Click button to attach current GPS location</span>
                )}
              </div>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="bg-slate-950/60 border border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Safety Warning:</strong> Do not put yourself or others in physical danger to take photos or collect emergency data. Move to a safe location first.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-900/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            Submit Emergency Report
          </button>
        </div>
      </div>
    </div>
  );
}

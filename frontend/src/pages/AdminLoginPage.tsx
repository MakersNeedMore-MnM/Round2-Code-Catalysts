import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/shared';
import { ShieldAlert, Siren, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await adminLogin(email, password);
      if (user.role === 'ADMIN' || user.role === 'AUTHORITY' || user.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        setError('Access denied. Account lacks administrative privileges.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Citizen Portal
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Security Header Banner */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-red-950 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-900/40">
              <Siren className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Restricted Command Center Access
              </span>
              <h1 className="text-2xl font-extrabold text-white">Admin Command Login</h1>
              <p className="text-xs text-slate-400 mt-1">
                RescueGrid Disaster Response Operations Center
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rescuegrid.gov"
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Command Access Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner size={16} /> : <ShieldAlert className="w-4 h-4" />}
              Authenticate Command Center Access
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
            Security Notice: All login attempts are audited and logged with IP verification. Max 5 failed attempts before 15-minute lock.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Eye, EyeOff, Siren, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(loginId, password);
      if (u.role === 'ADMIN' || u.role === 'AUTHORITY' || u.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check credentials or phone number.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds: Record<string, { id: string; pass: string }> = {
      admin: { id: 'admin@rescuegrid.dev', pass: 'admin123' },
      authority: { id: 'authority@rescuegrid.dev', pass: 'admin123' },
      rescuer: { id: 'rescuer@rescuegrid.dev', pass: 'user123' },
      citizen: { id: 'citizen@rescuegrid.dev', pass: 'user123' },
    };
    if (creds[role]) {
      setLoginId(creds[role].id);
      setPassword(creds[role].pass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-slate-900 p-10 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <Siren className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-lg tracking-wide">RescueGrid AI</div>
              <div className="text-slate-400 text-xs">Citizen Emergency Portal</div>
            </div>
          </div>

          <div className="space-y-5">
            {[
              'Report Emergency or Distress',
              'AI Context & Evidence Extraction',
              'Multi-Factor Priority Scoring',
              'Instant Dispatching & Tracking',
              'Real-Time Citizen Notifications'
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-red-400 font-mono font-bold">
                  {i + 1}
                </div>
                <span className="text-slate-300 text-xs font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-red-400 uppercase tracking-wider">Citizen Safety Protocol</div>
          <p>Always move to a safe location before reporting emergency data.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              RescueGrid Portal
            </div>
            <h1 className="text-white text-3xl font-extrabold">Sign In to RescueGrid</h1>
            <p className="text-slate-400 text-xs">Enter your registered email address or mobile phone number.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Email or Mobile Phone Number
              </label>
              <input
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500 transition-colors"
                placeholder="email@example.com or +91 9876543210"
                required
                id="login-id"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500"
                  placeholder="••••••••••••"
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/80 border border-red-800 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo logins */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Demo Accounts</div>
            <div className="grid grid-cols-2 gap-2">
              {['admin', 'authority', 'rescuer', 'citizen'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl capitalize border border-slate-800 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <p className="text-slate-400">
              New Citizen?{' '}
              <Link to="/register" className="text-red-400 hover:text-red-300 font-bold">
                Register here
              </Link>
            </p>

            <Link to="/admin/login" className="text-slate-400 hover:text-white flex items-center gap-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

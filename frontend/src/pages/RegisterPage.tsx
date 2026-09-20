import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Siren, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CITIZEN' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      localStorage.setItem('rg_token', res.data.token);
      localStorage.setItem('rg_user', JSON.stringify(res.data.user));
      updateUserContext(res.data.user);

      if (form.role === 'ADMIN' || form.role === 'AUTHORITY' || form.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Check if email or phone is already registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-900/40">
            <Siren className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-extrabold">Create Citizen Account</h1>
          <p className="text-slate-400 text-xs">Join RescueGrid Emergency Response Network</p>
        </div>

        {/* Form Box */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name *</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500"
              placeholder="e.g. Rahul Sharma"
              required
              id="register-name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500"
              placeholder="rahul@example.com"
              required
              id="register-email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Mobile Phone Number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500"
              placeholder="+91 9876543210"
              required
              id="register-phone"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-red-500"
              placeholder="Min 6 characters"
              required
              id="register-password"
            />
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
            id="register-submit"
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-slate-400 text-xs text-center">
          Already registered?{' '}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

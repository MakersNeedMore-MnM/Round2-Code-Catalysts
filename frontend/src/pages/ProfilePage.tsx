import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  User, Lock, Save, AlertCircle, CheckCircle2, KeyRound
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserContext } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password strength checks
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isPassValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);

    try {
      const res = await authApi.updateProfile({ name, phone, city, state });
      updateUserContext(res.data.user);
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (!isPassValid) {
      setPassMsg({ type: 'error', text: 'New password does not meet complexity requirements.' });
      return;
    }

    setPassLoading(true);

    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-red-500" />
          Account Profile & Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal emergency profile, phone contact, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-extrabold text-3xl mx-auto shadow-lg shadow-red-900/20">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-white">{user?.name}</h2>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded-full uppercase">
                {user?.role}
              </span>
            </div>

            {user?.lastLogin && (
              <div className="text-[11px] text-slate-500 pt-2">
                Last Login: {new Date(user.lastLogin).toLocaleDateString()} {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Edit Profile & Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Form 1: Edit Profile */}
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-red-400" />
                Personal Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Keep your contact phone and location updated for rescue teams.</p>
            </div>

            {profileMsg && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/80 border border-red-800 text-red-300'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-500 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mobile Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">State / Region</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Telangana"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {profileLoading ? <LoadingSpinner size={16} /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </form>

          {/* Form 2: Password Security */}
          <form onSubmit={handleChangePassword} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-red-400" />
                Change Password & Security
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Ensure your account uses a strong, complex password.</p>
            </div>

            {passMsg && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/80 border border-red-800 text-red-300'
              }`}>
                {passMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Password strength breakdown */}
              {newPassword.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-[11px]">
                  <div className="text-slate-400 font-semibold mb-1">Password Requirements:</div>
                  <div className={hasMinLen ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ Minimum 8 characters
                  </div>
                  <div className={hasUpper ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ At least one uppercase letter (A-Z)
                  </div>
                  <div className={hasLower ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ At least one lowercase letter (a-z)
                  </div>
                  <div className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ At least one number (0-9)
                  </div>
                  <div className={hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>
                    ✓ At least one special character (!@#$%^&*)
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {passLoading ? <LoadingSpinner size={16} /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

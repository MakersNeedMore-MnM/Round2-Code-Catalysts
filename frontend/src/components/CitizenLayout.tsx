import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationsApi } from '../services/api';
import { LoadingSpinner } from './shared';
import {
  Siren, AlertTriangle, LayoutDashboard, FileText, Bell,
  User, ShieldAlert, Settings, LogOut
} from 'lucide-react';

export default function CitizenLayout() {
  const { user, token, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      notificationsApi.list()
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Report Emergency', icon: AlertTriangle, highlight: true },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/help-safety', label: 'Help & Safety', icon: ShieldAlert },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/30">
              <Siren className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight tracking-wide flex items-center gap-2">
                RescueGrid
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full uppercase font-medium">
                  Citizen Portal
                </span>
              </div>
              <div className="text-slate-400 text-xs">Emergency Response Network</div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      item.highlight
                        ? 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/20'
                        : isActive
                        ? 'bg-slate-800 text-red-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.role?.toLowerCase()}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-3 py-2 z-40 flex justify-around items-center">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-red-400 font-semibold' : 'text-slate-400'}`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Home
        </NavLink>
        <NavLink
          to="/report"
          className="flex flex-col items-center gap-1 text-[11px] text-white"
        >
          <div className="bg-red-600 p-2 rounded-full -mt-5 shadow-lg shadow-red-900/50">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          Report
        </NavLink>
        <NavLink
          to="/my-reports"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-red-400 font-semibold' : 'text-slate-400'}`
          }
        >
          <FileText className="w-5 h-5" />
          Reports
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-red-400 font-semibold' : 'text-slate-400'}`
          }
        >
          <User className="w-5 h-5" />
          Profile
        </NavLink>
      </div>
    </div>
  );
}

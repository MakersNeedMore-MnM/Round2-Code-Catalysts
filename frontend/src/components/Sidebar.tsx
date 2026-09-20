import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import {
  Shield, MapPin, AlertTriangle, Users, BarChart2,
  Settings, LogOut, Radio, Siren, Bell
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: Shield, label: 'Command Center' },
  { to: '/admin/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/admin/map', icon: MapPin, label: 'Live Map' },
  { to: '/admin/resources', icon: Users, label: 'Resources' },
  { to: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 bg-navy-950 text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Siren size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">RescueGrid</div>
            <div className="text-navy-400 text-xs">AI Command Center</div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div className="px-4 py-2 border-b border-navy-800">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
          <span className={connected ? 'text-emerald-400' : 'text-red-400'}>
            {connected ? 'Live Feed Active' : 'Connecting...'}
          </span>
          <Radio size={10} className={connected ? 'text-emerald-400 ml-auto' : 'text-red-400 ml-auto'} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-navy-700 text-white font-medium'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}

        <div className="pt-2 border-t border-navy-800 mt-2">
          <NavLink
            to="/report"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm bg-red-700 hover:bg-red-600 text-white font-medium transition-colors"
          >
            <AlertTriangle size={16} />
            Report Emergency
          </NavLink>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-navy-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-navy-700 rounded-full flex items-center justify-center text-xs font-bold text-navy-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-navy-400 truncate capitalize">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-navy-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

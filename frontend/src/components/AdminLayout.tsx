import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './shared';

export default function AdminLayout() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Strict Server & Frontend Role Enforcement
  if (user && user.role !== 'ADMIN' && user.role !== 'AUTHORITY' && user.role !== 'RESCUER') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-950 border border-red-800 rounded-full flex items-center justify-center mx-auto text-red-500 font-bold text-2xl">
            403
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400">
            You do not have administrative privileges to access the RescueGrid AI Command Center.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors"
          >
            Return to Citizen Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}

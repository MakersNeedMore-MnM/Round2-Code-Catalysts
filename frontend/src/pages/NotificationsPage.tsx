import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  Bell, CheckCheck, Clock, ArrowLeft
} from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-red-500" />
            Notifications & Dispatch Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status updates from emergency teams dispatched to your reports.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <LoadingSpinner size={36} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No notifications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When emergency response teams update the status of your reported incidents, alert notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(item => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all space-y-2 ${
                !item.isRead
                  ? 'border-red-800/60 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="text-[11px] text-slate-400 hover:text-white underline font-medium"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.message}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(item.createdAt).toLocaleString()}
                </div>

                {item.reportId && (
                  <button
                    onClick={() => navigate(`/my-reports/${item.reportId}`)}
                    className="text-red-400 hover:text-red-300 font-semibold"
                  >
                    View Associated Report →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

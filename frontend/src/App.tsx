import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SocketProvider } from './hooks/useSocket';
import CitizenLayout from './components/CitizenLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Citizen Pages
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import HelpSafetyPage from './pages/HelpSafetyPage';

// Admin Command Center Pages
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import MapPage from './pages/MapPage';
import ResourcesPage from './pages/ResourcesPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Citizen Portal Routes (Default Layout) */}
            <Route element={<CitizenLayout />}>
              <Route path="/dashboard" element={<CitizenDashboardPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/my-reports/:id" element={<ReportDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/help-safety" element={<HelpSafetyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Command Center Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/incidents" replace />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/incidents" element={<IncidentsPage />} />
              <Route path="/admin/incidents/:id" element={<IncidentDetailPage />} />
              <Route path="/admin/map" element={<MapPage />} />
              <Route path="/admin/resources" element={<ResourcesPage />} />
              <Route path="/admin/alerts" element={<AlertsPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

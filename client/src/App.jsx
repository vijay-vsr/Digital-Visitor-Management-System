import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterVisitor from './pages/RegisterVisitor';
import CheckInPage from './pages/CheckInPage';
import CheckOutPage from './pages/CheckOutPage';
import VisitorsPage from './pages/VisitorsPage';
import EmployeesPage from './pages/EmployeesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PublicKioskPage from './pages/PublicKioskPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Public Kiosk Mode */}
            <Route element={<PublicLayout />}>
              <Route path="/kiosk" element={<PublicKioskPage />} />
            </Route>

            {/* Protected Portal Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/register" element={<RegisterVisitor />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/check-out" element={<CheckOutPage />} />

              {/* Admin-only routes */}
              <Route
                path="/employees"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EmployeesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'security']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

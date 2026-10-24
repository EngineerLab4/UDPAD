import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailsPage } from './pages/SchemeDetailsPage';
import { ApplyPage } from './pages/ApplyPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { BenefitHistoryPage } from './pages/BenefitHistoryPage';
import { VerificationAlertsPage } from './pages/VerificationAlertsPage';
import { CorrectionsPage } from './pages/CorrectionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { HelpPage } from './pages/HelpPage';
import { OfficerDashboardPage } from './pages/OfficerDashboardPage';

// Scroll to hash element helper to ensure all anchor links work seamlessly across pages
function ScrollToHashElement() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToHashElement />
        <Routes>
          {/* Public Landing & Accessible Directory */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:schemeId" element={<SchemeDetailsPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Guest Only Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Citizen Services Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <RecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:applicationId"
            element={
              <ProtectedRoute>
                <ApplicationDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/benefit-history"
            element={
              <ProtectedRoute>
                <BenefitHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verification-alerts"
            element={
              <ProtectedRoute>
                <VerificationAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/corrections"
            element={
              <ProtectedRoute>
                <CorrectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer"
            element={
              <ProtectedRoute>
                <OfficerDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

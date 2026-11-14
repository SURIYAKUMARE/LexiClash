import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';
import { DashboardOverview } from './pages/DashboardOverview';
import { Profile } from './pages/Profile';
import { SkillAnalysis } from './pages/SkillAnalysis';
import { SkillDiagnostics } from './pages/SkillDiagnostics';
import { CareerExplorer } from './pages/CareerExplorer';
import { LearningRoadmap } from './pages/LearningRoadmap';
import { ResourceLibrary } from './pages/ResourceLibrary';
import { Assessments } from './pages/Assessments';
import { AIMentor } from './pages/AIMentor';
import { AgentActivityMonitor } from './pages/AgentActivityMonitor';
import { Projects } from './pages/Projects';
import { ProgressAnalytics } from './pages/ProgressAnalytics';
import { Certificates } from './pages/Certificates';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-charcoal-muted font-medium">Validating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile && !profile.completedOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (profile && !profile.completedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected Main Application Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="profile" element={<Profile />} />
            <Route path="diagnostics" element={<SkillDiagnostics />} />
            <Route path="skills" element={<SkillDiagnostics />} />
            <Route path="careers" element={<CareerExplorer />} />
            <Route path="roadmap" element={<LearningRoadmap />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="mentor" element={<AIMentor />} />
            <Route path="agents" element={<AgentActivityMonitor />} />
            <Route path="projects" element={<Projects />} />
            <Route path="analytics" element={<ProgressAnalytics />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;

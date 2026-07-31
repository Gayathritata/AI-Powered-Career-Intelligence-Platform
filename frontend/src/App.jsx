// App.jsx
// Root component — sets up routing and wraps with AuthProvider.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';

// Lazy-loaded pages (will be added in later modules)
const Upload  = React.lazy(() => import('./pages/Upload'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Results = React.lazy(() => import('./pages/Results'));

const Fallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  </div>
);

const App = () => {
  React.useEffect(() => {
    // Check if website is opened in a fresh session
    const isSessionActive = sessionStorage.getItem('careercast_session_active');
    if (!isSessionActive) {
      // Purge any stale stored resume data from previous sessions
      localStorage.removeItem('careercast_parsed_resume');
      localStorage.removeItem('careercast_active_analysis');
      sessionStorage.removeItem('careercast_parsed_resume');
      sessionStorage.removeItem('careercast_active_analysis');
      sessionStorage.setItem('careercast_session_active', 'true');
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<Fallback />}>
          <Routes>
            {/* Public routes redirect straight to Dashboard */}
            <Route path="/login"    element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import Login from './pages/LoginPage';
import DashboardRedirect from './pages/DashboardRedirect';
import GuestReportPage from './pages/GuestReportPage';
import CitizenDashboard from './pages/CitizenDashboard';
import OperadorDashboard from './pages/OperadorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';

const GOOGLE_CLIENT_ID = '656508782153-d7ocu1qadoiif0q41nor8scsn42101ha.apps.googleusercontent.com';

function ProtectedRoute({ element, requiredRole }) {
  const userStr = localStorage.getItem('usuario');
  if (!userStr) return <Navigate to="/login" />;
  const user = JSON.parse(userStr);
  if (user.rol !== requiredRole) return <Navigate to="/" />;
  return element;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/citizen-dashboard" element={<ProtectedRoute element={<CitizenDashboard />} requiredRole={1} />} />
          <Route path="/operador-dashboard" element={<ProtectedRoute element={<OperadorDashboard />} requiredRole={2} />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRole={3} />} />
          <Route path="/supervisor-dashboard" element={<ProtectedRoute element={<SupervisorDashboard />} requiredRole={4} />} />
          <Route path="/reportar-invitado" element={<GuestReportPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

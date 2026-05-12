import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
import GuestReportPage from './pages/GuestReportPage';
import CitizenDashboard from './pages/CitizenDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
        <Route path="/reportar-invitado" element={<GuestReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;

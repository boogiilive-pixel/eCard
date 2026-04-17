/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { AuroraBackground } from './components/AuroraBackground';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading, isAdmin } = useFirebase();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-aurora-blue/20 animate-ping" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size="md" className="animate-pulse" />
        </div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/:username" element={<ProfilePage />} />
      
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly>
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      {!isDashboard && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Layout />
      </Router>
    </FirebaseProvider>
  );
}


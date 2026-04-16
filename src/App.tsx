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
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading, isAdmin } = useFirebase();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-aurora-violet/20 animate-ping" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-aurora-violet font-serif font-bold animate-pulse">e</span>
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
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
    </AnimatePresence>
  );
}

function Layout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  
  return (
    <>
      <AuroraBackground />
      {!isDashboard && <Navbar />}
      <AppRoutes />
    </>
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


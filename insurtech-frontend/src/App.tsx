import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { ProtectedRoute } from './presentation/routes/ProtectedRoute';
import { MainLayout } from './presentation/components/layout/MainLayout';
import { LoginPage } from './presentation/pages/auth/LoginPage';
import { DashboardPage } from './presentation/pages/dashboard/DashboardPage';
import { AseguradosPage } from './presentation/pages/asegurados/AseguradosPage';
import { PolizasPage } from './presentation/pages/polizas/PolizasPage';
import { SiniestrosPage } from './presentation/pages/siniestros/SiniestrosPage';
import { UsuariosPage } from './presentation/pages/usuarios/UsuariosPage';
import { PortalPage } from './presentation/pages/portal/PortalPage';
import { PrimasPage } from './presentation/pages/primas/PrimasPage';

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.rol === 'ROLE_CUSTOMER') {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />
            {/* Internal staff routes */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="asegurados" element={<AseguradosPage />} />
            <Route path="polizas" element={<PolizasPage />} />
            <Route path="siniestros" element={<SiniestrosPage />} />
            <Route path="primas" element={<PrimasPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            {/* Customer portal */}
            <Route path="portal" element={<PortalPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
      }} />
    </AuthProvider>
  );
}

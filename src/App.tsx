import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Locations } from './pages/Locations';
import { Construction } from './pages/Construction';
import { Procurement } from './pages/Procurement';
import { HR } from './pages/HR';
import { Finance } from './pages/Finance';
import { Users } from './pages/Users';
import { Investors } from './pages/Investors';
import { MainLayout } from './components/Layout/MainLayout';
import { Workflow } from './pages/Workflow';
import { SppgGallery } from './pages/SppgGallery';
import { SystemGuide } from './pages/SystemGuide';
import { BagiHasil } from './pages/BagiHasil';

type PageType = 'dashboard' | 'locations' | 'construction' | 'procurement' | 'hr' | 'finance' | 'users' | 'workflow' | 'investors' | 'sppg-gallery' | 'system-guide' | 'bagi-hasil';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Map path to PageType for breadcrumbs and sidebar active state
  const getCurrentPage = (): PageType => {
    const path = location.pathname.substring(1);
    if (!path || path === '') return 'dashboard';
    return path as PageType;
  };

  const currentPage = getCurrentPage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Workflow is a public page based on original logic
  if (currentPage === 'workflow') {
     return <Workflow />;
  }

  if (!user) {
    return <Login />;
  }

  const getBreadcrumbs = (): string[] => {
    const breadcrumbMap: Record<PageType, string[]> = {
      dashboard: ['Dashboard'],
      locations: ['Dashboard', 'Peta Lokasi & Distribusi'],
      construction: ['Dashboard', 'Pengawasan Pembangunan'],
      procurement: ['Dashboard', 'Procurement Management'],
      hr: ['Dashboard', 'Manajemen SDM'],
      finance: ['Dashboard', 'Financial Management'],
      users: ['Dashboard', 'User Management'],
      workflow: ['Dashboard', 'Alur Kerja Sistem'],
      investors: ['Dashboard', 'Monitoring Investor'],
      'sppg-gallery': ['Dashboard', 'Galeri Foto SPPG'],
      'system-guide': ['Dashboard', 'Panduan Sistem'],
      'bagi-hasil': ['Dashboard', 'Bagi Hasil & Manajemen Sewa'],
    };
    return breadcrumbMap[currentPage] || ['Dashboard'];
  };

  return (
    <MainLayout
      breadcrumbs={getBreadcrumbs()}
    >
      <Routes>
        <Route path="/" element={<Dashboard onNavigate={(page: string) => navigate(page === 'dashboard' ? '/' : `/${page}`)} />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        
        {/* Protected Routes based on Roles */}
        {(user.role === 'Super Admin' || user.role === 'Manager' || user.role === 'PIC Dapur' || user.role === 'Investor') && (
          <>
            <Route path="/locations" element={<Locations />} />
            <Route path="/construction" element={user.role === 'Investor' ? <Navigate to="/" replace /> : <Construction />} />
            <Route path="/investors" element={<Investors />} />
          </>
        )}

        {(user.role === 'Super Admin' || user.role === 'Procurement' || user.role === 'Operator Koperasi') && (
          <Route path="/procurement" element={<Procurement />} />
        )}

        {(user.role === 'Super Admin' || user.role === 'HRD') && (
          <Route path="/hr" element={<HR />} />
        )}

        {(user.role === 'Super Admin' || user.role === 'Finance' || user.role === 'PIC Dapur' || user.role === 'Investor') && (
          <Route path="/finance" element={<Finance />} />
        )}

        {user.role === 'Super Admin' && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/bagi-hasil" element={<BagiHasil />} />
          </>
        )}

        {(user.role === 'Super Admin' || user.role === 'Manager' || user.role === 'Staff' || user.role === 'PIC Dapur') && (
          <Route path="/sppg-gallery" element={<SppgGallery />} />
        )}

        <Route path="/panduan-penggunaan" element={<SystemGuide />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

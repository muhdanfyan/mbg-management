import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Locations } from './pages/Locations';
import { Construction } from './pages/Construction';
import { Procurement } from './pages/Procurement';
import { HR } from './pages/HR';
import { Finance } from './pages/Finance';
import { MainLayout } from './components/Layout/MainLayout';

type PageType = 'dashboard' | 'locations' | 'construction' | 'procurement' | 'hr' | 'finance';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

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
    };
    return breadcrumbMap[currentPage];
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'locations':
        return <Locations />;
      case 'construction':
        return <Construction />;
      case 'procurement':
        return <Procurement />;
      case 'hr':
        return <HR />;
      case 'finance':
        return <Finance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page as PageType)}
      breadcrumbs={getBreadcrumbs()}
    >
      {renderPage()}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChevronRight } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  breadcrumbs = ['Dashboard']
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-[#F8FAF9]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-[50]">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  <span
                    onClick={() => index < breadcrumbs.length - 1 && navigate('/')}
                    className={`tracking-wide font-semibold ${
                      index === breadcrumbs.length - 1
                        ? 'text-[#1A4D43] font-bold'
                        : 'text-gray-400 hover:text-[#2BBF9D] transition-colors cursor-pointer'
                    }`}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-4 max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

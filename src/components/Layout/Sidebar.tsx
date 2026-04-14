import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Building2,
  ShoppingCart,
  ImageIcon,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  HandCoins
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'Investor', 'PIC Dapur'], path: '/' },
  { id: 'locations', label: 'Peta Lokasi', icon: Map, roles: ['Super Admin', 'Manager', 'PIC Dapur', 'Investor'], path: '/locations' },
  { id: 'construction', label: 'Pengawasan', icon: Building2, roles: ['Super Admin', 'Manager'], path: '/construction' },
  { id: 'sppg-gallery', label: 'Galeri Foto', icon: ImageIcon, roles: ['Super Admin', 'Manager', 'Staff'], path: '/sppg-gallery' },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, roles: ['Super Admin', 'Procurement', 'Operator Koperasi'], path: '/procurement' },
  { id: 'hr', label: 'Manajemen SDM', icon: Users, roles: ['Super Admin', 'HRD'], path: '/hr' },
  { id: 'finance', label: 'Keuangan', icon: DollarSign, roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Investor'], path: '/finance' },
  { id: 'bagi-hasil', label: 'Bagi Hasil', icon: HandCoins, roles: ['Super Admin'], path: '/bagi-hasil' },
  { id: 'investors', label: 'Monitoring Investor', icon: Users, roles: ['Super Admin', 'Manager', 'Finance', 'Investor'], path: '/investors' },
  { id: 'users', label: 'Manajemen User', icon: Shield, roles: ['Super Admin'], path: '/users' },
  { id: 'system-guide', label: 'Panduan Sistem', icon: BookOpen, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'PIC Dapur', 'Operator Koperasi'], path: '/panduan-penggunaan' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(profile?.role || '')
  );

  return (
    <div
      className={`bg-[#1A4D43] transition-all duration-300 flex flex-col shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-sm">
              <img src="/logo-wahdah.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-tight">Wahdah MBG</h1>
              <p className="text-[10px] text-[#2BBF9D] uppercase font-black tracking-widest">Management</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-white/60" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white/60" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-[#2BBF9D] text-white shadow-lg shadow-[#2BBF9D]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/60'}`} />
              {!collapsed && (
                <span className={`font-semibold text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

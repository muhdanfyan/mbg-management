import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  path: string;
  children?: { label: string; path: string; roles: string[] }[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'Investor', 'PIC Dapur'], path: '/' },
  { id: 'locations', label: 'Peta Lokasi', icon: Map, roles: ['Super Admin', 'Manager', 'PIC Dapur', 'Investor'], path: '/locations' },
  { id: 'construction', label: 'Pengawasan', icon: Building2, roles: ['Super Admin', 'Manager'], path: '/construction' },
  { id: 'sppg-gallery', label: 'Galeri Foto', icon: ImageIcon, roles: ['Super Admin', 'Manager', 'Staff', 'PIC Dapur'], path: '/sppg-gallery' },
  { 
    id: 'finance', 
    label: 'Keuangan', 
    icon: DollarSign, 
    roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Investor', 'Operator Koperasi'], 
    path: '/finance',
    children: [
      { label: 'Investasi', path: '/finance?tab=investasi', roles: ['Super Admin', 'Finance', 'Investor', 'Operator Koperasi'] },
      { label: 'Sewa Dapur', path: '/finance?tab=sewa', roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Operator Koperasi'] },
      { label: 'Selisih Bahan', path: '/finance?tab=margin', roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Operator Koperasi'] },
      { label: 'Operasional', path: '/finance?tab=operasional', roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Operator Koperasi'] },
    ]
  },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, roles: ['Super Admin', 'Procurement', 'Operator Koperasi'], path: '/procurement' },
  { id: 'hr', label: 'Manajemen SDM', icon: Users, roles: ['Super Admin', 'HRD'], path: '/hr' },
  { id: 'investors', label: 'Monitoring Investor', icon: Users, roles: ['Super Admin', 'Manager', 'Finance', 'Investor'], path: '/investors' },
  { id: 'users', label: 'Manajemen User', icon: Shield, roles: ['Super Admin'], path: '/users' },
  { id: 'system-guide', label: 'Panduan Sistem', icon: BookOpen, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'PIC Dapur', 'Operator Koperasi'], path: '/panduan-penggunaan' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['finance']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

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
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
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
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-white/60" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white/60" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isBaseActive = location.pathname === item.path;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus.includes(item.id);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    toggleMenu(item.id);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isBaseActive && !hasChildren
                    ? 'bg-[#2BBF9D] text-white shadow-lg shadow-[#2BBF9D]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.label : ''}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isBaseActive ? 'text-white' : 'text-white/60'}`} />
                  {!collapsed && (
                    <span className={`font-semibold text-sm tracking-wide ${isBaseActive ? 'text-white' : ''}`}>{item.label}</span>
                  )}
                </div>
                {!collapsed && hasChildren && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {!collapsed && hasChildren && isOpen && (
                <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {item.children!.filter(child => child.roles.includes(profile?.role || '')).map((child) => (
                    <button
                      key={child.path}
                      onClick={() => navigate(child.path)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        location.pathname + location.search === child.path
                          ? 'text-[#2BBF9D] bg-white/5'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

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
  ChevronDown,
  ChevronUp,
  Shield,
  BookOpen,
  HandCoins,
  TrendingUp,
  Receipt,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  path?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'Investor', 'PIC Dapur'], path: '/' },
  { id: 'locations', label: 'Peta Lokasi', icon: Map, roles: ['Super Admin', 'Manager'], path: '/locations' },
  { id: 'construction', label: 'Pengawasan Pembangunan', icon: Building2, roles: ['Super Admin', 'Manager'], path: '/construction' },
  { id: 'sppg-gallery', label: 'Galeri Foto', icon: ImageIcon, roles: ['Super Admin', 'Manager', 'Staff'], path: '/sppg-gallery' },
  { id: 'procurement', label: 'Pengadaan', icon: ShoppingCart, roles: ['Super Admin', 'Procurement', 'Operator Koperasi'], path: '/procurement' },
  { id: 'hr', label: 'Manajemen SDM', icon: Users, roles: ['Super Admin', 'HRD'], path: '/hr' },
  { 
    id: 'finance-group', 
    label: 'Keuangan', 
    icon: DollarSign, 
    roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Investor'],
    children: [
      { id: 'investors', label: 'Investasi', icon: Wallet, roles: ['Super Admin', 'Manager', 'Finance', 'Investor'], path: '/investors' },
      { id: 'sewa-dapur', label: 'Sewa Dapur', icon: HandCoins, roles: ['Super Admin', 'Finance', 'PIC Dapur', 'Investor'], path: '/finance?tab=transactions' },
      { id: 'selisih', label: 'Selisih Bahan Baku', icon: TrendingUp, roles: ['Super Admin', 'Finance', 'Operator Koperasi'], path: '/bagi-hasil' },
      { id: 'operasional', label: 'Operasional', icon: Receipt, roles: ['Super Admin', 'Finance', 'PIC Dapur'], path: '/finance?tab=expenses' },
    ]
  },
  { id: 'users', label: 'Manajemen Pengguna', icon: Shield, roles: ['Super Admin'], path: '/users' },
  { id: 'system-guide', label: 'Panduan Sistem', icon: BookOpen, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff', 'PIC Dapur', 'Operator Koperasi'], path: '/panduan-penggunaan' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const hasRole = (roles: string[]) => roles.includes(profile?.role || '');

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasRole(item.roles))
      .map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined
      }))
      .filter(item => !item.children || item.children.length > 0);
  };

  const filteredMenuItems = filterItems(menuItems);

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path || (item.path?.includes('?') && location.pathname + location.search === item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              setOpenMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
            isActive
              ? 'bg-[#1E8289] text-white shadow-lg shadow-[#1E8289]/20'
              : isChild 
                ? 'text-white/50 hover:text-white hover:bg-white/5 mx-2 w-[calc(100%-1rem)] py-2'
                : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
          title={collapsed ? item.label : ''}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/60'}`} />
            {!collapsed && (
              <span className={`font-semibold text-sm tracking-wide transition-opacity duration-300 whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            )}
          </div>
          
          {hasChildren && !collapsed && (
            <div className="flex-shrink-0">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </button>

        {hasChildren && isOpen && !collapsed && (
          <div className="mt-1 space-y-1 ml-4 border-l border-white/10 pl-2">
            {item.children?.map(child => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-[#164E4D] transition-all duration-300 flex flex-col shadow-xl flex-shrink-0 h-screen sticky top-0 ${
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
              <p className="text-[10px] text-[#1E8289] uppercase font-black tracking-widest">Management</p>
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

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
};

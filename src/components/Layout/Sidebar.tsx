import React from 'react';
import {
  LayoutDashboard,
  Map,
  Building2,
  ShoppingCart,
  Users,
  DollarSign,
  ChefHat,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Procurement', 'Staff'] },
  { id: 'locations', label: 'Peta Lokasi', icon: Map, roles: ['Super Admin', 'Manager'] },
  { id: 'construction', label: 'Pengawasan', icon: Building2, roles: ['Super Admin', 'Manager'] },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, roles: ['Super Admin', 'Procurement'] },
  { id: 'hr', label: 'Manajemen SDM', icon: Users, roles: ['Super Admin', 'HRD'] },
  { id: 'finance', label: 'Keuangan', icon: DollarSign, roles: ['Super Admin', 'Finance'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, currentPage, onNavigate }) => {
  const { profile } = useAuth();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(profile?.role || '')
  );

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">MBG Kitchen</h1>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

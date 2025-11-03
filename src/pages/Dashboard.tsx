import React from 'react';
import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const stats = [
  {
    label: 'Total Dapur',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Building2,
    color: 'blue'
  },
  {
    label: 'Progress Pembangunan',
    value: '68%',
    change: '+5%',
    trend: 'up',
    icon: TrendingUp,
    color: 'green'
  },
  {
    label: 'Total Karyawan',
    value: '156',
    change: '+8',
    trend: 'up',
    icon: Users,
    color: 'orange'
  },
  {
    label: 'Cash Flow',
    value: 'Rp 2.4M',
    change: '-3%',
    trend: 'down',
    icon: DollarSign,
    color: 'purple'
  }
];

const recentActivities = [
  {
    id: 1,
    action: 'Purchase Order PO-2024-089 approved',
    user: 'Finance Manager',
    time: '5 minutes ago',
    type: 'procurement'
  },
  {
    id: 2,
    action: 'Construction progress updated for Dapur Jakarta Selatan',
    user: 'Project Manager',
    time: '1 hour ago',
    type: 'construction'
  },
  {
    id: 3,
    action: 'New employee onboarded - Ahmad Rizki',
    user: 'HRD Team',
    time: '2 hours ago',
    type: 'hr'
  },
  {
    id: 4,
    action: 'Expense report submitted - Kitchen Operations',
    user: 'Finance Team',
    time: '3 hours ago',
    type: 'finance'
  },
  {
    id: 5,
    action: 'Equipment delivery completed - Surabaya Kitchen',
    user: 'Procurement Team',
    time: '5 hours ago',
    type: 'procurement'
  }
];

const quickActions = [
  { label: 'Tambah Dapur', color: 'blue' },
  { label: 'Buat PO Baru', color: 'green' },
  { label: 'Input Progress', color: 'orange' },
  { label: 'Lihat Laporan', color: 'purple' }
];

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getButtonColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      purple: 'bg-purple-600 hover:bg-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of MBG Kitchen Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';

          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <p className="text-sm text-gray-600 mt-1">Latest system updates and actions</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600">{activity.user}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    activity.type === 'procurement' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'construction' ? 'bg-orange-100 text-orange-700' :
                    activity.type === 'hr' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Frequently used actions</p>
          </div>
          <div className="p-6 space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`w-full py-3 px-4 text-white rounded-lg font-medium transition-colors ${getButtonColorClasses(action.color)}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-green-50">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Logged in as
              </p>
              <p className="text-lg font-bold text-blue-600">
                {profile?.role}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {profile?.department || 'System Access'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

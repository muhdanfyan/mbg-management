import React from 'react';
import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Plus, LayoutGrid, Calendar, MapPin, Activity, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Sub-component to fit map bounds to all markers
const AutoFitBounds: React.FC<{ kitchensList: any[] }> = ({ kitchensList }) => {
  const map = useMap();
  React.useEffect(() => {
    if (kitchensList.length > 0) {
      const validKitchens = kitchensList.filter(k => k.lat && k.lng);
      if (validKitchens.length > 0) {
        const bounds = L.latLngBounds(validKitchens.map(k => [k.lat, k.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [kitchensList, map]);
  return null;
};

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [summary, setSummary] = React.useState<any>(null);
  const [kitchens, setKitchens] = React.useState<any[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, kitchensData, activitiesData] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/kitchens'),
          api.get('/progress-updates')
        ]);
        setSummary(summaryData);
        setKitchens(kitchensData);
        // Take latest 5 activities
        setActivities(activitiesData.sort((a: any, b: any) => 
          new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
        ).slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Dapur',
      value: summary?.total_dapur?.toString() || '0',
      change: '+1',
      trend: 'up',
      icon: Building2,
      color: 'mint'
    },
    {
      label: 'Progress Pembangunan',
      value: `${Math.round(summary?.construction_progress || 0)}%`,
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      label: 'Total Karyawan',
      value: summary?.total_employees?.toString() || '0',
      change: '+2',
      trend: 'up',
      icon: Users,
      color: 'mint'
    },
    {
      label: 'Cash Flow',
      value: `Rp ${(summary?.cash_flow || 0).toLocaleString()}`,
      change: '+10%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald'
    }
  ];

  const quickActions = [
    { label: 'Kelola Dapur', icon: LayoutGrid, action: 'locations' },
    { label: 'Input Progress', icon: Plus, action: 'construction' },
    { label: 'Laporan Keuangan', icon: Calendar, action: 'finance' },
    { label: 'Panduan Finansial', icon: PieChart, action: 'external-finance-report' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BBF9D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D43] tracking-tight">Selamat Datang, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Berikut adalah ringkasan sistem manajemen Wahdah MBG hari ini.
          </p>
        </div>
        <div className="hidden md:flex gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                if (action.action === 'external-finance-report') {
                  window.open('file:///Users/pondokit/Herd/mbg-management/out/pemahaman_alur_keuangan_mbg.html', '_blank');
                } else {
                  onNavigate?.(action.action);
                }
              }}
              className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1A4D43] border border-gray-100 hover:border-[#2BBF9D] hover:text-[#2BBF9D] transition-all shadow-sm active:scale-95"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';

          return (
            <div
              key={stat.label}
              className="glass-card p-6 group hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${
                  stat.color === 'mint' ? 'bg-[#E2F8F3] text-[#2BBF9D]' : 'bg-[#1A4D43]/5 text-[#1A4D43]'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#1A4D43] tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Widget - Repositioned to Top */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/30">
          <div>
            <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2BBF9D]" />
              Sebaran Dapur MBG
            </h2>
            <p className="text-sm text-gray-500 font-medium tracking-tight">Monitoring lokasi operasional real-time</p>
          </div>
          <button 
            onClick={() => onNavigate?.('locations')}
            className="text-xs font-black text-[#2BBF9D] uppercase tracking-widest hover:underline"
          >
            Detail Peta
          </button>
        </div>
        <div className="h-[450px] relative z-0">
            <MapContainer 
              center={[-5.1476, 119.4327]} 
              zoom={12} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <AutoFitBounds kitchensList={kitchens} />
              {kitchens.filter(k => k.lat && k.lng).map(kitchen => (
                <Marker key={kitchen.id} position={[kitchen.lat, kitchen.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-[#1A4D43]">{kitchen.name}</h4>
                      <p className="text-xs text-gray-500">{kitchen.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
        </div>
      </div>

      {/* Informative Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 group overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2BBF9D]" />
                Performa Keuangan
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Estimasi Pendapatan vs Pengeluaran</p>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2">
            {[65, 45, 80, 55, 90, 70, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <div className="w-full relative h-[200px] flex items-end">
                   <div 
                     className="w-full bg-[#1A4D43]/5 rounded-t-lg transition-all duration-500 group-hover/bar:bg-[#2BBF9D]/10" 
                     style={{ height: '100%' }}
                   ></div>
                   <div 
                     className="absolute bottom-0 w-full bg-gradient-to-t from-[#2BBF9D] to-[#2BBF9D]/70 rounded-t-lg shadow-lg shadow-[#2BBF9D]/20 transition-all duration-700 group-hover/bar:brightness-110" 
                     style={{ height: `${val}%` }}
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A4D43] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                        {val}M
                      </div>
                   </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#2BBF9D]" />
                Progress Pembangunan
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Status Konstruksi Seluruh Dapur</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full text-[#2BBF9D] bg-[#E2F8F3]">
                    In Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black inline-block text-[#1A4D43]">
                    {Math.round(summary?.construction_progress || 0)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-[#1A4D43]/5 p-0.5 border border-white">
                <div 
                  style={{ width: `${summary?.construction_progress || 0}%` }} 
                  className="shadow-lg shadow-[#2BBF9D]/20 flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-full transition-all duration-1000"
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-[#E2F8F3]/50 border border-white/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Dapur Selesai</p>
                  <p className="text-2xl font-black text-[#1A4D43]">{Math.floor((summary?.construction_progress || 0) / 10)}</p>
               </div>
               <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-white/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Target Tahunan</p>
                  <p className="text-2xl font-black text-[#1A4D43]">50</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Activities Feed */}
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/30">
              <div>
                <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2BBF9D]" />
                  Aktivitas Terbaru
                </h2>
                <p className="text-sm text-gray-500 font-medium">Monitoring operasional sistem</p>
              </div>
              <button 
                onClick={() => onNavigate?.('construction')}
                className="text-xs font-black text-[#2BBF9D] hover:underline uppercase tracking-widest"
              >
                Lihat Semua
              </button>
            </div>
            <div className="p-8">
              <div className="space-y-8">
                {activities.length > 0 ? activities.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex gap-6 relative group">
                    {idx < activities.length - 1 && <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-gray-100"></div>}
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#F8FAF9] rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#2BBF9D] transition-colors shadow-sm">
                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-[#2BBF9D]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#1A4D43] text-base">{activity.title || 'Pembaruan Progress'}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {new Date(activity.created_at || activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 font-medium leading-relaxed">
                        {activity.note || activity.description || 'Ada pembaruan data pada sistem.'}
                      </p>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-[#E2F8F3] text-[#2BBF9D] rounded-full text-[10px] font-black uppercase tracking-tighter">
                           {activity.source || 'Operational'}
                         </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-gray-400 font-medium">Belum ada aktivitas terbaru.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white overflow-hidden relative shadow-2xl shadow-[#2BBF9D]/20">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">User Profile</p>
              <h3 className="text-2xl font-black mb-1">{profile?.full_name}</h3>
              <p className="text-white/80 font-bold mb-8 opacity-80">{profile?.role}</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-md">
                    <span className="text-xs font-bold">Akses Departemen</span>
                    <span className="text-xs font-black px-2 py-0.5 bg-white/20 rounded-lg">{profile?.department || 'ALL'}</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-md">
                    <span className="text-xs font-bold">Sesi Status</span>
                    <span className="flex items-center gap-1.5 text-xs font-black">
                       <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                       Aktif
                    </span>
                 </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-[#1A4D43] mb-6">Informasi Sistem</h2>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">V</div>
                  <div>
                    <p className="text-sm font-bold text-[#1A4D43]">Versi Dashboard</p>
                    <p className="text-xs text-gray-500">v2.4.0 (TeamHub Edition)</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">S</div>
                  <div>
                    <p className="text-sm font-bold text-[#1A4D43]">Status Server</p>
                    <p className="text-xs text-gray-500">Normal (Latency: 24ms)</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

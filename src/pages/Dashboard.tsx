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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'finance' | 'construction' | 'logistics'>('overview');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isRestricted = profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi' || profile?.role === 'Investor';
        const params = isRestricted && profile?.kitchen_id ? { kitchen_id: profile.kitchen_id } : undefined;

        const [summaryData, kitchensData, activitiesData, financeData, logisticsData] = await Promise.all([
          api.get('/dashboard/summary', params).catch(() => ({})),
          api.get('/kitchens', params).catch(() => []),
          api.get('/progress-updates', params).catch(() => []),
          api.get('/financial-records', params).catch(() => []),
          api.get('/purchase-orders', params).catch(() => [])
        ]);
        
        setSummary(summaryData || {});
        setKitchens(Array.isArray(kitchensData) ? kitchensData : []);
        
        const sortedActivities = Array.isArray(activitiesData) 
          ? [...activitiesData].sort((a: any, b: any) => 
              new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime()
            ).slice(0, 5)
          : [];
        setActivities(sortedActivities);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setSummary({});
        setKitchens([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: profile?.role === 'Operator Koperasi' ? 'Harga per Porsi' : 'Total Dapur', 
      value: profile?.role === 'Operator Koperasi' ? 'Rp 8.500' : (summary?.total_dapur?.toString() || '0'), 
      change: profile?.role === 'Operator Koperasi' ? '-2%' : '+1', trend: 'up', icon: Building2, color: 'mint' },
    
    { label: profile?.role === 'Super Admin' ? 'Total Dana Sewa' : (profile?.role === 'PIC Dapur' ? 'Status BEP' : 'Progress Pembangunan'), 
      value: profile?.role === 'Super Admin' ? `Rp ${(summary?.total_sewa_nasional || 0).toLocaleString()}` : (profile?.role === 'PIC Dapur' ? 'PRE-BEP' : `${Math.round(summary?.construction_progress || 0)}%`), 
      change: '+5%', trend: 'up', icon: TrendingUp, color: 'emerald' },
    
    { label: profile?.role === 'Super Admin' ? 'Bagi Hasil Terbayar' : (profile?.role === 'Investor' ? 'Total Investasi' : (profile?.role === 'PIC Dapur' ? 'Laba Akumulasi' : 'Total Karyawan')), 
      value: profile?.role === 'Super Admin' ? `Rp ${(summary?.total_payout || 0).toLocaleString()}` : (profile?.role === 'Investor' ? 'Rp 250jt+' : (profile?.role === 'PIC Dapur' ? 'Rp 14.5jt' : (summary?.total_employees?.toString() || '0'))), 
      change: '+15%', trend: 'up', icon: (profile?.role === 'Investor' || profile?.role === 'PIC Dapur' || profile?.role === 'Super Admin') ? DollarSign : Users, color: 'mint' },
    
    { label: 'Cash Flow', value: `Rp ${(summary?.cash_flow || 0).toLocaleString()}`, change: '+10%', trend: 'up', icon: DollarSign, color: 'emerald' }
  ];

  const quickActions = [
    { label: 'Kelola Dapur', icon: LayoutGrid, action: 'locations', roles: ['Super Admin', 'Manager', 'PIC Dapur'] },
    { label: 'Input Progress', icon: Plus, action: 'construction', roles: ['Super Admin', 'Manager', 'Staff'] },
    { label: 'Laporan Keuangan', icon: Calendar, action: 'finance', roles: ['Super Admin', 'Finance', 'PIC Dapur'] },
    { label: 'Audit Bahan Baku', icon: Activity, action: 'procurement?action=audit-belanja', roles: ['Super Admin', 'Operator Koperasi'] },
    { label: 'Lapor Dana BGN', icon: DollarSign, action: 'finance?action=lapor-bgn', roles: ['PIC Dapur'] },
    { label: 'Panduan Finansial', icon: PieChart, action: 'external-finance-report' }
  ].filter(action => !action.roles || action.roles.includes(profile?.role || ''));

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutGrid },
    { id: 'finance', label: 'Keuangan', icon: DollarSign },
    { id: 'construction', label: 'Konstruksi', icon: Building2, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Staff', 'PIC Dapur'] },
    { id: 'logistics', label: 'Logistik', icon: Activity, roles: ['Super Admin', 'Manager', 'Procurement', 'PIC Dapur'] },
  ].filter(tab => !tab.roles || tab.roles.includes(profile?.role || ''));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BBF9D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D43] tracking-tight">Selamat Datang, {profile?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-2 font-medium">Berikut adalah manajemen Wahdah MBG.</p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mb-2 scrollbar-hide no-scrollbar lg:pb-0 lg:mb-0 lg:overflow-visible">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => action.action === 'external-finance-report' 
                ? window.open('file:///Users/pondokit/Herd/mbg-management/out/pemahaman_alur_keuangan_mbg.html', '_blank')
                : onNavigate?.(action.action)}
              className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1A4D43] border border-gray-100 hover:border-[#2BBF9D] hover:text-[#2BBF9D] transition-all shadow-sm active:scale-95 whitespace-nowrap flex-shrink-0"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#1A4D43]/5 p-1 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-white text-[#2BBF9D] shadow-sm' : 'text-gray-500 hover:text-[#1A4D43] hover:bg-white/50'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-card p-6 group hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${stat.color === 'mint' ? 'bg-[#E2F8F3] text-[#2BBF9D]' : 'bg-[#1A4D43]/5 text-[#1A4D43]'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black text-[#1A4D43] tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/30">
              <div>
                <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#2BBF9D]" /> Sebaran Dapur MBG</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Monitoring lokasi operasional real-time</p>
              </div>
              <button onClick={() => onNavigate?.('locations')} className="text-xs font-black text-[#2BBF9D] uppercase tracking-widest hover:underline">Detail Peta</button>
            </div>
            <div className="h-[450px] relative z-0">
              <MapContainer center={[-5.1476, 119.4327]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <AutoFitBounds kitchensList={kitchens} />
                {kitchens.filter(k => k.lat && k.lng).map(kitchen => (
                  <Marker key={kitchen.id} position={[kitchen.lat, kitchen.lng]}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold text-[#1A4D43] text-sm">{kitchen.name}</h4>
                        <p className="text-[10px] text-gray-500">{kitchen.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 group overflow-hidden">
              <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2 mb-8"><TrendingUp className="w-5 h-5 text-[#2BBF9D]" /> Performa Keuangan</h2>
              <div className="h-64 flex items-end gap-3 px-2">
                {[65, 45, 80, 55, 90, 70, 85].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    <div className="w-full relative h-[200px] flex items-end">
                       <div className="w-full bg-[#1A4D43]/5 rounded-t-lg transition-all duration-500 group-hover/bar:bg-[#2BBF9D]/10" style={{ height: '100%' }}></div>
                       <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#2BBF9D] to-[#2BBF9D]/70 rounded-t-lg shadow-lg shadow-[#2BBF9D]/20 transition-all duration-700 group-hover/bar:brightness-110" style={{ height: `${val}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Day {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8 overflow-hidden relative">
              <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2 mb-8"><Activity className="w-5 h-5 text-[#2BBF9D]" /> Progress Pembangunan</h2>
              <div className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-[10px] font-black py-1 px-2 uppercase rounded-full text-[#2BBF9D] bg-[#E2F8F3]">In Progress</span>
                    <span className="text-sm font-black text-[#1A4D43]">{Math.round(summary?.construction_progress || 0)}%</span>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 flex rounded-full bg-[#1A4D43]/5 p-0.5 border border-white">
                    <div style={{ width: `${summary?.construction_progress || 0}%` }} className="shadow-lg shadow-[#2BBF9D]/20 bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-full transition-all duration-1000"></div>
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
              <div className="glass-card overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/30">
                  <h2 className="text-xl font-bold text-[#1A4D43] flex items-center gap-2"><Activity className="w-5 h-5 text-[#2BBF9D]" /> Aktivitas Terbaru</h2>
                  <button onClick={() => onNavigate?.('construction')} className="text-xs font-black text-[#2BBF9D] hover:underline uppercase tracking-widest">Lihat Semua</button>
                </div>
                <div className="p-8 space-y-8">
                  {activities.map((activity, idx) => (
                    <div key={activity.id || idx} className="flex gap-6 relative group">
                      {idx < activities.length - 1 && <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-gray-100"></div>}
                      <div className="w-12 h-12 bg-[#F8FAF9] rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#2BBF9D] transition-colors shadow-sm">
                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-[#2BBF9D]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-[#1A4D43] text-base">{activity.title || 'Pembaruan Progress'}</h4>
                          <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(activity.created_at || activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 font-medium">{activity.note || activity.description || 'Pembaruan data sistem.'}</p>
                        <span className="px-3 py-1 bg-[#E2F8F3] text-[#2BBF9D] rounded-full text-[10px] font-black uppercase">{activity.source || 'Operational'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="glass-card p-8 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white overflow-hidden relative shadow-2xl shadow-[#2BBF9D]/20">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">User Profile</p>
                <h3 className="text-2xl font-black mb-1">{profile?.full_name}</h3>
                <p className="text-white/80 font-bold mb-8 opacity-80">{profile?.role}</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl backdrop-blur-md">
                      <span className="text-xs font-bold">Akses Departemen</span>
                      <span className="text-xs font-black px-2 py-0.5 bg-white/20 rounded-lg">{profile?.department || 'ALL'}</span>
                   </div>
                </div>
              </div>
              <div className="glass-card p-8">
                <h2 className="text-lg font-bold text-[#1A4D43] mb-6">Informasi Sistem</h2>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">V</div>
                      <div><p className="text-sm font-bold text-[#1A4D43]">Versi Dashboard</p><p className="text-xs text-gray-500">v2.5.1 (Expansion Edition)</p></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 group">
             <h2 className="text-xl font-bold text-[#1A4D43] mb-4">Ringkasan Keuangan</h2>
             <p className="text-sm text-gray-500 mb-6">Monitoring dana BGN dan alur bagi hasil investor.</p>
             <div className="space-y-4">
                <div className="flex justify-between p-4 bg-[#E2F8F3]/50 rounded-xl">
                  <span className="text-sm font-bold text-gray-600">Total Transaksi</span>
                  <span className="text-lg font-black text-[#1A4D43]">Rp {(summary?.cash_flow || 0).toLocaleString()}</span>
                </div>
             </div>
          </div>
          <div className="glass-card p-8 bg-white overflow-hidden relative">
             <h2 className="text-xl font-bold text-[#1A4D43] mb-4">Target BEP Investor</h2>
             <div className="space-y-6 mt-8">
                 <div className="relative pt-1">
                   {(()=>{
                     const totalCap = (kitchens || []).reduce((sum, k) => sum + (k.initial_capital || 0), 0);
                     const totalProf = (kitchens || []).reduce((sum, k) => sum + (k.accumulated_profit || 0), 0);
                     const progress = totalCap > 0 ? (totalProf / totalCap) * 100 : 0;
                     return (
                       <>
                         <div className="flex mb-2 items-center justify-between">
                           <span className="text-xs font-black uppercase text-[#2BBF9D]">Progress BEP (Real-time)</span>
                           <span className="text-sm font-black text-[#1A4D43]">{progress.toFixed(1)}%</span>
                         </div>
                         <div className="overflow-hidden h-3 flex rounded-full bg-gray-100 p-0.5">
                           <div style={{ width: `${Math.min(100, progress)}%` }} className="rounded-full bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] shadow-sm transition-all duration-1000"></div>
                         </div>
                       </>
                     );
                   })()}
                 </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'construction' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="glass-card p-6 md:col-span-2">
              <h2 className="text-xl font-bold text-[#1A4D43] mb-4">Kesehatan Operasional Dapur</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs font-black text-gray-400 uppercase">Dapur</th>
                      <th className="pb-4 text-xs font-black text-gray-400 uppercase">Wilayah</th>
                      <th className="pb-4 text-xs font-black text-gray-400 uppercase">Kesehatan</th>
                      <th className="pb-4 text-xs font-black text-gray-400 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {kitchens.slice(0, 5).map(k => (
                       <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                         <td className="py-4 font-bold text-[#1A4D43]">{k.name}</td>
                         <td className="py-4 text-xs text-gray-400 font-bold uppercase tracking-widest">{k.region || 'Nasional'}</td>
                         <td className="py-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                                k.accumulated_profit > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                                {k.accumulated_profit > 0 ? '🟢 Healthy' : '🟡 Warning'}
                            </span>
                         </td>
                         <td className="py-4">
                            <button onClick={() => onNavigate?.('locations')} className="text-[#2BBF9D] hover:underline font-bold text-[10px] uppercase">Rincian</button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-[#1A4D43] mb-4">Monitoring Logistik</h2>
              <div className="grid grid-cols-2 gap-6 mt-6">
                 <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rute Aktif</p>
                    <p className="text-2xl font-black text-[#1A4D43]">{kitchens.reduce((acc, k) => acc + (k.routes?.length || 0), 0)}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

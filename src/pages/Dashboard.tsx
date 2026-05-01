import React from 'react';
import { Building2, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Plus, LayoutGrid, Calendar, MapPin, Activity, PieChart, Phone, CheckCircle2, AlertCircle, X, Search, Truck, Package, AlertTriangle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'finance' | 'construction' | 'logistics' | 'leadership' | 'operational'>('overview');
  const [selectedKitchen, setSelectedKitchen] = React.useState<any>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

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
    { label: profile?.role === 'Operator Koperasi' ? 'Harga per Porsi' : 'Total Dapur', 
      value: profile?.role === 'Operator Koperasi' ? 'Rp 8.500' : (summary?.total_dapur?.toString() || '0'), 
      change: profile?.role === 'Operator Koperasi' ? '-2%' : '+1', trend: 'up', icon: Building2, color: 'mint' },
    
    { label: profile?.role === 'PIC Dapur' ? 'Status BEP' : 'Progress Pembangunan', 
      value: profile?.role === 'PIC Dapur' ? 'PRE-BEP' : `${Math.round(summary?.construction_progress || 0)}%`, 
      change: '+5%', trend: 'up', icon: TrendingUp, color: 'emerald' },
    
    { label: profile?.role === 'Investor' ? 'Total Investasi' : (profile?.role === 'PIC Dapur' ? 'Laba Akumulasi' : 'Total Karyawan'), 
      value: profile?.role === 'Investor' ? 'Rp 250jt+' : (profile?.role === 'PIC Dapur' ? 'Rp 14.5jt' : (summary?.total_employees?.toString() || '0')), 
      change: '+2', trend: 'up', icon: (profile?.role === 'Investor' || profile?.role === 'PIC Dapur') ? DollarSign : Users, color: 'mint' },
    
    { label: 'Cash Flow', value: `Rp ${(summary?.cash_flow || 0).toLocaleString()}`, change: '+10%', trend: 'up', icon: DollarSign, color: 'emerald' }
  ];

  const quickActions = [
    { label: 'Kelola Dapur', icon: LayoutGrid, action: 'locations', roles: ['Super Admin', 'Manager', 'PIC Dapur'] },
    { label: 'Input Progress', icon: Plus, action: 'construction', roles: ['Super Admin', 'Manager', 'Staff'] },
    { label: 'Laporan Keuangan', icon: Calendar, action: 'finance', roles: ['Super Admin', 'Finance', 'PIC Dapur'] },
    { label: 'Audit Belanja', icon: Activity, action: 'procurement?action=audit-belanja', roles: ['Super Admin', 'Operator Koperasi'] },
    { label: 'Lapor Dana BGN', icon: DollarSign, action: 'finance?action=lapor-bgn', roles: ['Super Admin', 'PIC Dapur', 'Operator Koperasi'] },
    { label: 'Input Operasional', icon: Plus, action: 'finance?tab=operasional', roles: ['PIC Dapur'] },
    { label: 'Panduan Finansial', icon: PieChart, action: 'external-finance-report' }
  ].filter(action => !action.roles || action.roles.includes(profile?.role || ''));

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutGrid },
    { id: 'finance', label: 'Keuangan', icon: DollarSign },
    { id: 'leadership', label: 'Pemaparan (DPP)', icon: PieChart, roles: ['Super Admin', 'Manager'] },
    { id: 'construction', label: 'Konstruksi', icon: Building2, roles: ['Super Admin', 'Manager', 'Finance', 'HRD', 'Staff', 'PIC Dapur'] },
    { id: 'operational', label: 'Operasional', icon: Activity },
    { id: 'logistics', label: 'Logistik', icon: Activity, roles: ['Super Admin', 'Manager', 'Procurement', 'PIC Dapur'] },
  ].filter(tab => !tab.roles || tab.roles.includes(profile?.role || ''));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2BBF9D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => action.action === 'external-finance-report' 
                ? window.open('/pemahaman_alur_keuangan_mbg.html', '_blank')
                : onNavigate?.(action.action)}
              className="group relative flex flex-col items-center justify-center gap-3 bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#2BBF9D] hover:shadow-2xl hover:shadow-[#2BBF9D]/10 hover:-translate-y-1 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2BBF9D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-3 bg-[#F8FAF9] text-[#1A4D43] rounded-xl group-hover:bg-[#2BBF9D] group-hover:text-white transition-all duration-300">
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-[#1A4D43] text-center tracking-tight uppercase leading-tight group-hover:text-[#2BBF9D] transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-[#1A4D43]/5 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-white text-[#2BBF9D] shadow-sm' : 'text-gray-500 hover:text-[#1A4D43] hover:bg-white/50'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-card p-4 group hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl ${stat.color === 'mint' ? 'bg-[#E2F8F3] text-[#2BBF9D]' : 'bg-[#1A4D43]/5 text-[#1A4D43]'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-xl font-black text-[#1A4D43] tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/30">
              <div>
                <h2 className="text-lg font-bold text-[#1A4D43] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#2BBF9D]" /> Sebaran Dapur MBG</h2>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-4 group overflow-hidden">
              <h2 className="text-lg font-bold text-[#1A4D43] flex items-center gap-2 mb-8"><TrendingUp className="w-5 h-5 text-[#2BBF9D]" /> Performa Keuangan</h2>
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
            <div className="glass-card p-4 overflow-hidden relative">
              <h2 className="text-lg font-bold text-[#1A4D43] flex items-center gap-2 mb-8"><Activity className="w-5 h-5 text-[#2BBF9D]" /> Progress Pembangunan</h2>
              <div className="space-y-4">
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
                   <div className="p-4 rounded-xl bg-[#E2F8F3]/50 border border-white/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Dapur Selesai</p>
                      <p className="text-xl font-black text-[#1A4D43]">{Math.floor((summary?.construction_progress || 0) / 10)}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-[#F8FAF9] border border-white/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Target Tahunan</p>
                      <p className="text-xl font-black text-[#1A4D43]">50</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/30">
                  <h2 className="text-lg font-bold text-[#1A4D43] flex items-center gap-2"><Activity className="w-5 h-5 text-[#2BBF9D]" /> Aktivitas Terbaru</h2>
                  <button onClick={() => onNavigate?.('construction')} className="text-xs font-black text-[#2BBF9D] hover:underline uppercase tracking-widest">Lihat Semua</button>
                </div>
                <div className="p-4 space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={activity.id || idx} className="flex gap-4 relative group">
                      {idx < activities.length - 1 && <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-gray-100"></div>}
                      <div className="w-10 h-10 bg-[#F8FAF9] rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#2BBF9D] transition-colors shadow-sm">
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
            <div className="space-y-4">
              <div className="glass-card p-4 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white overflow-hidden relative shadow-2xl shadow-[#2BBF9D]/20">
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">User Profile</p>
                <h3 className="text-xl font-black mb-1">{profile?.full_name}</h3>
                <p className="text-white/80 font-bold mb-8 opacity-80">{profile?.role}</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-md">
                      <span className="text-xs font-bold">Akses Departemen</span>
                      <span className="text-xs font-black px-2 py-0.5 bg-white/20 rounded-lg">{profile?.department || 'ALL'}</span>
                   </div>
                </div>
              </div>
              <div className="glass-card p-4">
                <h2 className="text-base font-bold text-[#1A4D43] mb-6">Informasi Sistem</h2>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">V</div>
                      <div><p className="text-sm font-bold text-[#1A4D43]">Versi Dashboard</p><p className="text-xs text-gray-500">v2.5.1 (Expansion Edition)</p></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white">
               <h2 className="text-sm font-black text-white/80 uppercase tracking-widest mb-2">Total Pendapatan (Gross)</h2>
               <p className="text-3xl font-black mb-4">Rp {((summary?.cash_flow || 0) * 2.5).toLocaleString()}</p>
               <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                 <ArrowUpRight className="w-3 h-3" /> +15% dari bulan lalu
               </div>
            </div>
            <div className="glass-card p-6 border border-gray-100">
               <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Total Pengeluaran (Opex)</h2>
               <p className="text-3xl font-black text-[#1A4D43] mb-4">Rp {((summary?.cash_flow || 0) * 1.2).toLocaleString()}</p>
               <div className="flex items-center gap-2 text-xs font-bold bg-red-100 text-red-600 w-fit px-3 py-1 rounded-full">
                 <ArrowDownRight className="w-3 h-3" /> Efisiensi logistik diperlukan
               </div>
            </div>
            <div className="glass-card p-6 border border-gray-100">
               <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Net Profit (EBITDA)</h2>
               <p className="text-3xl font-black text-[#2BBF9D] mb-4">Rp {(summary?.cash_flow || 0).toLocaleString()}</p>
               <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                 <div className="bg-[#2BBF9D] h-full" style={{ width: '40%' }}></div>
               </div>
               <p className="text-[10px] text-gray-400 font-bold mt-2">Margin: 40%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 border border-gray-100">
               <h2 className="text-lg font-bold text-[#1A4D43] mb-6 flex items-center gap-2">
                 <PieChart className="w-5 h-5 text-[#2BBF9D]" /> Alokasi Dana BGN
               </h2>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-600">Bahan Baku (60%)</span>
                   <span className="text-[#1A4D43]">Rp {((summary?.cash_flow || 0) * 0.6).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-[#1A4D43] h-full" style={{ width: '60%' }}></div></div>
                 
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-600">Operasional & Gaji (25%)</span>
                   <span className="text-[#1A4D43]">Rp {((summary?.cash_flow || 0) * 0.25).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-[#2BBF9D] h-full" style={{ width: '25%' }}></div></div>
                 
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-600">Bagi Hasil Investor (15%)</span>
                   <span className="text-[#1A4D43]">Rp {((summary?.cash_flow || 0) * 0.15).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-amber-400 h-full" style={{ width: '15%' }}></div></div>
               </div>
            </div>
            
            <div className="glass-card p-6 border border-gray-100">
               <h2 className="text-lg font-bold text-[#1A4D43] mb-6 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-[#2BBF9D]" /> Status Kewajiban (Hutang/Piutang)
               </h2>
               <div className="space-y-4">
                  <div className="p-4 bg-[#E2F8F3]/50 rounded-xl border border-[#2BBF9D]/20 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Piutang Pemda (BGN)</p>
                        <p className="text-lg font-black text-[#1A4D43]">Rp 450.000.000</p>
                     </div>
                     <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase">Pending Transfer</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Hutang Vendor Logistik</p>
                        <p className="text-lg font-black text-[#1A4D43]">Rp 85.500.000</p>
                     </div>
                     <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[9px] font-black uppercase">Aman (Jatuh Tempo H+7)</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'construction' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Unit Under Construction</h3>
                 <p className="text-3xl font-black text-[#1A4D43]">{kitchens.filter(k => k.status !== 'active').length}</p>
              </div>
              <div className="glass-card p-6">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rata-rata Progress</h3>
                 <p className="text-3xl font-black text-[#2BBF9D]">{Math.round(summary?.construction_progress || 0)}%</p>
              </div>
              <div className="glass-card p-6">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Penyelesaian Bulan Ini</h3>
                 <p className="text-3xl font-black text-[#1A4D43]">5 <span className="text-sm font-bold text-gray-400">Unit</span></p>
              </div>
           </div>
           
           <div className="glass-card p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-[#1A4D43] mb-6 flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-[#2BBF9D]" /> Pantauan Proyek Fisik
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Dapur & Lokasi</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor Kontraktor</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Selesai</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress Fisik</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status Kendala</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {kitchens.filter(k => k.status !== 'active').map(k => (
                      <tr key={k.id} className="hover:bg-gray-50/50">
                        <td className="py-4">
                          <p className="font-black text-[#1A4D43] text-sm">{k.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{k.address}</p>
                        </td>
                        <td className="py-4 text-sm font-bold text-gray-700">PT. Bangun Nusantara</td>
                        <td className="py-4 text-sm font-bold text-[#1A4D43]">
                           {new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-2">
                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden w-24">
                               <div className="bg-[#2BBF9D] h-full" style={{ width: `${Math.random() * 50 + 20}%` }}></div>
                             </div>
                             <span className="text-xs font-black text-[#1A4D43]">~50%</span>
                           </div>
                        </td>
                        <td className="py-4 text-right">
                           <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[9px] font-black uppercase">On Track</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'operational' && (
        <div className="space-y-4">
           <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#1A4D43] flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#2BBF9D]" /> 
                    Monitoring Dapur Running
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Daftar unit aktif dengan PIC penanggung jawab</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari Dapur atau PIC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2BBF9D] focus:ring-1 focus:ring-[#2BBF9D] w-full md:w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#E2F8F3] text-[#1A4D43] rounded-xl border border-[#2BBF9D]/20 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#2BBF9D] animate-pulse"></span>
                    <span className="text-xs font-black uppercase">{kitchens.filter(k => k.status === 'active').length} UNIT AKTIF</span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit & Lokasi</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PIC Lapangan</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Investor</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bagi Hasil</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status BEP</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {kitchens.filter(k => k.status === 'active' && (k.name?.toLowerCase().includes(searchQuery.toLowerCase()) || k.pic_name?.toLowerCase().includes(searchQuery.toLowerCase()))).map(k => (
                      <tr key={k.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <p className="font-black text-[#1A4D43] text-sm">{k.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] text-gray-400 font-bold uppercase">{k.sppg_id}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                             <span className="text-[10px] text-[#2BBF9D] font-bold">Aktif: {k.running_date ? new Date(k.running_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm font-bold text-gray-700">{k.pic_name || 'Belum Ditunjuk'}</span>
                             {k.pic_phone && (
                               <a 
                                 href={`https://wa.me/${k.pic_phone.replace(/[^0-9]/g, '')}`} 
                                 target="_blank" 
                                 className="flex items-center gap-1 text-green-600 text-[10px] font-black hover:underline"
                               >
                                 <Phone className="w-2.5 h-2.5" /> HUBUNGI WA
                               </a>
                             )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-[#1A4D43]">
                                {k.investors?.[0]?.name || 'Wahdah Mandiri'}
                             </span>
                             <span className="text-[10px] text-gray-400 font-black">
                                Rp {(k.initial_capital || 0).toLocaleString()}
                             </span>
                          </div>
                        </td>
                        <td className="py-4">
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-[#1A4D43]">{k.investors?.[0]?.saham_ratio || '70% : 30%'}</span>
                              <span className="text-[9px] text-gray-400 font-bold uppercase">Investor : Wahdah</span>
                           </div>
                        </td>
                        <td className="py-4 text-center">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${k.bep_status === 'POST-BEP' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                              {k.bep_status || 'PRE-BEP'}
                           </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedKitchen(k);
                                setShowDetailModal(true);
                              }}
                              className="p-2 hover:bg-[#1A4D43] hover:text-white rounded-lg transition-all text-gray-400 bg-white shadow-sm border border-gray-100 flex items-center gap-1.5"
                              title="Lihat Detail Pengkajian"
                            >
                              <PieChart className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase">Detail</span>
                            </button>
                            <button 
                              onClick={() => onNavigate?.('locations')}
                              className="p-2 hover:bg-[#2BBF9D] hover:text-white rounded-lg transition-all text-gray-400 shadow-sm border border-gray-100"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          </div>
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
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-6 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white">
                 <Truck className="w-6 h-6 mb-4 opacity-80" />
                 <h3 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Armada Aktif</h3>
                 <p className="text-3xl font-black">24 <span className="text-sm font-bold opacity-80">Unit</span></p>
              </div>
              <div className="glass-card p-6 border border-gray-100">
                 <Package className="w-6 h-6 mb-4 text-[#2BBF9D]" />
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Titik Distribusi (Sekolah)</h3>
                 <p className="text-3xl font-black text-[#1A4D43]">142</p>
              </div>
              <div className="glass-card p-6 border border-gray-100">
                 <Activity className="w-6 h-6 mb-4 text-amber-500" />
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ketepatan Waktu Pengiriman</h3>
                 <p className="text-3xl font-black text-[#1A4D43]">94.2%</p>
                 <p className="text-[10px] font-bold text-amber-600 mt-1">Target: 98%</p>
              </div>
              <div className="glass-card p-6 border border-gray-100">
                 <AlertCircle className="w-6 h-6 mb-4 text-red-500" />
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kendala Rute Hari Ini</h3>
                 <p className="text-3xl font-black text-red-500">2</p>
                 <button onClick={() => alert('Modul Kendala Rute sedang dalam pengembangan. Nantinya akan menampilkan riwayat masalah supir dan kendaraan.')} className="text-[10px] font-bold text-[#2BBF9D] uppercase hover:underline mt-1">Lihat Detail</button>
              </div>
           </div>

           <div className="glass-card p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-[#1A4D43] mb-6 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-[#2BBF9D]" /> Pantauan Rute Pengiriman Logistik Makanan
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Rute</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dapur Asal</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tujuan (Sekolah)</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[1, 2, 3, 4].map(i => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="py-4 text-sm font-black text-[#1A4D43]">RTE-MBG-00{i}</td>
                        <td className="py-4 text-sm font-bold text-gray-700">Dapur Percontohan Wahdah</td>
                        <td className="py-4 text-sm font-bold text-[#1A4D43]">SDN 0{i} Makassar</td>
                        <td className="py-4 text-sm font-bold text-gray-700">Ahmad Driver</td>
                        <td className="py-4 text-right">
                           <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${i === 2 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                              {i === 2 ? 'Dalam Perjalanan' : 'Terkirim'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'leadership' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] text-white shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Total Dividen Nasional</h3>
              <div className="text-3xl font-black mb-4">Rp {(summary?.cash_flow * 0.4 || 0).toLocaleString()}</div>
              <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> Akumulasi Seluruh Dapur
              </div>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-amber-500">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Indeks Transparansi</h3>
              <div className="text-2xl font-black text-[#1A4D43] mb-4">98.5% <span className="text-sm text-green-500 font-bold ml-1">Excellent</span></div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-500">Pintu 1 (Operasional)</span>
                  <span className="text-[#1A4D43]">Verified</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1A4D43] h-full" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold mt-2">
                  <span className="text-gray-500">Pintu 2 (Bahan Baku)</span>
                  <span className="text-[#2BBF9D]">95% Audited</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2BBF9D] h-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Top 3 Performa Dapur</h3>
              <div className="space-y-4">
                {kitchens.slice(0, 3).map((k, i) => (
                  <div key={k.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1A4D43] text-white flex items-center justify-center text-[10px] font-black">{i+1}</span>
                      <span className="text-sm font-bold text-[#1A4D43]">{k.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#2BBF9D]">Rp {(k.accumulated_profit || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
            <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-[#1A4D43] mb-2">Simulasi Proyeksi Nasional</h3>
            <p className="text-gray-500 max-w-xl mx-auto font-medium">Data ini diekstrapolasi dari performa rata-rata harian. Digunakan untuk presentasi estimasi ROI pimpinan dalam 5 tahun ke depan.</p>
            <button onClick={() => window.open('/pemahaman_alur_keuangan_mbg.html', '_blank')} className="mt-6 premium-button-primary hover:scale-105 transition-transform">Buka Simulasi Materi Pemaparan</button>
          </div>
        </div>
      )}

      {showDetailModal && selectedKitchen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1A4D43]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
               <div>
                 <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-[#1A4D43]">{selectedKitchen.name}</h3>
                    <span className="px-3 py-1 bg-[#E2F8F3] text-[#2BBF9D] rounded-full text-[10px] font-black uppercase tracking-widest">{selectedKitchen.sppg_id}</span>
                 </div>
                 <p className="text-sm text-gray-500 font-medium">{selectedKitchen.address}</p>
               </div>
               <button 
                 onClick={() => setShowDetailModal(false)}
                 className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
               >
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Summary Cards */}
                  <div className="p-5 bg-[#F8FAF9] rounded-2xl border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Investasi</p>
                     <p className="text-2xl font-black text-[#1A4D43]">Rp {(selectedKitchen.initial_capital || 0).toLocaleString()}</p>
                     <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#2BBF9D]">
                        <TrendingUp className="w-3 h-3" /> Status: {selectedKitchen.status}
                     </div>
                  </div>
                  <div className="p-5 bg-[#F8FAF9] rounded-2xl border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Penanggung Jawab (PIC)</p>
                     <p className="text-lg font-black text-[#1A4D43] mb-1">{selectedKitchen.pic_name || '-'}</p>
                     <p className="text-xs font-bold text-gray-500">{selectedKitchen.pic_phone || 'No Contact'}</p>
                  </div>
                  <div className="p-5 bg-[#F8FAF9] rounded-2xl border border-gray-100 shadow-sm">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Mulai Operasi</p>
                     <p className="text-lg font-black text-[#1A4D43] mb-1">
                        {selectedKitchen.running_date ? new Date(selectedKitchen.running_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                     </p>
                     <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-tighter">Running Phase</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Investor List */}
                  <div className="glass-card p-6 border border-gray-100">
                     <h4 className="text-sm font-black text-[#1A4D43] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#2BBF9D]" /> Daftar Investor & Saham
                     </h4>
                     <div className="space-y-4">
                        {(selectedKitchen.investors && selectedKitchen.investors.length > 0) ? selectedKitchen.investors.map((inv: any) => (
                           <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-white hover:border-[#2BBF9D]/20 transition-all">
                              <div>
                                 <p className="font-black text-[#1A4D43] text-sm">{inv.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase">Nilai: Rp {(inv.investment_amount || 0).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-lg font-black text-[#2BBF9D]">{inv.share_percentage}%</p>
                                 <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{inv.saham_ratio || '70:30 Split'}</p>
                              </div>
                           </div>
                        )) : (
                           <div className="text-center py-8 text-gray-400 italic text-sm">Belum ada data investor terperinci.</div>
                        )}
                     </div>
                  </div>

                  {/* Financial Audit */}
                  <div className="glass-card p-6 border border-gray-100">
                     <h4 className="text-sm font-black text-[#1A4D43] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#2BBF9D]" /> Pengkajian Finansial
                     </h4>
                     <div className="space-y-6">
                        <div>
                           <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                              <span>Akumulasi Laba</span>
                              <span>Target BEP</span>
                           </div>
                           <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-white shadow-inner">
                              <div 
                                 className="h-full bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-full" 
                                 style={{ width: `${Math.min(((selectedKitchen.accumulated_profit || 0) / (selectedKitchen.initial_capital || 1)) * 100, 100)}%` }}
                              ></div>
                           </div>
                           <div className="flex justify-between mt-2">
                              <span className="text-sm font-black text-[#1A4D43]">Rp {(selectedKitchen.accumulated_profit || 0).toLocaleString()}</span>
                              <span className="text-sm font-bold text-gray-400 italic">{(selectedKitchen.bep_status || 'PRE-BEP')}</span>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-50">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rasio Wahdah</p>
                              <p className="text-lg font-black text-[#1A4D43]">30% <span className="text-[10px] text-gray-400 font-medium">Net</span></p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Rasio Investor</p>
                              <p className="text-lg font-black text-[#2BBF9D]">70% <span className="text-[10px] text-gray-400 font-medium">Net</span></p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
               <button 
                 onClick={() => setShowDetailModal(false)}
                 className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-400 uppercase tracking-widest hover:bg-gray-200 transition-all"
               >
                 Tutup
               </button>
               <button 
                 onClick={() => window.print()}
                 className="px-6 py-2.5 bg-[#1A4D43] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-[#1A4D43]/20 hover:-translate-y-0.5 transition-all"
               >
                 Cetak Laporan Audit
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

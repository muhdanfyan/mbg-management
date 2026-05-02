import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  TrendingDown, 
  Users, 
  Clock, 
  Zap,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#1A4D43] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <img src="/logo-wahdah.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#1A4D43] block leading-none">Wahdah MBG</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2BBF9D]">Management</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-sm font-medium hover:text-[#2BBF9D] transition-colors">Program</a>
              <a href="#dampak" className="text-sm font-medium hover:text-[#2BBF9D] transition-colors">Dampak</a>
              <a href="#faq" className="text-sm font-medium hover:text-[#2BBF9D] transition-colors">Bantuan</a>
              <button 
                onClick={() => navigate('/login')}
                className="premium-button-primary px-6 py-2.5 flex items-center gap-2"
              >
                Login Sistem <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            <a href="#fitur" className="text-lg font-medium">Program</a>
            <a href="#dampak" className="text-lg font-medium">Dampak</a>
            <a href="#faq" className="text-lg font-medium">Bantuan</a>
            <button 
              onClick={() => navigate('/login')}
              className="premium-button-primary w-full py-3"
            >
              Login Sistem
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#E2F8F3] text-[#2BBF9D] px-4 py-2 rounded-full text-sm font-bold">
              <Zap className="w-4 h-4" /> Solusi Makan Bergizi Gratis Terpadu
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] text-[#1A4D43]">
              Wujudkan Masa Depan <span className="text-[#2BBF9D]">Generasi Emas</span> Melalui Gizi Seimbang
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              MBGONE mengintegrasikan manajemen dapur, pengadaan bahan baku, hingga distribusi makanan bergizi dalam satu platform yang transparan dan akuntabel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="premium-button-primary px-8 py-4 text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#2BBF9D]/20"
              >
                Mulai Sekarang <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-[#1A4D43]">500+ Dapur Terintegrasi</div>
                  <div className="text-gray-500">Membantu ribuan siswa</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#2BBF9D]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#1A4D43]/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
            <div className="glass-card p-6 relative overflow-hidden group">
              <img 
                src="/meal-tray.png" 
                alt="Meal Tray" 
                className="w-full h-auto rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop";
                }}
              />
              <div className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-orange-500 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Standar Gizi</div>
                    <div className="font-bold text-sm text-[#1A4D43]">Terverifikasi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="bg-[#1A4D43] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-end mb-16">
            <div>
              <h2 className="text-white text-4xl font-bold mb-6 leading-tight">
                Bangun Ekosistem Gizi <br />Terbaik Bersama Kami
              </h2>
              <button className="bg-[#2BBF9D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#25a68a] transition-all">
                Pelajari Lebih Lanjut
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "Manajemen SDM", desc: "Kelola koki dan staf operasional dengan mudah." },
                { icon: Clock, title: "Dukungan 24/7", desc: "Sistem monitoring real-time setiap saat." },
                { icon: TrendingDown, title: "Efisiensi Biaya", desc: "Optimalkan pengadaan bahan baku." }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-default">
                  <feature.icon className="text-[#2BBF9D] w-10 h-10 mb-4" />
                  <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Sections (Matching Image Layout) */}
      <section id="dampak" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-32">
        {/* Benefit 1 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="glass-card p-4">
            <div className="bg-[#F0FDF4] rounded-xl overflow-hidden aspect-video flex items-center justify-center p-8">
              <img 
                src="/kitchen-staff.png" 
                className="rounded-lg shadow-lg w-full h-full object-cover" 
                alt="Kitchen Staff" 
              />
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#1A4D43]">Kelola Dapur Lebih Efisien dengan Talenta Terpercaya</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Temukan dan kelola staf dapur yang berpengalaman. MBGONE memudahkan rekrutmen hingga penilaian kinerja harian secara digital dan terpusat.
            </p>
            <ul className="space-y-3">
              {["Seleksi staf otomatis", "Monitoring kehadiran real-time", "Penilaian standar kebersihan"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle2 className="text-[#2BBF9D] w-5 h-5" /> {item}
                </li>
              ))}
            </ul>
            <button className="flex items-center gap-2 font-bold text-[#1A4D43] hover:text-[#2BBF9D] transition-colors pt-4 group">
              Cek Manajemen SDM <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-4xl font-bold text-[#1A4D43]">Reduksi Biaya Operasional Hingga 20%</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Melalui sistem procurement yang cerdas, kami menghubungkan dapur langsung dengan supplier lokal berkualitas, memangkas rantai distribusi yang tidak efisien.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#E2F8F3] border border-[#2BBF9D]/20">
                <div className="text-3xl font-bold text-[#2BBF9D]">20%</div>
                <div className="text-sm text-gray-600">Hemat Pengadaan</div>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="text-3xl font-bold text-orange-500">100%</div>
                <div className="text-sm text-gray-600">Transparansi Dana</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 glass-card p-4">
            <div className="bg-blue-50 rounded-xl overflow-hidden aspect-video flex items-center justify-center p-8">
              <div className="w-full bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-bold">Statistik Penghematan</div>
                  <TrendingDown className="text-[#2BBF9D]" />
                </div>
                <div className="space-y-4">
                  {[60, 45, 80, 55].map((h, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-20 text-xs text-gray-400">Minggu {i+1}</div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2BBF9D]" style={{ width: `${h}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefit 3 */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="glass-card p-4">
            <div className="bg-[#FFF7ED] rounded-xl overflow-hidden aspect-video flex items-center justify-center p-8">
               <div className="w-64 bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="w-16 h-16 bg-[#2BBF9D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="text-[#2BBF9D] w-8 h-8" />
                  </div>
                  <div className="font-bold text-xl mb-1">Aman & Terpercaya</div>
                  <p className="text-sm text-gray-500 mb-4">Laporan keuangan diaudit secara real-time oleh sistem.</p>
                  <button className="w-full py-2 bg-[#1A4D43] text-white rounded-lg text-sm font-bold">Verifikasi Sekarang</button>
               </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#1A4D43]">Minimalisir Resiko & Hapus Tanggung Jawab Berlebih</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Otomatisasi laporan keuangan dan audit operasional memastikan setiap rupiah yang dikeluarkan tepat sasaran untuk gizi anak bangsa.
            </p>
            <div className="space-y-4">
               {[
                 { title: "Audit Digital Otomatis", desc: "Tidak perlu lagi rekonsiliasi manual yang melelahkan." },
                 { title: "Dashboard Investor", desc: "Pantau penggunaan dana langsung dari ponsel Anda." }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="mt-1 w-6 h-6 rounded-full bg-[#2BBF9D] flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">{i+1}</div>
                   <div>
                     <div className="font-bold text-[#1A4D43]">{item.title}</div>
                     <p className="text-sm text-gray-500">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-8">Klien Kami yang Bahagia</h3>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos Placeholder */}
            <div className="text-xl font-black italic">BAZNAS</div>
            <div className="text-xl font-black italic">KEMENKES</div>
            <div className="text-xl font-black italic">DINAS SOSIAL</div>
            <div className="text-xl font-black italic">WADAH</div>
          </div>
          <div className="mt-20 pt-8 border-t border-gray-100 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© 2026 MBGONE. All rights reserved.</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#2BBF9D]">Privacy Policy</a>
              <a href="#" className="hover:text-[#2BBF9D]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

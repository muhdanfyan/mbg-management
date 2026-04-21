import React from 'react';
import { 
  ArrowRight, 
  Wallet, 
  Utensils, 
  Building2, 
  Users, 
  BarChart3, 
  ShieldCheck,
  TrendingDown,
  Info,
  DollarSign,
  PieChart,
  ArrowDown
} from 'lucide-react';

export const Workflow: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg border border-slate-100">
              <img src="/logo-wahdah.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-base tracking-tight">Wahdah MBG</span>
          </div>
          <a href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            Login System
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            System Transparency
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-slate-900">
            Alur Keuangan <span className="text-blue-600">MBG</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
            Penjelasan sederhana mengenai distribusi dana, skema sewa, dan bagi hasil dalam ekosistem Makan Bergizi Gratis Wahdah.
          </p>
        </header>

        {/* Step 1: Dana Per Porsi */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-bold">Struktur Dana Per Porsi</h2>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-4 shadow-sm overflow-hidden relative group">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-center md:text-left space-y-2 flex-shrink-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dana dari BGN</p>
                <p className="text-4xl font-black text-blue-600">Rp 15.000</p>
                <p className="text-xs text-slate-500 font-medium italic">Per porsi makanan</p>
              </div>
              
              <div className="hidden md:block">
                <ArrowRight className="w-6 h-6 text-slate-300" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm">
                    <Utensils className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Rp 5.000</p>
                    <p className="text-xs text-slate-500">Operasional Dapur</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Rp 10.000</p>
                    <p className="text-xs text-slate-500">Pengadaan Bahan Baku</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Sewa Dapur */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
            <h2 className="text-lg font-bold">Pendapatan Sewa Dapur</h2>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-4 md:p-4 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             
             <div className="space-y-4 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-slate-400 text-sm max-w-sm">
                    Pemerintah membayar sewa tetap sebesar <span className="text-white font-bold">Rp 6 Juta / hari</span>. Pembagiannya terbagi dalam 2 skema:
                  </p>
                  <div className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-xs font-bold text-blue-400 uppercase">
                    Fixed Daily Income
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white/5 border border-white/10 p-5 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <h4 className="font-bold text-sm">Skema Investor</h4>
                      </div>
                      <div className="flex items-end justify-between border-b border-white/10 pb-2">
                         <span className="text-xs text-slate-400">Investor</span>
                         <span className="font-bold text-blue-400 text-base">60% s/d 75%</span>
                      </div>
                      <div className="flex items-end justify-between pt-1">
                         <span className="text-xs text-slate-400">DPP Pool</span>
                         <span className="font-bold text-slate-200">25% s/d 40%</span>
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 p-5 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-sm">Skema Bangun Sendiri (BSI)</h4>
                      </div>
                      <div className="flex items-end justify-between border-b border-white/10 pb-2">
                         <span className="text-xs text-slate-400">DPP Wahdah</span>
                         <span className="font-bold text-emerald-400 text-base">Rp 1.600</span>
                      </div>
                      <div className="flex items-end justify-between pt-1">
                         <span className="text-xs text-slate-400">YWMP</span>
                         <span className="font-bold text-slate-200">Rp 400</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">*Dihitung per porsi</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Step 3: Selisih Bahan */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
            <h2 className="text-lg font-bold">Keuntungan Bahan Baku</h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
             <div className="p-4 md:p-4 space-y-4">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Input Koperasi</p>
                      <p className="font-bold">Selisih Anggaran</p>
                    </div>
                 </div>
                 
                 <div className="flex-1 max-w-[100px] flex justify-center">
                   <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
                   <ArrowDown className="w-5 h-5 text-slate-300 md:hidden" />
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Potongan Honor</p>
                      <p className="font-bold">Rp 15 Juta / Bulan</p>
                    </div>
                 </div>
               </div>

               <div className="bg-blue-600 rounded-lg p-4 text-white text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-tight">Sisa Bersih dibagikan (60:20:20)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-white/10 py-3 rounded-lg border border-white/10">
                        <p className="text-lg font-black">60%</p>
                        <p className="text-[10px] uppercase font-bold text-blue-100">DPP</p>
                     </div>
                     <div className="bg-white/10 py-3 rounded-lg border border-white/10">
                        <p className="text-lg font-black">20%</p>
                        <p className="text-[10px] uppercase font-bold text-blue-100">DPD</p>
                     </div>
                     <div className="bg-white/10 py-3 rounded-lg border border-white/10">
                        <p className="text-lg font-black">20%</p>
                        <p className="text-[10px] uppercase font-bold text-blue-100">Koperasi</p>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Closing */}
        <footer className="text-center pt-8 border-t border-slate-200">
           <p className="text-slate-400 text-xs md:text-sm font-medium">
             © 2026 Platform Internal MBG Management • Tim IT Wahdah Islamiyah
           </p>
        </footer>
      </main>
    </div>
  );
};

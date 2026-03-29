import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  Wallet, 
  Building2, 
  Calculator, 
  Landmark, 
  FileCheck,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

export const SystemGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Pemecahan Dana MBG',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Bagaimana uang Rp 15.000/porsi dari BGN dibelah di dalam aplikasi ini.',
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Pintu Masuk Dana BGN</h3>
            <p className="text-blue-800 mb-6">
              Sistem MBG didesain untuk mencegah <strong>fraud</strong> dengan memecah hak input dana sebesar <strong>Rp 15.000/porsi</strong> ke dua belah entitas yang berbeda.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Rp 5.000 (Operasional)</h4>
                <span className="text-xs font-bold text-white bg-orange-500 px-3 py-1 rounded-full mt-2 mb-3">Diinput: PIC Dapur</span>
                <p className="text-sm text-gray-600">
                  Digunakan untuk membayar *Fix Cost* seperti Sewa Dapur (Rp 6 Juta/Hari), Gaji Pegawai, dan Biaya Harian Lapangan.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Rp 10.000 (Bahan Baku)</h4>
                <span className="text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full mt-2 mb-3">Diinput: Koperasi DPD</span>
                <p className="text-sm text-gray-600">
                  Kuota *budget* khusus Koperasi DPD sebagai broker untuk belanja riil harian di pasar / supplier lokal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Aksi 1: Input Operasional',
      icon: <FileCheck className="w-6 h-6" />,
      description: 'Cara PIC Dapur melaporkan pemakaian jatah Rp 5.000/porsi.',
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-200">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Validasi Pengeluaran PIC</h3>
                <p className="text-gray-600">
                  PIC dan Akuntan dapur akan masuk ke modul <strong>Finance & Accounting</strong> untuk mendata pengeluaran.
                  Aplikasi akan memvalidasi pengeluaran bulanan, termasuk memotong otomatis sewa harian.
                </p>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm">
                  <strong>Simulasi Sewa Dapur:</strong> <br/> 
                  Jika aktif 24 hari/bulan, maka sistem otomatis membebankan tagihan senilai <strong>Rp 144.000.000</strong> 
                  dari plafon dana Rp 5.000 ini, yang kemudian disetor ke DPP pusat melalui fitur transfer otomatis.
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg border-4 border-gray-800 relative group">
                  <div className="absolute inset-0">
                     <img src="/guide-assets/finance.png" alt="Screenshot Modul Finance" className="w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[1px] group-hover:opacity-0 transition-opacity duration-300">
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4">
                    <span className="text-white text-xs font-bold px-2 py-1 bg-[#1A4D43] rounded backdrop-blur-md">
                      📸 Tampilan Modul Finance Aktual
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Aksi 2: Margin Bahan Baku',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Cara Koperasi melaporkan harga riil & kalkulasi Margin.',
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white p-8 rounded-3xl border border-gray-200">
            <div className="flex flex-col-reverse md:flex-row gap-8 items-center">
               <div className="flex-1 w-full relative">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg border-4 border-gray-800 relative group">
                  <div className="absolute inset-0">
                     <img src="/guide-assets/procurement.png" alt="Screenshot Modul Procurement" className="w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="absolute top-0 inset-x-0 flex gap-2 p-3 bg-gray-100/50 backdrop-blur border-b border-gray-200">
                     <div className="w-2 h-2 rounded-full bg-red-400"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                     <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4">
                    <span className="text-white text-xs font-bold px-2 py-1 bg-[#2BBF9D] rounded backdrop-blur-md">
                      📸 Tampilan Modul Procurement Aktual
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Perhitungan Margin (Selisih)</h3>
                <p className="text-gray-600">
                  Melalui portal <strong>Procurement</strong>, Koperasi DPD bertindak selaku *broker* dan wajib mengunggah faktur belanja riil. 
                  Aplikasi secara instan menghitung selisih antara batas makismal 10 Ribu per porsi dan *real-cost*.
                </p>
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                  <h4 className="font-bold text-green-900 text-sm mb-2">Sistem Potong Otomatis:</h4>
                  <ul className="text-sm text-green-800 space-y-2 pl-4 list-disc marker:text-green-500">
                    <li>Sebelum margin dibagi, Aplikasi <strong>mengunci Rp 15 Juta</strong> di awal untuk melunasi Honor 4 Tenaga Utama Dapur.</li>
                    <li>Sisa (*Net Margin*) kemudian ditarik ke Dashboard Nasional untuk dibagi hasilnya dengan perbandingan 60:20:20 (DPP:DPD:KOPERASI).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Pantauan Finansial Pusat',
      icon: <Landmark className="w-6 h-6" />,
      description: 'Di mana DPP melihat total Setoran Sewa dan Margin terpisah.',
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#1A4D43] p-8 rounded-3xl border border-[#1A4D43]/20 shadow-2xl">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-8">
              <h3 className="text-3xl font-bold text-white">The Central Intelligence</h3>
              <p className="text-[#2BBF9D] font-medium text-lg">
                Dashboard ini adalah nyawa dari skema investasi dan transparansi.
              </p>
            </div>
            
            <div className="aspect-[21/9] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl relative mx-auto max-w-4xl group">
                 {/* Visual Background with Real Screenshot */}
                 <div className="absolute inset-0">
                    <img src="/guide-assets/dashboard.png" className="w-full h-full object-cover object-top opacity-30 group-hover:opacity-10 transition-opacity duration-700 blur-[2px] scale-105" alt="Dashboard Background" />
                 </div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-10 text-center">
                    <h4 className="text-white text-xl font-bold mb-2">Simulasi Sewa Skema Investor</h4>
                    <p className="text-gray-300 text-sm max-w-lg mb-6">
                      Jika DPP dan Investor bersepakat dengan tarif 60:40, maka tagihan sewa Rp 144 Juta tadi otomatis dikerucutkan oleh sistem menjadi:
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[200px]">
                           <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Investor (60%)</div>
                           <div className="text-2xl font-bold text-white">Rp 86,4 Jt</div>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[200px]">
                           <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">DPP Wahdah (30%)</div>
                           <div className="text-2xl font-bold text-[#2BBF9D]">Rp 43,2 Jt</div>
                       </div>
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center min-w-[200px]">
                           <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">YWMP (10%)</div>
                           <div className="text-2xl font-bold text-blue-400">Rp 14,4 Jt</div>
                       </div>
                    </div>
                 </div>
                 {/* Visual Color Overlay */}
                 <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2BBF9D]/50 via-[#1A4D43] to-black mix-blend-multiply z-0"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Tutorial Panduan Demo',
      icon: <LayoutDashboard className="w-6 h-6" />,
      description: 'Langkah mempresentasikan aplikasi ini di depan publik (Live Demo).',
      content: (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">🎭</span> Skenario Live Demo Terbaik
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Mulai dari Dashboard Nasional</h4>
                  <p className="text-gray-600 text-sm mt-1">Arahkan audiens ke menu <strong>Dashboard</strong>. Tunjukkan total realisasi nasional dan peta interaktif. Klik tombol "Filter Kinerja" untuk mendemonstrasikan bagaimana pusat memonitor ribuan titik skala <i>helicopter view</i>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Pamerkan Pelaporan Riil (Procurement & Finance)</h4>
                  <p className="text-gray-600 text-sm mt-1">Sampaikan bahwa data di Dashboard tadi diturunkan dari input lapangan. Masuk ke tab <strong>Keuangan</strong> untuk mensimulasikan pencatatan dana Rp 5.000 (Operasional) melalui tabel pengeluaran bulanan.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Galeri Bukti Fisik SPPG</h4>
                  <p className="text-gray-600 text-sm mt-1">Transparansi adalah kunci. Buka halaman <strong>Galeri Foto</strong> untuk menunjukkan foto progres fisik pembangunan dapur oleh kontraktor/vendor yang memvalidasi cairnya uang.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Tutup dengan Modul Investor</h4>
                  <p className="text-gray-600 text-sm mt-1">Terakhir, masuk ke <strong>Monitoring Investor</strong>. Demonstrasikan tabel simulasi 60:40 di mana bagi-hasil otomatis dipotong ketika tagihan tercetak. Ini adalah fitur penarik keyakinan (selling point) pemodal/BSI.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm">
               <strong>✨ Tip Praktis:</strong> Selalu posisikan antarmuka dengan tema gelap ringan (vibrant darkmode sidebar) agar kesan premium, aman, dan terkini (*state-of-the-art*) dirasakan kuat oleh audiens.
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-sm text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-[#1A4D43]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-[#1A4D43]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Panduan Penggunaan<br/>
          <span className="text-[#1A4D43]">OS Manajemen Keuangan</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Tur interaktif untuk memahami bagaimana alur pendanaan MBG dieksekusi secara otomatis dan dicatat secara transparan di dalam sistem.
        </p>
      </div>

      {/* Interactive Tabs / Progress Walkthrough */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Navigation Sidebar */}
        <div className="w-full lg:w-1/3 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden sticky top-6 shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-900">Tahapan Presentasi</h2>
              <p className="text-xs text-gray-500 mt-1">Cermin Digital Rekening Anda</p>
            </div>
            <div className="flex flex-col p-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex gap-4 p-4 rounded-2xl transition-all duration-300 text-left items-start ${
                    activeStep === step.id 
                      ? 'bg-[#1A4D43] text-white shadow-lg shadow-[#1A4D43]/20 translate-x-2' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                >
                  <div className={`mt-1 shrink-0 p-2 rounded-xl transition-colors ${
                    activeStep === step.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${activeStep === step.id ? 'text-white' : 'text-gray-900'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 ${activeStep === step.id ? 'text-gray-200' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                  {activeStep === step.id && (
                    <ArrowRight className="w-5 h-5 ml-auto self-center opacity-70" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Active Content Profile */}
        <div className="w-full lg:w-2/3">
          {steps.find(s => s.id === activeStep)?.content}
          
          <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in">
            <button 
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="text-sm font-bold text-gray-400 hover:text-[#1A4D43] disabled:opacity-50 disabled:pointer-events-none px-4 py-2 transition-colors"
            >
              ← Kembali
            </button>
            <div className="flex gap-2">
              {steps.map(step => (
                <div 
                  key={step.id} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${activeStep === step.id ? 'bg-[#1A4D43] w-6' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
              disabled={activeStep === steps.length}
              className="text-sm font-bold text-[#1A4D43] bg-[#E6F3F0] hover:bg-[#1A4D43] hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:pointer-events-none px-4 py-2 rounded-lg transition-colors"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
    DollarSign, 
    PieChart, 
    Send, 
    History, 
    TrendingUp, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    Search,
    Filter,
    ArrowRightLeft,
    HandCoins,
    BarChart3,
    Plus,
    UploadCloud
} from 'lucide-react';
import { api, Kitchen, RentalRecord, ProfitDistribution, PayoutDetail } from '../services/api';
import { Pagination } from '../components/UI/Pagination';
import { useAuth } from '../contexts/AuthContext';

const BEPChart: React.FC<{ kitchenId: number, initialCapital: number }> = ({ kitchenId, initialCapital }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrowth = async () => {
            try {
                const res = await api.getKitchenGrowth(kitchenId);
                setData(res || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGrowth();
    }, [kitchenId]);

    if (loading || data.length < 1) return <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-bold italic">Menunggu data pertumbuhan...</div>;

    const width = 400;
    const height = 150;
    const padding = 20;

    const maxAcc = Math.max(...data.map(d => d.total_acc), initialCapital);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
        const y = height - ((d.total_acc / maxAcc) * (height - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');

    const bepLineY = height - ((initialCapital / maxAcc) * (height - padding * 2) + padding);

    return (
        <div className="relative h-[180px] w-full mt-4">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#F1F5F9" strokeWidth="1" />
                
                {/* Target BEP Line */}
                <line x1={padding} y1={bepLineY} x2={width-padding} y2={bepLineY} stroke="#FFEDD5" strokeWidth="2" strokeDasharray="4" />
                <text x={width-padding} y={bepLineY-5} textAnchor="end" className="fill-orange-400 text-[10px] font-black uppercase">Target BEP</text>

                {/* Profit Line Area */}
                <polyline
                    fill="url(#gradient)"
                    stroke="none"
                    points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
                    className="opacity-20"
                />
                
                {/* Profit Line */}
                <polyline
                    fill="none"
                    stroke="#2BBF9D"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                    className="drop-shadow-sm"
                />

                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2BBF9D" />
                        <stop offset="100%" stopColor="#2BBF9D" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="flex justify-between mt-2 px-2 text-[10px] font-black text-gray-400 uppercase">
                <span>Mulai</span>
                <span>Progres Real-time</span>
            </div>
        </div>
    );
};

export const BagiHasil: React.FC = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'sewa' | 'distribusi' | 'remitansi' | 'bep'>('sewa');
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [rentals, setRentals] = useState<RentalRecord[]>([]);
    const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
    const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);
    const [isDistModalOpen, setIsDistModalOpen] = useState(false);
    const [calcResult, setCalcResult] = useState<any>(null);
    const [selectedKitchen, setSelectedKitchen] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [kData, rData, pData] = await Promise.all([
                api.get('/kitchens'),
                api.getRentalRecords(),
                api.getPayouts()
            ]);
            setKitchens(kData || []);
            setRentals(rData || []);
            setDistributions(pData || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRentalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            kitchen_id: parseInt(formData.get('kitchen_id') as string),
            date: formData.get('date'),
            amount: parseFloat(formData.get('amount') as string),
            period: formData.get('period'),
            notes: formData.get('notes'),
            status: 'APPROVED'
        };

        try {
            await api.postRentalRecord(data);
            setIsRentModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Gagal mencatat sewa');
        }
    };

    const runCalculation = async (kitchenId: number, amount: number) => {
        try {
            const res = await api.calculatePayout({ kitchen_id: kitchenId, pool: amount });
            setCalcResult(res);
        } catch (error) {
            alert('Gagal menghitung bagi hasil');
        }
    };

    const executeDistribution = async () => {
        if (!calcResult) return;
        
        const details: PayoutDetail[] = [];
        
        // Map Result to Details
        // Investor Pool
        if (calcResult.investor_payouts) {
            calcResult.investor_payouts.forEach((p: any) => {
                details.push({
                    recipient_name: p.name,
                    role: 'INVESTOR',
                    amount: p.payout,
                    percentage: p.share_percentage,
                    status: 'PENDING'
                });
            });
        }
        
        // DPP Pool - Sewa
        details.push({
            recipient_name: 'DPP Wahdah Islamiyah (Sewa)',
            role: 'DPP',
            amount: calcResult.dpp_share_sewa,
            percentage: 75.0,
            status: 'PENDING'
        });

        // YWMP Pool - Sewa
        details.push({
            recipient_name: 'Yayasan Wadah Merah Putih (Sewa)',
            role: 'YWMP',
            amount: calcResult.ywmp_share_sewa,
            percentage: 25.0,
            status: 'PENDING'
        });

        // --- NEW: MARGIN SELISIH BAHAN (60:20:20) ---
        if (calcResult.sisa_bersih > 0) {
            details.push({
                recipient_name: 'DPP Wahdah Islamiyah (Selisih)',
                role: 'DPP',
                amount: calcResult.dpp_share_selisih,
                percentage: 60.0,
                status: 'PENDING'
            });

            details.push({
                recipient_name: 'DPD Pelaksana (Selisih)',
                role: 'DPD',
                amount: calcResult.dpd_share_selisih,
                percentage: 20.0,
                status: 'PENDING'
            });

            details.push({
                recipient_name: 'Koperasi MBG (Selisih)',
                role: 'KOPERASI',
                amount: calcResult.kop_share_selisih,
                percentage: 20.0,
                status: 'PENDING'
            });
        }

        const data: ProfitDistribution = {
            kitchen_id: calcResult.dapur_id,
            period: new Date().toISOString().slice(0, 7),
            total_pool: calcResult.rental_income,
            investor_split: calcResult.investor_share,
            dpp_split: calcResult.dpp_share_sewa,
            ywmp_split: calcResult.ywmp_share_sewa,
            is_post_bep: calcResult.bep_status === 'POST-BEP',
            status: 'EXECUTED',
            details: details
        };

        try {
            await api.postPayout(data);
            setIsDistModalOpen(false);
            setCalcResult(null);
            fetchData();
            alert('Bagi hasil berhasil dieksekusi!');
        } catch (error) {
            alert('Gagal mengeksekusi bagi hasil');
        }
    };

    const handleRemit = async (detailId: number) => {
        const evidence = prompt('Masukkan URL Bukti Pemberitahuan/Transfer (Cloudinary/Drive):');
        if (!evidence) return;

        try {
            await api.updateRemittance(detailId, {
                paid_at: new Date().toISOString().split('T')[0],
                payment_method: 'Transfer Bank',
                evidence_url: evidence,
                status: 'COMPLETED'
            });
            fetchData();
        } catch (error) {
            alert('Gagal update remitansi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BBF9D]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A4D43] tracking-tight flex items-center gap-3">
                        <HandCoins className="w-8 h-8" />
                        Manajemen Bagi Hasil
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Pengelolaan dana sewa, distribusi laba, dan monitoring BEP</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsRentModalOpen(true)}
                        className="premium-button-primary bg-[#1A4D43] hover:bg-[#1A4D43]/90 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Zakat/Sewa Masuk
                    </button>
                    <button 
                        onClick={() => setIsDistModalOpen(true)}
                        className="premium-button-primary flex items-center gap-2 shadow-lg shadow-[#2BBF9D]/20"
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                        Eksekusi Profit Sharing
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 border-l-4 border-[#2BBF9D]">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#E2F8F3] p-3 rounded-2xl text-[#2BBF9D]">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sewa Terkumpul</p>
                            <h3 className="text-xl font-black text-[#1A4D43]">
                                Rp {(rentals || []).reduce((sum, r) => sum + r.amount, 0).toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                            <Send className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Terdistribusi</p>
                            <h3 className="text-xl font-black text-[#1A4D43]">
                                Rp {(distributions || []).reduce((sum, d) => sum + d.total_pool, 0).toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-orange-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-orange-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Remitansi</p>
                            <h3 className="text-xl font-black text-[#1A4D43]">
                                {(distributions || []).reduce((count, d) => count + (d.details?.filter(dt => dt.status === 'PENDING').length || 0), 0)} Payouts
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] border-none">
                    <div className="flex items-center gap-4 text-white">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Nasional BEP Progres</p>
                            <h3 className="text-xl font-black">
                                {(()=>{
                                    const totalCap = (kitchens || []).reduce((sum, k) => sum + (k.initial_capital || 0), 0);
                                    const totalProf = (kitchens || []).reduce((sum, k) => sum + (k.accumulated_profit || 0), 0);
                                    return totalCap > 0 ? ((totalProf / totalCap) * 100).toFixed(1) : '0';
                                })()}%
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-card overflow-hidden">
                <div className="flex border-b border-gray-100 bg-[#F8FAF9]/50 p-1">
                    {[
                        { id: 'sewa', label: 'Perekaman Sewa', icon: DollarSign },
                        { id: 'distribusi', label: 'Riwayat Distribusi', icon: ArrowRightLeft },
                        { id: 'remitansi', label: 'Pelacakan Remitansi', icon: Send },
                        { id: 'bep', label: 'Progres BEP', icon: BarChart3 },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${
                                activeTab === tab.id 
                                ? 'bg-white text-[#1A4D43] shadow-sm' 
                                : 'text-gray-400 hover:text-[#2BBF9D]'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'sewa' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4">Kitchen</th>
                                        <th className="px-4 py-4">Tanggal</th>
                                        <th className="px-4 py-4">Periode</th>
                                        <th className="px-4 py-4 text-right">Jumlah</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(rentals || []).map(r => (
                                        <tr key={r.id} className="hover:bg-[#F8FAF9] transition-colors">
                                            <td className="px-4 py-4 text-xs font-bold text-[#1A4D43]">{(kitchens || []).find(k => k.id === r.kitchen_id)?.name}</td>
                                            <td className="px-4 py-4 text-xs font-medium text-gray-500">{r.date}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-blue-600">{r.period}</td>
                                            <td className="px-4 py-4 text-xs font-black text-[#1A4D43] text-right">Rp {r.amount.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-4">
                                                <span className="px-3 py-1 bg-[#E2F8F3] text-[#2BBF9D] text-[9px] font-black rounded-full uppercase">
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400">{r.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'distribusi' && (
                        <div className="space-y-6">
                            {(distributions || []).map(d => (
                                <div key={d.id} className="border border-gray-100 rounded-2xl p-6 bg-white hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase mb-2 inline-block">
                                                ID DIST: #{d.id}
                                            </span>
                                            <h4 className="text-lg font-black text-[#1A4D43]">{(kitchens || []).find(k => k.id === d.kitchen_id)?.name}</h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Periode: {d.period} • {d.is_post_bep ? 'SKEMA PASCA-BEP' : 'SKEMA PRE-BEP'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pool</p>
                                            <h3 className="text-2xl font-black text-[#1A4D43]">Rp {d.total_pool.toLocaleString('id-ID')}</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#F8FAF9] p-4 rounded-xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Porsi Investor</p>
                                            <p className="text-lg font-black text-[#2BBF9D]">Rp {d.investor_split.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="bg-[#F8FAF9] p-4 rounded-xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Porsi DPP</p>
                                            <p className="text-lg font-black text-[#1A4D43]">Rp {d.dpp_split.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="bg-[#F8FAF9] p-4 rounded-xl">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Porsi YWMP</p>
                                            <p className="text-lg font-black text-blue-600">Rp {d.ywmp_split.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'remitansi' && (
                        <div className="space-y-4">
                            {(distributions || []).flatMap(d => d.details || []).map(dt => (
                                <div key={dt.id} className="glass-card p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                                            dt.role === 'INVESTOR' ? 'bg-[#E2F8F3] text-[#2BBF9D]' : 'bg-[#1A4D43]/5 text-[#1A4D43]'
                                        }`}>
                                            {dt.role.slice(0, 3)}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-[#1A4D43]">{dt.recipient_name}</h5>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Proporsional: {dt.percentage}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-[#1A4D43]">Rp {dt.amount.toLocaleString('id-ID')}</p>
                                            {dt.status === 'PAID' ? (
                                                <button 
                                                    onClick={() => setSelectedEvidence(dt.remittance?.evidence_url || null)}
                                                    className="text-[9px] text-[#2BBF9D] font-bold flex items-center gap-1 justify-end hover:underline"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    SUDAH DIBAYAR (LIHAT BUKTI)
                                                </button>
                                            ) : (
                                                <span className="text-[9px] text-orange-500 font-black flex items-center gap-1 justify-end uppercase tracking-tighter">
                                                    <Clock className="w-3 h-3" />
                                                    MENUNGGU TRANSFER
                                                </span>
                                            )}
                                        </div>
                                        {dt.status !== 'PAID' && (
                                            <button 
                                                onClick={() => handleRemit(dt.id!)}
                                                className="bg-[#1A4D43] text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg shadow-[#1A4D43]/20"
                                            >
                                                <UploadCloud className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'bep' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {(kitchens || []).filter(k => k.type === 'INVESTOR').map(k => {
                                const progress = k.initial_capital > 0 ? (k.accumulated_profit / k.initial_capital) * 100 : 0;
                                return (
                                    <div key={k.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#E2F8F3]/50 rounded-full blur-3xl group-hover:bg-[#2BBF9D]/20 transition-all"></div>
                                        
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div>
                                                <h4 className="text-xl font-black text-[#1A4D43]">{k.name}</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{k.region}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    k.bep_status === 'POST-BEP' ? 'bg-[#E2F8F3] text-[#2BBF9D]' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {k.bep_status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div>
                                                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                                                    <span className="text-gray-400">Balik Modal Progress</span>
                                                    <span className="text-[#1A4D43]">{progress.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${
                                                            k.bep_status === 'POST-BEP' ? 'bg-[#2BBF9D]' : 'bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D]'
                                                        }`}
                                                        style={{ width: `${Math.min(100, progress)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* PREMUIM BEP CHART */}
                                            <BEPChart kitchenId={k.id} initialCapital={k.initial_capital} />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#F8FAF9] p-4 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Investasi</p>
                                                    <p className="text-sm font-black text-[#1A4D43]">Rp {k.initial_capital.toLocaleString('id-ID')}</p>
                                                </div>
                                                <div className="bg-[#F8FAF9] p-4 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Payout</p>
                                                    <p className="text-sm font-black text-[#2BBF9D]">Rp {k.accumulated_profit.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>

                                            {k.bep_status === 'POST-BEP' && (
                                                <div className="bg-[#E2F8F3] p-4 rounded-2xl border border-[#2BBF9D]/20 flex items-center gap-3">
                                                    <ArrowUpRight className="w-5 h-5 text-[#2BBF9D]" />
                                                    <p className="text-[11px] font-bold text-[#1A4D43] leading-tight">
                                                        <span className="text-[#2BBF9D] font-black">PROFIT SAH!</span> Skema bagi hasil telah otomatis dibalik untuk periode mendatang.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Investor List Sync */}
                                            <div className="pt-4 border-t border-gray-50 space-y-3">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Partisipan Investor</h5>
                                                {k.investors && k.investors.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {k.investors.map((inv) => (
                                                            <div key={inv.id} className="flex items-center justify-between p-3 bg-[#F8FAF9]/50 rounded-xl border border-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-[#1A4D43] shadow-sm">
                                                                        {inv.name.slice(0, 1)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-bold text-[#1A4D43]">{inv.name}</p>
                                                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Share: {inv.share_percentage}%</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="px-2 py-0.5 bg-[#E2F8F3] text-[#2BBF9D] text-[8px] font-black rounded uppercase">
                                                                        {inv.saham_ratio || '75:25'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-gray-400 italic ml-1">Belum ada investor terdaftar.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Implementation... (Simplified for brevity but fully functional) */}
            {isRentModalOpen && (
                <div className="fixed inset-0 bg-[#1A4D43]/40 flex items-center justify-center z-[1000] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden p-8">
                        <h2 className="text-2xl font-black text-[#1A4D43] mb-6">Perekaman Setoran Sewa</h2>
                        <form onSubmit={handleRentalSubmit} className="space-y-4">
                            <select name="kitchen_id" required className="premium-input w-full">
                                <option value="">Pilih Dapur...</option>
                                {(kitchens || []).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                            </select>
                            <input type="date" name="date" required className="premium-input w-full" defaultValue={new Date().toISOString().split('T')[0]} />
                            <input type="number" name="amount" required placeholder="Jumlah (Rp)" className="premium-input w-full" />
                            <input type="text" name="period" required placeholder="Periode (e.g. April 2024)" className="premium-input w-full" />
                            <textarea name="notes" placeholder="Catatan Tambahan" className="premium-input w-full h-24" />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsRentModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Batal</button>
                                <button type="submit" className="flex-[2] premium-button-primary shadow-xl shadow-[#2BBF9D]/20 py-4">Simpan Setoran</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDistModalOpen && (
                <div className="fixed inset-0 bg-[#1A4D43]/40 flex items-center justify-center z-[1000] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] p-8 text-white relative">
                            <h2 className="text-2xl font-black mb-1">Kalkulator Bagi Hasil</h2>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Generate distribusi profit otomatis</p>
                            <div className="absolute right-8 top-8 bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Pilih Dapur Target</label>
                                    <select 
                                        onChange={(e) => setSelectedKitchen(parseInt(e.target.value))}
                                        className="premium-input w-full"
                                    >
                                        <option value="">Pilih...</option>
                                        {(kitchens || []).map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Total Dana Pool (Rp)</label>
                                    <input 
                                        id="pool_amount"
                                        type="number" 
                                        placeholder="E.g. 144000000"
                                        className="premium-input w-full" 
                                        onChange={(e) => selectedKitchen && runCalculation(selectedKitchen, parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            {calcResult && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 bg-[#F8FAF9] rounded-[2rem] border border-gray-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                calcResult.bep_status === 'POST-BEP' ? 'bg-[#2BBF9D] text-white' : 'bg-[#1A4D43]/10 text-[#1A4D43]'
                                            }`}>
                                                {calcResult.bep_status} DETECTED
                                            </span>
                                            {calcResult.bep_status === 'POST-BEP' && (
                                                <span className="text-[9px] font-black text-[#2BBF9D] flex items-center gap-1">
                                                    <ArrowRightLeft className="w-3 h-3" /> RASIO TELAH DIBALIK
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Alokasi Investor</span>
                                                <span className="text-lg font-black text-[#2BBF9D]">Rp {calcResult.investor_share.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Alokasi DPP (Wahdah)</span>
                                                <span className="text-lg font-black text-[#1A4D43]">Rp {calcResult.dpp_share_sewa.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Alokasi YWMP</span>
                                                <span className="text-lg font-black text-blue-600">Rp {calcResult.ywmp_share_sewa.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {calcResult.investor_payouts && (
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-black text-[#1A4D43] uppercase tracking-widest ml-1">Detail Eksekusi Investor</h5>
                                            {calcResult.investor_payouts.map((p: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl">
                                                    <div>
                                                        <p className="text-sm font-black text-[#1A4D43]">{p.name}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Porsi: {p.share_percentage}%</p>
                                                    </div>
                                                    <p className="text-sm font-black text-[#1A4D43]">Rp {p.payout.toLocaleString('id-ID')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsDistModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-[10px] transition-colors">Batal</button>
                                <button 
                                    disabled={!calcResult}
                                    onClick={executeDistribution}
                                    className="flex-[2] premium-button-primary shadow-xl shadow-[#2BBF9D]/20 py-4 disabled:opacity-50"
                                >
                                    Konfirmasi & Eksekusi Distribusi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Evidence Modal */}
            {selectedEvidence && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setSelectedEvidence(null)}
                            className="absolute -top-4 -right-4 bg-white text-gray-500 p-2 rounded-full shadow-lg hover:text-red-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-black text-[#1A4D43] mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#2BBF9D]" />
                            Bukti Transfer Pembayaran
                        </h3>
                        <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 mb-4 flex items-center justify-center">
                            <img src={selectedEvidence} alt="Bukti Transfer" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => window.open(selectedEvidence, '_blank')}
                                className="px-6 py-2.5 rounded-xl bg-gray-100 text-[#1A4D43] text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Original
                            </button>
                            <button 
                                onClick={() => setSelectedEvidence(null)}
                                className="px-6 py-2.5 rounded-xl bg-[#1A4D43] text-white text-sm font-bold hover:bg-[#1A4D43]/90 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, DollarSign, PieChart, Plus, Edit, Trash2, X, Briefcase } from 'lucide-react';
import { api, InvestorParticipant, Kitchen } from '../services/api';
import { SearchableSelect } from '../components/UI/SearchableSelect';
import { Pagination } from '../components/UI/Pagination';

export const Investors: React.FC = () => {
    const [participants, setParticipants] = useState<InvestorParticipant[]>([]);
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvestor, setEditingInvestor] = useState<InvestorParticipant | null>(null);
    const [selectedKitchenId, setSelectedKitchenId] = useState<number | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [investorsData, kitchensData] = await Promise.all([
                api.get('/investors'),
                api.get('/kitchens')
            ]);
            setParticipants(investorsData);
            setKitchens(kitchensData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Hapus investor ini?')) return;
        try {
            await api.delete(`/investors/${id}`);
            fetchData();
        } catch (error) {
            alert('Gagal menghapus investor');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const kid = parseInt(formData.get('kitchen_id') as string);
        const sp = parseFloat(formData.get('share_percentage') as string);
        
        // Validation: Check if total share for this kitchen exceeds 100%
        const currentKitchenTotal = participants
            .filter(p => p.kitchen_id === kid && p.id !== editingInvestor?.id)
            .reduce((sum, p) => sum + p.share_percentage, 0);

        if (currentKitchenTotal + sp > 100) {
            alert(`Total saham untuk dapur ini akan melebihi 100% (${(currentKitchenTotal + sp).toFixed(2)}%). Maksimal penambahan adalah ${(100 - currentKitchenTotal).toFixed(2)}%.`);
            return;
        }

        const data = {
            name: formData.get('name'),
            kitchen_id: kid,
            investment_amount: parseFloat(formData.get('investment_amount') as string),
            share_percentage: sp,
            saham_ratio: formData.get('saham_ratio')
        };

        try {
            if (editingInvestor) {
                await api.put(`/investors/${editingInvestor.id}`, data);
            } else {
                await api.post('/investors', data);
            }
            setIsModalOpen(false);
            setEditingInvestor(null);
            fetchData();
        } catch (error) {
            alert('Gagal menyimpan data investor');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredParticipants = participants.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kitchen?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalParticipants = filteredParticipants.length;
    const paginatedParticipants = filteredParticipants.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalInvestment = participants.reduce((sum, p) => sum + p.investment_amount, 0);

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2BBF9D]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A4D43] tracking-tight">Monitoring & ROI Investor</h1>
                    <p className="text-gray-500 mt-1 font-medium">Pantau bagi hasil dan status BEP (Break Even Point) setiap dapur</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setEditingInvestor(null);
                            setSelectedKitchenId(null);
                            setIsModalOpen(true);
                        }}
                        className="premium-button-primary flex items-center gap-2 shadow-lg shadow-[#2BBF9D]/20"
                    >
                        <Plus className="w-5 h-5 font-bold" />
                        Tambah Investor
                    </button>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E2F8F3] p-3 rounded-xl text-[#2BBF9D]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Investasi</p>
                            <h3 className="text-lg font-black text-[#1A4D43] tracking-tight">
                                Rp {totalInvestment.toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1A4D43]/5 p-3 rounded-xl text-[#1A4D43]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Peserta</p>
                            <h3 className="text-lg font-black text-[#1A4D43] tracking-tight">
                                {participants.length} Peserta
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E2F8F3] p-3 rounded-xl text-[#2BBF9D]">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Kitchen Tercover</p>
                            <h3 className="text-lg font-black text-[#1A4D43] tracking-tight">
                                {[...new Set(participants.map(p => p.kitchen_id))].length} Titik
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:shadow-xl transition-all bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-3 rounded-xl">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Skema Bagi Hasil</p>
                            <h3 className="text-lg font-black tracking-tight">
                                75:25 <span className="text-[10px] font-medium opacity-70">Pre-BEP</span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-white/30 backdrop-blur-md">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari investor atau ID SPPG..."
                            className="premium-input w-full pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1A4D43] border border-gray-100 hover:border-[#2BBF9D] hover:text-[#2BBF9D] transition-all shadow-sm active:scale-95">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAF9]/50 border-b border-gray-100">
                             <tr>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">NO</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">ID SPPG (DAPUR)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">MODAL & BEP</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right">INVESTASI</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">PESERTA</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-center">% SAHAM</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">RASIO (PRE:POST)</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedParticipants.map((p, index) => (
                                <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors group">
                                     <td className="px-4 py-3 whitespace-nowrap text-[10px] font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#E2F8F3] flex items-center justify-center text-[#2BBF9D] text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform">
                                                {p.kitchen?.name.slice(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-[#1A4D43] leading-tight">{p.kitchen?.name}</div>
                                                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">ID: {p.kitchen?.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                     <td className="px-4 py-3">
                                        <div className="w-full max-w-[120px]">
                                            <div className="flex justify-between text-[8px] font-bold mb-1">
                                                <span className="text-gray-400">BEP Progress</span>
                                                <span className="text-[#2BBF9D]">
                                                    {p.kitchen?.initial_capital ? Math.min(100, Math.round(((p.kitchen?.accumulated_profit || 0) / p.kitchen.initial_capital) * 100)) : 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1 border border-gray-50 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-1000 bg-[#2BBF9D]"
                                                    style={{ width: `${p.kitchen?.initial_capital ? Math.min(100, ((p.kitchen?.accumulated_profit || 0) / p.kitchen.initial_capital) * 100) : 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[7px] text-gray-400 mt-1 font-medium">
                                                Modal: Rp {(p.kitchen?.initial_capital || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                     <td className="px-4 py-3 whitespace-nowrap text-[11px] text-[#1A4D43] text-right font-black">
                                        Rp {p.investment_amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-[#1A4D43]">
                                        {p.name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="px-2 py-0.5 rounded-full bg-[#E2F8F3] text-[#2BBF9D] text-[9px] font-black uppercase shadow-sm">
                                                {p.share_percentage}%
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold">{p.saham_ratio}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-[#1A4D43] bg-gray-50 px-2 py-0.5 rounded">
                                                {p.saham_ratio || '75 : 25'}
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold uppercase mt-1">
                                                {p.kitchen?.bep_status === 'after_bep' ? 'Post-BEP Active' : 'Pre-BEP Active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => {
                                                    setEditingInvestor(p);
                                                    setSelectedKitchenId(p.kitchen_id);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-[#2BBF9D] hover:bg-[#E2F8F3] rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-50 bg-[#F8FAF9]/30">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalParticipants}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Investor Management Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#1A4D43]/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-xl w-full shadow-2xl overflow-hidden border border-white/20 transition-all transform scale-100 animate-in zoom-in-95 duration-300">
                        {/* Header with Decorative Elements */}
                        <div className="bg-gradient-to-br from-[#1A4D43] via-[#1E6B5E] to-[#2BBF9D] p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#2BBF9D]/20 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    {editingInvestor ? 'Edit Profil Investor' : 'Registrasi Investor Baru'}
                                </h2>
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ml-11">
                                    {editingInvestor ? 'Memperbarui data kepemilikan saham' : 'Pendataan porsi modal & bagi hasil'}
                                </p>
                            </div>

                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/60 hover:text-white hover:bg-white/10 p-3 rounded-2xl transition-all relative z-10 active:scale-90"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Form Body */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Investor</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2BBF9D] transition-colors">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <input 
                                            name="name" 
                                            defaultValue={editingInvestor?.name} 
                                            required 
                                            placeholder="E.g. H. Ahmad Dahlan"
                                            className="premium-input w-full pl-12 focus:ring-4 ring-[#2BBF9D]/10" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <SearchableSelect 
                                        label="Dapur Target (SPPG)"
                                        name="kitchen_id"
                                        value={selectedKitchenId?.toString() || ''}
                                        placeholder="Pilih Lokasi Dapur..."
                                        options={[
                                            { value: '', label: 'Pilih Dapur Tujuan' },
                                            ...kitchens.map(k => ({ value: k.id.toString(), label: `${k.name} (${k.region || 'ID: ' + k.id})` }))
                                        ]}
                                        onChange={(val) => {
                                            setSelectedKitchenId(parseInt(val) || null);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Auto Location Fields */}
                            {selectedKitchenId && (
                                <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[#2BBF9D] uppercase tracking-widest ml-1">Provinsi (Otomatis)</label>
                                        <div className="bg-[#E2F8F3]/50 px-4 py-2 rounded-xl text-[11px] font-bold text-[#1A4D43] border border-[#2BBF9D]/20">
                                            {(() => {
                                                const k = kitchens.find(k => k.id === selectedKitchenId);
                                                if (k?.sppg_detail?.location) {
                                                    const parts = k.sppg_detail.location.split(',');
                                                    return parts[0]?.trim() || 'Terdeteksi';
                                                }
                                                return k?.region || 'Sulawesi Selatan';
                                            })()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[#2BBF9D] uppercase tracking-widest ml-1">Kabupaten/Kota (Otomatis)</label>
                                        <div className="bg-[#E2F8F3]/50 px-4 py-2 rounded-xl text-[11px] font-bold text-[#1A4D43] border border-[#2BBF9D]/20">
                                            {(() => {
                                                const k = kitchens.find(k => k.id === selectedKitchenId);
                                                if (k?.sppg_detail?.location) {
                                                    const parts = k.sppg_detail.location.split(',');
                                                    return parts[1]?.trim() || parts[0]?.trim() || 'Terdeteksi';
                                                }
                                                return k?.region || 'Makassar';
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Share Distribution Section - Dynamic & Visual */}
                            <div className="bg-[#F8FAF9] rounded-[2rem] p-6 border border-gray-100 space-y-6 relative overflow-hidden">
                                <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                                    <PieChart className="w-24 h-24 text-[#1A4D43]" />
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-black text-[#1A4D43] uppercase tracking-widest flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-[#2BBF9D]" />
                                        Alokasi Porsi Saham
                                    </h3>
                                    <div className="px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
                                        <span className="text-[10px] font-black text-[#2BBF9D]">Dinamis</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 ml-1">Porsi Investor (%)</label>
                                        <div className="relative">
                                            <input 
                                                name="share_percentage" 
                                                type="number" 
                                                step="0.01" 
                                                max="100"
                                                defaultValue={editingInvestor?.share_percentage || 0}
                                                required 
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    const remaining = Math.max(0, 100 - val);
                                                    const sisaEl = document.getElementById('sisa_indicator');
                                                    if (sisaEl) sisaEl.innerText = remaining.toFixed(2) + '%';
                                                    const barEl = document.getElementById('share_bar');
                                                    if (barEl) barEl.style.width = val + '%';
                                                }}
                                                className="premium-input w-full bg-white font-black text-lg text-[#1A4D43]" 
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">PERCENT</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex flex-col justify-end pb-1">
                                        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-dashed border-[#2BBF9D]/30">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Sisa Porsi (Lainnya)</p>
                                                <p id="sisa_indicator" className="text-lg font-black text-[#2BBF9D]">
                                                    {(100 - (editingInvestor?.share_percentage || 0)).toFixed(2)}%
                                                </p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border-4 border-[#E2F8F3] border-t-[#2BBF9D] animate-spin-slow"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400 px-1">
                                        <span>Terisi</span>
                                        <span>Kapasitas 100%</span>
                                    </div>
                                    <div className="w-full h-3 bg-white rounded-full p-0.5 border border-gray-100 overflow-hidden shadow-inner">
                                        <div 
                                            id="share_bar"
                                            className="h-full bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-full transition-all duration-700 ease-out shadow-sm"
                                            style={{ width: `${editingInvestor?.share_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nilai Investasi (Modal)</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">RP</div>
                                        <input 
                                            name="investment_amount" 
                                            type="number" 
                                            defaultValue={editingInvestor?.investment_amount} 
                                            required 
                                            placeholder="E.g. 500000000"
                                            className="premium-input w-full pl-11 font-bold" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rasio Bagi Hasil</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <select 
                                            name="saham_ratio" 
                                            defaultValue={editingInvestor?.saham_ratio || '75 : 25'} 
                                            className="premium-input w-full pl-12 bg-white cursor-pointer font-bold appearance-none"
                                        >
                                            <option value="75 : 25">75% Investor : 25% DPP</option>
                                            <option value="60 : 40">60% Investor : 40% DPP</option>
                                            <option value="50 : 50">50% Investor : 50% DPP</option>
                                            <option value="100 : 0">100% Investor : 0% DPP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 py-4 text-gray-400 hover:text-[#1A4D43] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                                >
                                    Batalkan
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-[2] bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-[#2BBF9D]/30 hover:shadow-[#2BBF9D]/50 hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    {editingInvestor ? 'Simpan Perubahan Data' : 'Konfirmasi & Simpan Investor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

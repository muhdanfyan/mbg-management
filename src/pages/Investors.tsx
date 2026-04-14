import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, DollarSign, PieChart, Plus, Edit, Trash2, X, Briefcase } from 'lucide-react';
import { api, InvestorParticipant, Kitchen } from '../services/api';
import { Pagination } from '../components/UI/Pagination';

export const Investors: React.FC = () => {
    const [participants, setParticipants] = useState<InvestorParticipant[]>([]);
    const [kitchens, setKitchens] = useState<Kitchen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvestor, setEditingInvestor] = useState<InvestorParticipant | null>(null);

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
            setParticipants(Array.isArray(investorsData) ? investorsData : []);
            setKitchens(Array.isArray(kitchensData) ? kitchensData : []);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BBF9D]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A4D43] tracking-tight">Monitoring Investor</h1>
                    <p className="text-gray-500 mt-1 font-medium">Status investasi Satuan Pelayanan Pemenuhan Gizi Wahdah Islamiyah</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setEditingInvestor(null);
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
                        <div className="bg-[#E2F8F3] p-3 rounded-2xl text-[#2BBF9D]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Investasi</p>
                            <h3 className="text-xl font-black text-[#1A4D43] tracking-tight">
                                Rp {totalInvestment.toLocaleString('id-ID')}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1A4D43]/5 p-3 rounded-2xl text-[#1A4D43]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Peserta</p>
                            <h3 className="text-xl font-black text-[#1A4D43] tracking-tight">
                                {participants.length} Peserta
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-4 group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#E2F8F3] p-3 rounded-2xl text-[#2BBF9D]">
                            <PieChart className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Kitchen Tercover</p>
                            <h3 className="text-xl font-black text-[#1A4D43] tracking-tight">
                                {[...new Set(participants.map(p => p.kitchen_id))].length} Titik
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 group hover:shadow-xl transition-all bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Target Funding</p>
                            <h3 className="text-xl font-black tracking-tight">
                                100% Locked
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
                        <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1A4D43] border border-gray-100 hover:border-[#2BBF9D] hover:text-[#2BBF9D] transition-all shadow-sm active:scale-95">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAF9]/50 border-b border-gray-100">
                             <tr>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">NO</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">ID SPPG (DAPUR)</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">STATUS FUNDING</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right">TOTAL INVESTOR</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">PESERTA</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-center">%</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">EST. DIVIDEN</th>
                                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedParticipants.map((p, index) => (
                                <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors group">
                                     <td className="px-4 py-4 whitespace-nowrap text-[10px] font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
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
                                     <td className="px-4 py-4">
                                        {/* Kitchen Funding Progress */}
                                        <div className="w-full max-w-[100px]">
                                            <div className="flex justify-between text-[8px] font-bold mb-1">
                                                <span className="text-gray-400">Captured</span>
                                                <span className={`${
                                                    participants.filter(pt => pt.kitchen_id === p.kitchen_id).reduce((s, x) => s + x.share_percentage, 0) >= 100 
                                                    ? 'text-red-500' : 'text-[#2BBF9D]'
                                                }`}>
                                                    {participants.filter(pt => pt.kitchen_id === p.kitchen_id).reduce((s, x) => s + x.share_percentage, 0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1 border border-gray-50 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        participants.filter(pt => pt.kitchen_id === p.kitchen_id).reduce((s, x) => s + x.share_percentage, 0) >= 100 
                                                        ? 'bg-red-500' : 'bg-[#2BBF9D]'
                                                    }`}
                                                    style={{ width: `${Math.min(100, participants.filter(pt => pt.kitchen_id === p.kitchen_id).reduce((s, x) => s + x.share_percentage, 0))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                     <td className="px-4 py-4 whitespace-nowrap text-[11px] text-[#1A4D43] text-right font-black">
                                        Rp {p.investment_amount.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-[11px] font-bold text-[#1A4D43]">
                                        {p.name}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="px-2 py-0.5 rounded-full bg-[#E2F8F3] text-[#2BBF9D] text-[9px] font-black uppercase shadow-sm">
                                                {p.share_percentage}%
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold">{p.saham_ratio}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-blue-600">
                                                Rp {(p.investment_amount * 0.05).toLocaleString('id-ID')}*
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest italic">Est. 5% ROI/mo</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => {
                                                    setEditingInvestor(p);
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
                <div className="fixed inset-0 bg-[#1A4D43]/40 flex items-center justify-center z-[1000] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden border border-white/20 transition-all transform scale-100 animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] p-8 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 relative z-10">
                                <Users className="w-7 h-7" />
                                {editingInvestor ? 'Edit Data Investor' : 'Tambah Investor'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/60 hover:text-white hover:bg-white/10 p-2.5 rounded-2xl transition-all relative z-10 active:scale-95"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Investor</label>
                                    <input 
                                        name="name" 
                                        defaultValue={editingInvestor?.name} 
                                        required 
                                        placeholder="Nama Lengkap Investor"
                                        className="premium-input w-full" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Target Dapur (SPPG)</label>
                                    <select 
                                        name="kitchen_id" 
                                        defaultValue={editingInvestor?.kitchen_id || ''} 
                                        required 
                                        className="premium-input w-full bg-white cursor-pointer"
                                    >
                                        <option value="" disabled>Pilih Dapur Tujuan</option>
                                        {kitchens.map(k => (
                                            <option key={k.id} value={k.id}>{k.name} ({k.region})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nilai Investasi (Rp)</label>
                                        <input 
                                            name="investment_amount" 
                                            type="number" 
                                            defaultValue={editingInvestor?.investment_amount} 
                                            required 
                                            placeholder="E.g. 10000000"
                                            className="premium-input w-full" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Persentase (%)</label>
                                        <input 
                                            name="share_percentage" 
                                            type="number" 
                                            step="0.01" 
                                            defaultValue={editingInvestor?.share_percentage} 
                                            required 
                                            placeholder="E.g. 10.0"
                                            className="premium-input w-full" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Saham Ratio / Split</label>
                                    <input 
                                        name="saham_ratio" 
                                        defaultValue={editingInvestor?.saham_ratio} 
                                        placeholder="E.g. 75% : 25%"
                                        className="premium-input w-full" 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="flex-1 py-4 text-gray-400 hover:text-[#1A4D43] font-black uppercase tracking-widest text-xs transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-[2] premium-button-primary shadow-xl shadow-[#2BBF9D]/20 active:scale-95 transition-all py-4"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

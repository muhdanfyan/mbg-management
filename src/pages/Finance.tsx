import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle, Search, Filter, Briefcase } from 'lucide-react';

import { api, Transaction, Loan, FinancialSummary, ProfitDistribution } from '../services/api';
import { Pagination } from '../components/UI/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { formatDateID, formatCurrencyID, formatPeriodID, formatNumberID } from '../utils/formatters';

export const Finance: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'loans' | 'expenses' | 'reports' | 'investments' | 'selisih' | 'operasional'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isBGNModalOpen, setIsBGNModalOpen] = useState(false);
  const [isSewaModalOpen, setIsSewaModalOpen] = useState(false);
  const [editingTrans, setEditingTrans] = useState<Transaction | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Pagination State
  const [transPage, setTransPage] = useState(1);
  const [transItemsPerPage, setTransItemsPerPage] = useState(15);
  const [loanPage, setLoanPage] = useState(1);
  const [loanItemsPerPage, setLoanItemsPerPage] = useState(10);

  const formatDate = (dateStr: string) => {
    return formatDateID(dateStr);
  };
  
  const [transForm, setTransForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: '',
    amount: 0,
    status: 'pending'
  });

  const [bgnForm, setBgnForm] = useState({
    date: new Date().toISOString().split('T')[0],
    period: 'Tgl 1-10',
    portions: 0,
    amount: 0,
    proof_ref: '',
    evidence_url: '',
    kitchen_id: profile?.kitchen_id || null
  });

  const [loanForm, setLoanForm] = useState({
    number: '',
    lender: '',
    amount: 0,
    margin_rate: 0,
    monthly_payment: 0,
    remaining_balance: 0,
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const isRestricted = profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi' || profile?.role === 'Investor';
      const params = isRestricted && profile?.kitchen_id ? { kitchen_id: profile.kitchen_id } : undefined;

      const [transData, loansData, summaryData, kitchensData, distData, investorData, auditData] = await Promise.all([
        api.get('/transactions', params),
        api.get('/loans', params),
        api.get('/dashboard/summary', params),
        api.get('/kitchens'),
        api.getPayouts(params),
        api.get('/investors', params),
        api.get('/audit-spending', params)
      ]);
      setTransactions(Array.isArray(transData) ? transData : []);
      setLoans(Array.isArray(loansData) ? loansData : []);
      setSummary(summaryData || {});
      setKitchens(Array.isArray(kitchensData) ? kitchensData : []);
      setDistributions(Array.isArray(distData) ? distData : []);
      setInvestors(Array.isArray(investorData) ? investorData : []);
      setAudits(Array.isArray(auditData) ? auditData : []);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (id: number) => {
    try {
      const data = await api.get(`/dapur/${id}/report`);
      setReportData(data);
    } catch (error) {
      alert('Failed to fetch report');
    }
  };

  React.useEffect(() => {
    fetchData();
    // Check for query actions and tabs
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const tab = params.get('tab');

    if (action === 'lapor-bgn') {
      setIsBGNModalOpen(true);
    }

    if (tab === 'transactions') {
      setActiveTab('transactions');
    } else if (tab === 'expenses') {
      setActiveTab('expenses');
    } else if (tab === 'loans') {
      setActiveTab('loans');
    } else if (tab === 'reports') {
      setActiveTab('reports');
    }
  }, [location.search]);

  const handleBGNSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Alokasi standar MBG: Rp5.000 sewa, Rp10.000 bahan baku
      const rentalPortion = bgnForm.portions * 5000;
      const materialPortion = bgnForm.portions * 10000;

      await api.postFinancialRecord({
        dapur_id: Number(bgnForm.kitchen_id || profile?.kitchen_id),
        total_portions: bgnForm.portions,
        rental_income: rentalPortion,
        selisih_bahan_baku: materialPortion, // Awalnya diisi budget penuh, nanti diupdate audit koperasi
        status: 'PENDING',
        evidence_url: bgnForm.evidence_url
      });
      
      // Juga simpan sebagai transaksi income umum untuk cashflow global
      await api.post('/transactions', {
        date: bgnForm.date,
        type: 'income',
        category: `Dana BGN (${bgnForm.period})`,
        amount: bgnForm.amount,
        status: 'approved',
        notes: `Bukti: ${bgnForm.proof_ref} | Porsi: ${bgnForm.portions}`
      });

      setIsBGNModalOpen(false);
      fetchData();
      window.history.replaceState({}, '', window.location.pathname);
      alert('Dana BGN berhasil dilaporkan dan dialokasikan!');
    } catch (error: any) {
      alert('Gagal Lapor Dana: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTransSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...transForm, kitchen_id: (profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi') ? profile.kitchen_id : transForm.kitchen_id };
      if (editingTrans) {
        await api.put(`/transactions/${editingTrans.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setIsTransModalOpen(false);
      setEditingTrans(null);
      fetchData();
    } catch (error: any) {
      console.error('Transaction error:', error);
      alert('Failed to save transaction: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...loanForm, kitchen_id: (profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi') ? profile.kitchen_id : loanForm.kitchen_id };
      if (editingLoan) {
        await api.put(`/loans/${editingLoan.id}`, payload);
      } else {
        await api.post('/loans', payload);
      }
      setIsLoanModalOpen(false);
      setEditingLoan(null);
      fetchData();
    } catch (error: any) {
      console.error('Loan error:', error);
      alert('Failed to save loan: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteTrans = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleDeleteLoan = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await api.delete(`/loans/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete loan');
      }
    }
  };

  const openEditTrans = (t: Transaction) => {
    setEditingTrans(t);
    setTransForm({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      status: t.status
    });
    setIsTransModalOpen(true);
  };

  const openEditLoan = (l: Loan) => {
    setEditingLoan(l);
    setLoanForm({
      number: l.number,
      lender: l.lender,
      amount: l.amount,
      margin_rate: l.margin_rate,
      monthly_payment: l.monthly_payment,
      remaining_balance: l.remaining_balance,
      status: l.status,
      start_date: l.start_date,
      end_date: l.end_date
    });
    setIsLoanModalOpen(true);
  };

  const expenseCategories = React.useMemo(() => {
    const expenses = transactions.filter((t: Transaction) => t.type === 'expense');
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    const categories = expenses.reduce((acc: any, curr: Transaction) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const colors = ['blue', 'green', 'orange', 'purple'];
    return Object.entries(categories).map(([category, amount]: [string, any], idx) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: colors[idx % colors.length]
    }));
  }, [transactions]);

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const cashFlow = summary?.cash_flow || 0;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-[#1E8289]/10 text-[#1E8289]',
      rejected: 'bg-red-100 text-red-700',
      waiting_approval: 'bg-[#DE9F22]/10 text-[#DE9F22]',
      active: 'bg-[#1E8289]/10 text-[#1E8289]',
      closed: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      waiting_approval: 'Menunggu Persetujuan',
      active: 'Aktif',
      closed: 'Selesai'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      active: CheckCircle,
      closed: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  // Paginated Data
  const paginatedTransactions = transactions.slice(
    (transPage - 1) * transItemsPerPage,
    transPage * transItemsPerPage
  );

  const paginatedLoans = loans.slice(
    (loanPage - 1) * loanItemsPerPage,
    loanPage * loanItemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E8289]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Keuangan</h1>
          <p className="text-gray-600 mt-1">Pantau arus kas, pengeluaran, dan pendanaan</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingLoan(null);
              setLoanForm({
                number: '',
                lender: '',
                amount: 0,
                margin_rate: 0,
                monthly_payment: 0,
                remaining_balance: 0,
                status: 'active',
                start_date: new Date().toISOString().split('T')[0],
                end_date: ''
              });
              setIsLoanModalOpen(true);
            }}
            className="bg-white border border-[#1E8289] text-[#1E8289] px-4 py-2 rounded-lg hover:bg-[#F0F7F7] transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Pinjaman Baru
          </button>
          <button 
            onClick={() => {
              setEditingTrans(null);
              setTransForm({
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
                category: '',
                amount: 0,
                status: 'pending'
              });
              setIsTransModalOpen(true);
            }}
            className="bg-[#1E8289] text-white px-4 py-2 rounded-lg hover:bg-[#164E4D] transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Transaksi Baru
          </button>
          {(profile?.role === 'Super Admin' || profile?.role === 'PIC Dapur') && (
            <button 
              onClick={() => {
                setBgnForm({
                  date: new Date().toISOString().split('T')[0],
                  period: 'Tgl 1-10',
                  portions: 0,
                  amount: 0,
                  proof_ref: '',
                  kitchen_id: profile?.kitchen_id || null
                });
                setIsBGNModalOpen(true);
              }}
              className="bg-[#164E4D] text-white px-4 py-2 rounded-lg hover:bg-[#164E4D]/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              Lapor Dana BGN
            </button>
          )}
          {(profile?.role === 'Super Admin' || profile?.role === 'PIC Dapur' || profile?.role === 'Finance') && (
            <button 
              onClick={() => {
                setTransForm({
                  date: new Date().toISOString().split('T')[0],
                  type: 'income',
                  category: 'Sewa Dapur (Harian)',
                  amount: 0,
                  status: 'pending'
                });
                setIsTransModalOpen(true);
              }}
              className="bg-[#1E8289] text-white px-4 py-2 rounded-lg hover:bg-[#164E4D] transition-colors flex items-center gap-2 shadow-sm"
            >
              <TrendingUp className="w-5 h-5" />
              Lapor Sewa Harian
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            {['dashboard', 'transactions', 'loans', 'expenses', 'reports', 'investments', 'selisih', 'operasional'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-[#1E8289] text-[#1E8289]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {
                  tab === 'dashboard' ? 'Dasbor' :
                  tab === 'transactions' ? 'Transaksi' :
                  tab === 'loans' ? 'Pinjaman' :
                  tab === 'expenses' ? 'Pengeluaran' :
                  tab === 'reports' ? 'Sewa Dapur' :
                  tab === 'investments' ? 'Investasi' :
                  tab === 'selisih' ? 'Selisih' :
                  tab === 'operasional' ? 'Operasional' : tab
                }
              </button>
            ))}
          </div>
        </div>

        {/* Global Search Kitchen */}
        {['reports', 'investments', 'selisih', 'operasional'].includes(activeTab) && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
             <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Cari Dapur (Nama/ID)..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#F0F7F7] to-[#1E8289]/10 border border-[#1E8289]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-[#1E8289] p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[#1E8289]" />
                  </div>
                  <p className="text-sm text-[#1E8289] font-medium mb-1">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-[#164E4D]">
                    Rp {(totalIncome / 1000000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-[#1E8289] mt-2">+15% dari bulan lalu</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-red-600 p-3 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-700 font-medium mb-1">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-900">
                    Rp {(totalExpense / 1000000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-red-600 mt-2">+8% dari bulan lalu</p>
                </div>

                <div className="bg-gradient-to-br from-[#F0F7F7] to-[#1E8289]/10 border border-[#1E8289]/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-[#1E8289] p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[#1E8289]" />
                  </div>
                  <p className="text-sm text-[#1E8289] font-medium mb-1">Arus Kas Bersih</p>
                  <p className="text-2xl font-bold text-[#164E4D]">
                    Rp {(cashFlow / 1000000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-[#1E8289] mt-2">Aliran positif</p>
                </div>
              </div>

              {/* Distribution Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="glass-card p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bagi Hasil</p>
                    <p className="text-xl font-black text-[#164E4D]">
                       Rp {(Array.isArray(distributions) ? distributions : []).reduce((sum, d) => sum + (d.total_pool || 0), 0).toLocaleString('id-ID')}
                    </p>
                    <div className="mt-2 w-full bg-[#164E4D]/5 h-1 rounded-full overflow-hidden">
                       <div className="bg-[#1E8289] h-full rounded-full" style={{width: '100%'}}></div>
                    </div>
                 </div>
                 <div className="glass-card p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Porsi Investor</p>
                    <p className="text-xl font-black text-[#1E8289]">
                       Rp {(Array.isArray(distributions) ? distributions : []).reduce((sum, d) => sum + (d.investor_split || 0), 0).toLocaleString('id-ID')}
                    </p>
                 </div>
                 <div className="glass-card p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Porsi DPP/YWMP</p>
                    <p className="text-xl font-black text-[#1E8289]">
                       Rp {(Array.isArray(distributions) ? distributions : []).reduce((sum, d) => sum + (d.dpp_split || 0) + (d.ywmp_split || 0), 0).toLocaleString('id-ID')}
                    </p>
                 </div>
                 <div className="glass-card p-6 bg-gradient-to-br from-[#164E4D] to-[#1E8289] border-none shadow-lg shadow-[#1E8289]/20">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Remitansi Selesai</p>
                    <p className="text-xl font-black text-white">
                       {(Array.isArray(distributions) ? distributions : []).flatMap(d => d.details || []).filter(dt => dt.status === 'PAID').length} Transaksi
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemasukan vs Pengeluaran</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pemasukan</span>
                        <span className="text-sm font-semibold text-[#1E8289]">
                          Rp {(totalIncome / 1000000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-[#1E8289] h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pengeluaran</span>
                        <span className="text-sm font-semibold text-red-600">
                          Rp {(totalExpense / 1000000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Tabungan</span>
                        <span className="text-sm font-semibold text-[#1E8289]">
                          Rp {(cashFlow / 1000000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-[#1E8289] h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progres Pelunasan Pinjaman</h3>
                  <div className="space-y-4">
                    {loans.map((loan: Loan) => {
                      const percentage = loan.amount > 0 ? ((loan.amount - loan.remaining_balance) / loan.amount) * 100 : 0;
                      return (
                        <div key={loan.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-900 font-medium">{loan.lender}</span>
                            <span className="text-xs text-gray-600">{percentage.toFixed(0)}% terbayar</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                            <div
                              className="bg-gradient-to-r from-[#DE9F22] to-[#B8861B] h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Sisa: Rp {(loan.remaining_balance / 1000000000).toFixed(1)}M</span>
                            <span>Bulanan: Rp {(loan.monthly_payment / 1000000).toFixed(0)}Jt</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {paginatedTransactions.map((transaction: Transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                return (
                  <div
                    key={transaction.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          transaction.type === 'income'
                            ? 'bg-[#1E8289]/10'
                            : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-6 h-6 text-[#1E8289]" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.category}</h4>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-[#1E8289]' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}Rp {(transaction.amount / 1000000).toFixed(0)}M
                          </p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {transaction.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditTrans(transaction)}
                            className="p-2 text-[#1E8289] hover:bg-[#F0F7F7] rounded-lg transition-colors"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTrans(transaction.id as number)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Pagination
                currentPage={transPage}
                totalItems={transactions.length}
                itemsPerPage={transItemsPerPage}
                onPageChange={setTransPage}
                onItemsPerPageChange={(val) => {
                  setTransItemsPerPage(val);
                  setTransPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedLoans.map((loan: Loan) => {
                  const paidAmount = loan.amount - loan.remaining_balance;
                  const percentage = loan.amount > 0 ? (paidAmount / loan.amount) * 100 : 0;

                  return (
                    <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6 relative group">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditLoan(loan)}
                          className="p-1.5 bg-[#1E8289]/10 text-[#1E8289] rounded-lg hover:bg-[#1E8289]/20"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLoan(loan.id as number)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{loan.number}</h3>
                          <p className="text-sm text-gray-600">{loan.lender}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Jumlah Pinjaman</span>
                          <span className="font-semibold text-gray-900">
                            Rp {(loan.amount / 1000000000).toFixed(1)}B
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Nisbah / Margin (%)</span>
                          <span className="font-semibold text-gray-900">{loan.margin_rate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cicilan Bulanan</span>
                          <span className="font-semibold text-[#1E8289]">
                            Rp {(loan.monthly_payment / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sisa Saldo</span>
                          <span className="font-semibold text-red-600">
                            Rp {(loan.remaining_balance / 1000000000).toFixed(1)}B
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progres Pelunasan</span>
                          <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#DE9F22] to-[#B8861B] h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Start: {loan.start_date}</span>
                          <span>End: {loan.end_date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                currentPage={loanPage}
                totalItems={loans.length}
                itemsPerPage={loanItemsPerPage}
                onPageChange={setLoanPage}
                onItemsPerPageChange={(val) => {
                  setLoanItemsPerPage(val);
                  setLoanPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Distribution</h3>
                  <div className="space-y-4">
                    {expenseCategories.map((cat) => (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-900 font-medium">{cat.category}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {cat.percentage}% (Rp {(cat.amount / 1000000).toFixed(0)}M)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              cat.color === 'blue' ? 'bg-[#1E8289]' :
                              cat.color === 'green' ? 'bg-[#1E8289]' :
                              cat.color === 'orange' ? 'bg-[#DE9F22]' :
                              'bg-[#164E4D]'
                            }`}
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Anggaran vs Realisasi</h3>
                  <div className="space-y-4">
                    {expenseCategories.map((cat) => {
                      const budget = cat.amount * 1.2;
                      const percentage = budget > 0 ? (cat.amount / budget) * 100 : 0;
                      const isOverBudget = percentage > 100;

                      return (
                        <div key={cat.category} className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                            <span className={`text-xs font-medium ${
                              isOverBudget ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {percentage.toFixed(0)}% dari anggaran
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span>Anggaran: {formatCurrencyID(budget)}</span>
                            <span>Realisasi: {formatCurrencyID(cat.amount)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isOverBudget ? 'bg-red-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Persetujuan Tertunda</h3>
                <div className="space-y-3">
                  {transactions.filter((t: Transaction) => t.status === 'pending').map((transaction: Transaction) => (
                    <div key={transaction.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.category}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <p className="text-lg font-bold text-orange-600">
                          Rp {(transaction.amount / 1000000).toFixed(0)}M
                        </p>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              api.put(`/transactions/${transaction.id}`, { ...transaction, status: 'approved' })
                                .then(() => fetchData());
                            }}
                            className="flex-1 bg-[#1E8289] text-white py-2 rounded-lg hover:bg-[#164E4D] transition-colors text-sm font-medium"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => {
                              api.put(`/transactions/${transaction.id}`, { ...transaction, status: 'rejected' })
                                .then(() => fetchData());
                            }}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Tolak
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 border border-gray-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Bagi Hasil Per Dapur</h3>
                <div className="flex gap-4">
                  <select 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    value={selectedKitchenId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedKitchenId(id);
                      fetchReport(id);
                    }}
                  >
                    <option value="">Pilih Dapur...</option>
                    {kitchens.filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase())).map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => selectedKitchenId && fetchReport(selectedKitchenId)}
                    className="px-6 py-2 bg-[#1E8289] text-white rounded-lg hover:bg-[#164E4D] transition-colors"
                  >
                    Refresh Laporan
                  </button>
                </div>
                <div className="mt-4 p-4 bg-[#F0F7F7] border border-[#1E8289]/10 rounded-lg">
                  <p className="text-sm text-[#164E4D] leading-relaxed">
                    <strong>💡 Info Skema Keuangan:</strong> Perhitungan di bawah ini didasarkan pada alur kerja MBG. 
                    <strong> Modal Rp15.000/porsi</strong> (Rp5rb Operasional, Rp10rb Bahan Baku). 
                    Selisih bersih bahan baku setelah dikurangi biaya tetap <strong>Rp15jt (Honor 4 Tenaga Utama)</strong> 
                    dibagi dengan rasio <strong>60% DPP : 20% DPD : 20% Koperasi</strong>.
                  </p>
                </div>
              </div>

              {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                  {/* Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-gray-200">
                      <h4 className="font-bold text-gray-900">{reportData.dapur_name}</h4>
                      <p className="text-sm text-gray-500">Skema: {reportData.type}</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pendapatan Sewa (Gross)</span>
                        <span className="font-bold">Rp {reportData.rental_income.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Selisih Bahan Baku (Gross)</span>
                        <span className="font-bold">Rp {reportData.selisih_bahan_baku.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Sisa Bersih (Net)</span>
                        <span className="text-xl font-black text-[#1E8289]">Rp {reportData.sisa_bersih.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-[#1E8289]" />
                       Rincian Pembagian (Split)
                    </h4>
                    <div className="space-y-6">
                      {/* Rental Split */}
                      <div className="space-y-2">
                        <p className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nisbah / Margin (%)</p>
                        <div className="grid grid-cols-1 gap-2">
                           {reportData.investor_share > 0 && (
                             <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                               <span className="text-sm font-medium">Bagian Investor</span>
                               <span className="font-bold">Rp {reportData.investor_share.toLocaleString()}</span>
                             </div>
                           )}
                           <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <span className="text-sm font-medium text-blue-800">Bagian DPP Wahdah</span>
                             <span className="font-bold text-blue-900">Rp {reportData.dpp_share_sewa.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                             <span className="text-sm font-medium text-indigo-800">Bagian YWMP</span>
                             <span className="font-bold text-indigo-900">Rp {reportData.ywmp_share_sewa.toLocaleString()}</span>
                           </div>
                        </div>
                      </div>

                      {/* Margin Split */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bagi Hasil Selisih Bahan</p>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black">60:20:20 Split</span>
                        </div>
                        
                        {/* Margin Calculation Box */}
                        <div className="bg-[#F8FAF9] border border-[#2BBF9D]/10 rounded-xl p-4 space-y-2">
                           <div className="flex justify-between text-xs text-gray-500">
                              <span>Anggaran Bahan ({reportData.total_portions} porsi × Rp 10k)</span>
                              <span>Rp {(reportData.total_portions * 10000).toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between text-xs font-bold text-[#1A4D43]">
                              <span>Surplus / Margin Tabungan</span>
                              <span>Rp {reportData.selisih_bahan_baku.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between text-[10px] text-red-500 pt-2 border-t border-dashed border-gray-200">
                              <span>Biaya Tetap (4 Tenaga Utama)</span>
                              <span>- Rp 15.000.000</span>
                           </div>
                           <div className="flex justify-between text-sm font-black text-[#2BBF9D]">
                              <span>Laba Selisih Bersih (Net)</span>
                              <span>Rp {reportData.sisa_bersih.toLocaleString('id-ID')}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                           <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <div>
                               <span className="text-sm font-medium text-blue-800">DPP Wahdah (60%)</span>
                               <p className="text-[10px] text-blue-600">Pusat Management</p>
                             </div>
                             <span className="font-bold text-blue-900">Rp {reportData.dpp_share_selisih.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                             <div>
                               <span className="text-sm font-medium text-emerald-800">DPD (20%)</span>
                               <p className="text-[10px] text-emerald-600">Daerah Pelaksana</p>
                             </div>
                             <span className="font-bold text-emerald-900">Rp {reportData.dpd_share_selisih.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                             <div>
                               <span className="text-sm font-medium text-purple-800">Koperasi (20%)</span>
                               <p className="text-[10px] text-purple-600">Penyedia Bahan Baku</p>
                             </div>
                             <span className="font-bold text-purple-900">Rp {reportData.kop_share_selisih.toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projection Section */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] rounded-xl p-8 text-white shadow-xl shadow-[#2BBF9D]/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                         <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                           <TrendingUp className="w-6 h-6" />
                           Kalkulasi Proyeksi Payout
                         </h4>
                         <p className="text-white/70 text-sm font-medium">Estimasi pendapatan berdasarkan target porsi rutin</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                         <span className="text-[10px] font-black uppercase tracking-widest block opacity-60">Status BEP Saat Ini</span>
                         <span className="text-lg font-black">{reportData.bep_status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Target Porsi Harian</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               defaultValue={reportData.total_portions || 400}
                               id="proj_portions"
                               className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-2xl font-black outline-none focus:bg-white/20 transition-all"
                             />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold uppercase text-[10px]">Porsi</span>
                          </div>
                       </div>
                       
                       <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Estimasi Payout Investor / Bulan</p>
                             <p className="text-2xl font-black">
                               Rp {((reportData.investor_share / (reportData.total_portions || 1)) * 400 * 30).toLocaleString('id-ID')}
                             </p>
                             <p className="text-[10px] text-white/60 mt-2 font-medium">Asumsi 30 hari operasional</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status Nisbah</p>
                             <p className="text-2xl font-black">
                               {reportData.bep_status === 'PRE-BEP' ? '75% : 25%' : '25% : 75%'}
                             </p>
                             <p className="text-[10px] text-white/60 mt-2 font-medium">
                               {reportData.bep_status === 'PRE-BEP' ? 'Prioritas Pengembalian Modal' : 'Bagi Hasil Keuntungan'}
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2">
                       <Clock className="w-5 h-5 text-white/40" />
                       <p className="text-xs text-white/70 font-medium">
                          Berdasarkan pola ini, estimasi BEP dicapai dalam 
                          <span className="text-white font-black mx-1">
                            {reportData.initial_capital > 0 
                              ? Math.max(0, Math.ceil((reportData.initial_capital - reportData.accumulated_profit) / ((reportData.investor_share / (reportData.total_portions || 1)) * 400 * 30))).toFixed(0) 
                              : 0} Bulan
                          </span> 
                          mendatang.
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-[#1E8289]" />
                       Summary Investasi & BEP
                    </h3>
                    <p className="text-sm text-blue-700">Tracking pengembalian modal investor per dapur</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-bold shadow-sm">
                      Total Unit: {kitchens.length} Dapur
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kitchens
                  .filter(k => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((kitchen) => {
                  const percentage = kitchen.initial_capital > 0 
                    ? Math.min((kitchen.accumulated_profit / kitchen.initial_capital) * 100, 100)
                    : 0;
                  
                  return (
                    <div key={kitchen.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="p-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-gray-900 leading-tight uppercase tracking-tight">{kitchen.name}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            kitchen.bep_status === 'POST-BEP' ? 'bg-[#1E8289]/10 text-[#1E8289]' : 'bg-[#DE9F22]/10 text-[#DE9F22]'
                          }`}>
                            {kitchen.bep_status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Capital</p>
                          <p className="text-sm font-black text-[#1E8289]">{formatCurrencyID(kitchen.initial_capital || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <section>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">BEP Progress</span>
                            <span className="text-xs font-black text-gray-900">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                kitchen.bep_status === 'POST-BEP' ? 'bg-green-500' : 'bg-blue-600'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2">
                              <p className="text-[10px] text-gray-400 font-medium">Akumulasi: {formatCurrencyID(kitchen.accumulated_profit)}</p>
                              {kitchen.initial_capital > 0 && percentage < 100 && (
                                <p className="text-[10px] text-orange-600 font-bold">Sisa BEP: {formatCurrencyID(kitchen.initial_capital - kitchen.accumulated_profit)}</p>
                              )}
                          </div>
                        </section>

                        <section className="pt-4 border-t border-dashed border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Investor Participants</p>
                          {kitchen.investors && kitchen.investors.length > 0 ? (
                            <div className="space-y-2">
                              {kitchen.investors.map((inv: any) => (
                                <div key={inv.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-800">{inv.name}</span>
                                    <span className="text-[9px] text-gray-500">{inv.saham_ratio || '75% : 25%'} Ratio</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-black text-[#1E8289]">{inv.share_percentage}%</span>
                                    <p className="text-[9px] font-medium text-gray-400">{formatCurrencyID(inv.investment_amount || 0)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-[#1E8289]/10 border border-[#1E8289]/20 rounded-lg">
                              <p className="text-xs font-black text-[#1E8289] flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                100% Kepemilikan MBP/DPP
                              </p>
                              <p className="text-[9px] text-[#1E8289]/70 mt-1">Dapur ini dikelola secara internal tanpa investor eksternal.</p>
                            </div>
                          )}
                        </section>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'selisih' && (
            <div className="space-y-6">
              <div className="bg-[#E2F8F3] border border-[#2BBF9D]/20 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1A4D43] flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-[#2BBF9D]" />
                       Monitoring Selisih Bahan Baku
                    </h3>
                    <p className="text-sm text-[#1A4D43]/70">Tracking margin belanja harian (60:20:20 Split)</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-[#2BBF9D]/10 text-[#2BBF9D] rounded-full text-xs font-black shadow-sm uppercase tracking-wider">
                      Biaya Tetap: Rp 6 Juta / Hari (Bahan)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Logic Info Card */}
                 <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                       <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Skema Pembagian Bersih</h4>
                       <div className="space-y-4">
                          <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <div className="p-2 bg-[#1E8289] rounded text-white font-black text-xs">60%</div>
                             <div>
                                <p className="text-sm font-bold text-blue-900">DPP Wahdah</p>
                                <p className="text-[10px] text-blue-700">Pusat Management & Pengembangan</p>
                             </div>
                          </div>
                          <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                             <div className="p-2 bg-emerald-600 rounded text-white font-black text-xs">20%</div>
                             <div>
                                <p className="text-sm font-bold text-emerald-900">DPD</p>
                                <p className="text-[10px] text-emerald-700">Wilayah / Daerah Pelaksana</p>
                             </div>
                          </div>
                          <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                             <div className="p-2 bg-purple-600 rounded text-white font-black text-xs">20%</div>
                             <div>
                                <p className="text-sm font-bold text-purple-900">Koperasi</p>
                                <p className="text-[10px] text-purple-700">Audit & Quality Assurance</p>
                             </div>
                          </div>
                       </div>
                       <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                          <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                             * Laba bersih dihitung dari TOTAL MARGIN dikurangi Biaya Tetap (Bahan Baku) Rp 6.000.000 / hari.
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Audit Records List */}
                 <div className="lg:col-span-2 space-y-4">
                    {audits.filter(a => kitchens.find(k => k.id === a.kitchen_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                         <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-300" />
                         </div>
                         <h4 className="text-gray-900 font-bold">Belum Ada Data Audit</h4>
                         <p className="text-gray-500 text-sm mt-1">Data selisih akan tampil setelah Operator Koperasi melakukan audit pasar.</p>
                      </div>
                    ) : (
                      audits
                        .filter(a => kitchens.find(k => k.id === a.kitchen_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((audit) => {
                        const budget = audit.portions * 10000;
                        const margin = budget - audit.invoice_amount;
                        const netMargin = Math.max(0, margin - 6000000);
                        
                        return (
                          <div key={audit.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                             <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Tanggal Audit</p>
                                   <p className="font-bold text-gray-800 mt-1">{formatDate(audit.date)}</p>
                                </div>
                                <div className="text-right">
                                   <span className="text-[10px] font-black bg-[#E2F8F3] text-[#2BBF9D] px-2 py-1 rounded uppercase tracking-tighter">
                                      {audit.portions} Porsi
                                   </span>
                                </div>
                             </div>
                             
                             <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Kalkulasi Margin</p>
                                   <div className="space-y-2">
                                      <div className="flex justify-between text-xs font-medium">
                                         <span className="text-gray-500">Anggaran Bahan (Rp 10k/p)</span>
                                         <span className="text-gray-900 font-black">{formatCurrencyID(budget)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs font-medium">
                                         <span className="text-gray-500">Realisasi Nota (Audit)</span>
                                         <span className="text-red-500 font-black">- {formatCurrencyID(audit.invoice_amount)}</span>
                                      </div>
                                      <div className="pt-2 border-t border-gray-100 flex justify-between items-end">
                                         <span className="text-xs font-black text-[#1A4D43] uppercase tracking-tighter">Margin Tabungan</span>
                                         <span className="text-lg font-black text-[#2BBF9D]">{formatCurrencyID(margin)}</span>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="bg-[#F8FAF9] rounded-xl p-4 border border-[#2BBF9D]/10">
                                   <p className="text-[10px] font-black text-[#1A4D43] uppercase tracking-widest mb-3 text-center">Distribusi Laba Bersih</p>
                                   <div className="space-y-2">
                                      <div className="flex justify-between text-[10px] font-medium text-gray-400">
                                         <span>Fixed Cost (Biaya Tetap)</span>
                                         <span>- Rp 6.000.000</span>
                                      </div>
                                      <div className="flex justify-between text-[11px] font-bold text-blue-600 pt-1">
                                         <span>DPP Pusat (60%)</span>
                                         <span>Rp {(netMargin * 0.6).toLocaleString('id-ID')}</span>
                                      </div>
                                      <div className="flex justify-between text-[11px] font-bold text-emerald-600">
                                         <span>DPD Wilayah (20%)</span>
                                         <span>Rp {(netMargin * 0.2).toLocaleString('id-ID')}</span>
                                      </div>
                                      <div className="flex justify-between text-[11px] font-bold text-purple-600">
                                         <span>Koperasi (20%)</span>
                                         <span>Rp {(netMargin * 0.2).toLocaleString('id-ID')}</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             {audit.note && (
                               <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                                  <p className="text-[10px] font-medium text-gray-500 italic flex items-center gap-2">
                                     <Clock className="w-3 h-3" />
                                     Catatan: {audit.note}
                                  </p>
                               </div>
                             )}
                          </div>
                        );
                      })
                    )}
              </div>
            </div>
          </div>
        )}
          {activeTab === 'operasional' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                       <Briefcase className="w-5 h-5 text-orange-600" />
                       Manajemen Biaya Operasional
                    </h3>
                    <p className="text-sm text-orange-700">Tracking pengeluaran rutin & distribusi honor staff</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-orange-200 text-orange-700 rounded-full text-xs font-black shadow-sm uppercase tracking-wider">
                      Anggaran Tetap: Rp 6jt / Bulan
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* salary distribution card */}
                 <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                       <div className="p-5 bg-slate-50 border-b border-gray-100 italic">
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Alokasi Honor Staf (Tetap)</h4>
                       </div>
                       <div className="p-6 space-y-6">
                          <div className="flex justify-between items-center">
                             <div>
                                <p className="text-sm font-bold text-gray-900">Kepala Dapur</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Lead Person</p>
                             </div>
                             <p className="text-sm font-black text-[#1E8289]">Rp 2.500.000</p>
                          </div>
                          <div className="flex justify-between items-center">
                             <div>
                                <p className="text-sm font-bold text-gray-900">Akuntan / Admin</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Finance Control</p>
                             </div>
                             <p className="text-sm font-black text-[#1E8289]">Rp 1.500.000</p>
                          </div>
                          <div className="flex justify-between items-center">
                             <div>
                                <p className="text-sm font-bold text-gray-900">Staff Operasional</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">General Workers</p>
                             </div>
                             <p className="text-sm font-black text-[#1E8289]">Rp 2.000.000</p>
                          </div>
                          
                          <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
                             <p className="text-sm font-black text-gray-900 uppercase">Total Alokasi</p>
                             <p className="text-xl font-black text-orange-600">Rp 6.000.000</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Other OpEx List */}
                 <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Detail Pengeluaran Operasional</h4>
                          <span className="text-[10px] font-bold text-gray-400">Filter: Category 'Operasional/Honor'</span>
                       </div>
                       
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="text-xs font-black text-gray-400 uppercase border-b border-gray-100">
                                   <th className="pb-3 px-2">Tanggal</th>
                                   <th className="pb-3 px-2">Keterangan / Kategori</th>
                                   <th className="pb-3 px-2 text-right">Jumlah</th>
                                   <th className="pb-3 px-2 text-center">Status</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {transactions.filter(t => t.type === 'expense' && (t.category === 'Honor' || t.category === 'Gaji' || t.category === 'Operasional' || t.category === 'Utilities')).length === 0 ? (
                                   <tr>
                                      <td colSpan={4} className="py-12 text-center">
                                         <p className="text-gray-400 text-sm font-medium">Tidak ada transaksi operasional dalam periode ini.</p>
                                      </td>
                                   </tr>
                                ) : (
                                   transactions.filter(t => t.type === 'expense' && (t.category === 'Honor' || t.category === 'Gaji' || t.category === 'Operasional' || t.category === 'Utilities')).map(t => (
                                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                         <td className="py-4 px-2 text-xs font-medium text-gray-600">{formatDate(t.date)}</td>
                                         <td className="py-4 px-2">
                                            <p className="text-sm font-bold text-gray-900 capitalize">{t.category}</p>
                                            <p className="text-[10px] text-gray-400">{t.type === 'expense' ? 'Pengeluaran Rutin' : ''}</p>
                                         </td>
                                         <td className="py-4 px-2 text-sm font-black text-red-500 text-right">
                                            {formatCurrencyID(t.amount)}
                                         </td>
                                         <td className="py-4 px-2 text-center">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                                              t.status === 'approved' ? 'bg-[#1E8289]/10 text-[#1E8289]' : 'bg-[#DE9F22]/10 text-[#DE9F22]'
                                            }`}>
                                               {t.status}
                                            </span>
                                         </td>
                                      </tr>
                                   ))
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

      {/* Transaction Modal */}
      {isTransModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingTrans ? 'Edit Transaksi' : 'Transaksi Baru'}</h2>
            <form onSubmit={handleTransSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  required
                  value={transForm.date}
                  onChange={e => setTransForm({...transForm, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={transForm.type}
                    onChange={e => setTransForm({...transForm, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={transForm.status}
                    onChange={e => setTransForm({...transForm, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Operational, Food Supplies"
                  value={transForm.category}
                  onChange={e => setTransForm({...transForm, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (IDR)</label>
                <input 
                  type="number" 
                  required
                  value={transForm.amount}
                  onChange={e => setTransForm({...transForm, amount: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1E8289] text-white rounded-lg hover:bg-[#164E4D] font-medium"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingLoan ? 'Edit Loan' : 'New Loan'}</h2>
            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. LN-2024-001"
                    value={loanForm.number}
                    onChange={e => setLoanForm({...loanForm, number: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lender</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Bank Mandiri"
                    value={loanForm.lender}
                    onChange={e => setLoanForm({...loanForm, lender: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input 
                    type="number" 
                    required
                    value={loanForm.amount}
                    onChange={e => setLoanForm({...loanForm, amount: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sisa Saldo</label>
                  <input 
                    type="number" 
                    required
                    value={loanForm.remaining_balance}
                    onChange={e => setLoanForm({...loanForm, remaining_balance: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nisbah / Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={loanForm.margin_rate}
                    onChange={(e) => setLoanForm({ ...loanForm, margin_rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cicilan Bulanan</label>
                  <input 
                    type="number" 
                    required
                    value={loanForm.monthly_payment}
                    onChange={e => setLoanForm({...loanForm, monthly_payment: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={loanForm.start_date}
                    onChange={e => setLoanForm({...loanForm, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={loanForm.end_date}
                    onChange={e => setLoanForm({...loanForm, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={loanForm.status}
                  onChange={e => setLoanForm({...loanForm, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="active">Aktif</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1E8289] text-white rounded-lg hover:bg-[#164E4D] font-medium"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BGN Modal */}
      {isBGNModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#E2F8F3] p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-[#2BBF9D]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A4D43]">Lapor Dana BGN</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Input dana masuk per 10 hari</p>
              </div>
            </div>
            
            <form onSubmit={handleBGNSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    required
                    value={bgnForm.date}
                    onChange={e => setBgnForm({...bgnForm, date: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Periode Termin</label>
                  <select 
                    value={bgnForm.period}
                    onChange={e => setBgnForm({...bgnForm, period: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  >
                    <option value="Tgl 1-10">Tgl 1-10</option>
                    <option value="Tgl 11-20">Tgl 11-20</option>
                    <option value="Tgl 21-30">Tgl 21-30</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jumlah Porsi</label>
                  <input 
                    type="number" 
                    required
                    placeholder="E.g. 500"
                    value={bgnForm.portions || ''}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setBgnForm({...bgnForm, portions: p, amount: p * 15000});
                    }}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Dana (Auto)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input 
                      type="number" 
                      readOnly
                      value={bgnForm.amount}
                      className="w-full border border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-[#F8FAF9] text-[#1A4D43] font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {bgnForm.portions > 0 && (
                <div className="bg-[#E2F8F3] p-4 rounded-xl border border-[#2BBF9D]/20 space-y-2">
                  <p className="text-[10px] font-black text-[#1A4D43] uppercase tracking-widest">Estimasi Alokasi Dana (Rp 15.000/porsi)</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Bahan Baku (Rp 10k)</span>
                    <span className="font-bold text-[#1A4D43]">Rp {(bgnForm.portions * 10000).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Ops Dapur (Rp 5k)</span>
                    <span className="font-bold text-[#2BBF9D]">Rp {(bgnForm.portions * 5000).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ref. Bukti Transfer / Rekening Koran</label>
                <input 
                  type="text" 
                  required
                  placeholder="ID Transaksi atau Link Bukti"
                  value={bgnForm.proof_ref}
                  onChange={e => setBgnForm({...bgnForm, proof_ref: e.target.value})}
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1A4D43] focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bukti Transfer (URL)</label>
                <input 
                  type="url"
                  placeholder="Link Drive/Foto bukti transfer BGN"
                  value={bgnForm.evidence_url}
                  onChange={e => setBgnForm({...bgnForm, evidence_url: e.target.value})}
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsBGNModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 font-bold text-gray-500 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1A4D43] text-white rounded-xl hover:bg-[#1A4D43]/90 font-bold transition-all shadow-lg shadow-[#1A4D43]/20 active:scale-95"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

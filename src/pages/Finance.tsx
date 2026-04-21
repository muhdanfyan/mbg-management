import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle } from 'lucide-react';

import { api, Transaction, Loan, FinancialSummary, formatDateID } from '../services/api';
import { Pagination } from '../components/UI/Pagination';
import { useAuth } from '../contexts/AuthContext';

export const Finance: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'loans' | 'expenses' | 'reports' | 'investasi' | 'sewa' | 'margin' | 'operasional'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [kitchenSearchQuery, setKitchenSearchQuery] = useState('');

  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isBGNModalOpen, setIsBGNModalOpen] = useState(false);
  const [editingTrans, setEditingTrans] = useState<Transaction | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  // Pagination State
  const [transPage, setTransPage] = useState(1);
  const [transItemsPerPage, setTransItemsPerPage] = useState(15);
  const [loanPage, setLoanPage] = useState(1);
  const [loanItemsPerPage, setLoanItemsPerPage] = useState(10);
  
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
    amount: 0,
    proof_ref: '',
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
    setLoading(true);
    try {
      const [transData, loansData, summaryData, kitchensData] = await Promise.all([
        api.get('/transactions'),
        api.get('/loans'),
        api.get('/dashboard/summary'),
        api.get('/kitchens')
      ]);
      setTransactions(transData || []);
      setLoans(loansData || []);
      setSummary(summaryData);
      setKitchens(kitchensData || []);
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

  const location = useLocation();

  useEffect(() => {
    fetchData();
    if (profile?.role === 'PIC Dapur' && profile?.kitchen_id) {
      setSelectedKitchenId(profile.kitchen_id);
      fetchReport(profile.kitchen_id);
    }
  }, [profile]);

  useEffect(() => {
    // Check for query actions & tabs
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      const validTabs = ['dashboard', 'transactions', 'loans', 'expenses', 'reports', 'investasi', 'sewa', 'margin', 'operasional'];
      if (validTabs.includes(tab)) {
        setActiveTab(tab as any);
      }
    }

    if (params.get('action') === 'lapor-bgn') {
      setIsBGNModalOpen(true);
    }
  }, [location.search]);

  const handleBGNSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        date: bgnForm.date,
        type: 'income',
        category: `Dana BGN (${bgnForm.period})`,
        amount: bgnForm.amount,
        status: 'pending',
        notes: `Bukti: ${bgnForm.proof_ref}`,
        kitchen_id: profile?.kitchen_id // Ensure kitchen_id is passed
      });
      setIsBGNModalOpen(false);
      fetchData();
      if (selectedKitchenId) fetchReport(selectedKitchenId);
      // Remove query param from URL
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error: any) {
      alert('Gagal Lapor Dana: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTransSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrans) {
        await api.put(`/transactions/${editingTrans.id}`, transForm);
      } else {
        await api.post('/transactions', transForm);
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
      if (editingLoan) {
        await api.put(`/loans/${editingLoan.id}`, loanForm);
      } else {
        await api.post('/loans', loanForm);
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


  const filteredKitchens = kitchens.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(kitchenSearchQuery.toLowerCase()) ||
                         k.id.toString().includes(kitchenSearchQuery);
    
    if (profile?.role === 'PIC Dapur') {
       return k.id === profile.kitchen_id && matchesSearch;
    }
    return matchesSearch;
  });

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const cashFlow = summary?.cash_flow || 0;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      waiting_approval: 'bg-purple-100 text-purple-700',
      active: 'bg-blue-100 text-blue-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Monitor cash flow, expenses, and funding</p>
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
            className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            New Loan
          </button>
          {(profile?.role === 'Super Admin' || profile?.role === 'Finance' || profile?.role === 'Operator Koperasi') && (
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              New Transaction
            </button>
          )}
          {(profile?.role === 'Super Admin' || profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi') && (
            <button 
              onClick={() => {
                setBgnForm({
                  date: new Date().toISOString().split('T')[0],
                  period: 'Tgl 1-10',
                  amount: 0,
                  proof_ref: '',
                  kitchen_id: profile?.kitchen_id || null
                });
                setIsBGNModalOpen(true);
              }}
              className="bg-[#1A4D43] text-white px-4 py-2 rounded-lg hover:bg-[#1A4D43]/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle className="w-5 h-5" />
              Lapor Dana BGN
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-4">
            {['dashboard', 'investasi', 'sewa', 'margin', 'operasional', 'expenses', 'transactions', 'reports'].filter(tab => {
              if (profile?.role === 'Operator Koperasi') return ['dashboard', 'margin', 'expenses', 'transactions', 'reports'].includes(tab);
              if (profile?.role === 'PIC Dapur') return ['dashboard', 'operasional', 'transactions', 'reports'].includes(tab);
              return true;
            }).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-2 border-b-2 font-medium transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#1A4D43] text-[#1A4D43]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'investasi' ? 'Investasi' :
                 tab === 'sewa' ? 'Sewa Dapur' :
                 tab === 'margin' ? 'Selisih Bahan' :
                 tab === 'operasional' ? 'Operasional' :
                 tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-green-600 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700 font-medium mb-1">Total Income</p>
                  <p className="text-xl font-bold text-green-900">
                    Rp {(totalIncome / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-green-600 mt-2">+15% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-red-600 p-3 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-700 font-medium mb-1">Total Expenses</p>
                  <p className="text-xl font-bold text-red-900">
                    Rp {(totalExpense / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-red-600 mt-2">+8% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Net Cash Flow</p>
                  <p className="text-xl font-bold text-blue-900">
                    Rp {(cashFlow / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Positive flow</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Income vs Expense</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Income</span>
                        <span className="text-sm font-semibold text-green-600">
                          Rp {(totalIncome / 1000000000).toFixed(1)}B
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Expense</span>
                        <span className="text-sm font-semibold text-red-600">
                          Rp {(totalExpense / 1000000000).toFixed(1)}B
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Savings</span>
                        <span className="text-sm font-semibold text-blue-600">
                          Rp {(cashFlow / 1000000000).toFixed(1)}B
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Realisasi Bagi Hasil Investor</h3>
                  <div className="space-y-4">
                    {kitchens.filter(k => k.accumulated_profit > 0).slice(0, 3).map((kitchen: any) => {
                      const target = kitchen.initial_capital * 1.5; // Contoh target 150% ROI
                      const percentage = Math.min((kitchen.accumulated_profit / target) * 100, 100);
                      return (
                        <div key={kitchen.id} className="relative">
                          <div className="flex items-center justify-between mb-2">
                             <div>
                                <span className="text-sm font-bold text-gray-900">{kitchen.name}</span>
                                <p className="text-[10px] text-gray-400 uppercase">Target BEP + 50% Profit</p>
                             </div>
                             <span className="text-xs font-black text-[#1A4D43] bg-[#E6F3F0] px-2 py-0.5 rounded">
                                {percentage.toFixed(1)}% RECOVERED
                             </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
                             <div 
                                className="h-full bg-gradient-to-r from-[#2BBF9D] to-[#1A4D43] transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                             />
                          </div>
                          <div className="flex justify-between mt-1 items-baseline">
                             <span className="text-[11px] text-gray-500">Nilai: Rp {(kitchen.accumulated_profit / 1000000).toFixed(1)}M</span>
                             <span className="text-[11px] text-gray-500 font-medium">Target: Rp {(target / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      );
                    })}
                    {kitchens.filter(k => k.accumulated_profit > 0).length === 0 && (
                      <div className="text-center py-3 text-gray-400 italic text-sm">
                        Belum ada data distribusi bagi hasil terekam.
                      </div>
                    )}
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
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.category}</h4>
                          <p className="text-sm text-gray-600">{formatDateID(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-base font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedLoans.map((loan: Loan) => {
                  const paidAmount = loan.amount - loan.remaining_balance;
                  const percentage = loan.amount > 0 ? (paidAmount / loan.amount) * 100 : 0;

                  return (
                    <div key={loan.id} className="bg-white border border-gray-200 rounded-lg p-4 relative group">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditLoan(loan)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
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
                          <span className="text-sm text-gray-600">Loan Amount</span>
                          <span className="font-semibold text-gray-900">
                            Rp {(loan.amount / 1000000000).toFixed(1)}B
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Nisbah / Margin (%)</span>
                          <span className="font-semibold text-gray-900">{loan.margin_rate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Monthly Payment</span>
                          <span className="font-semibold text-blue-600">
                            Rp {(loan.monthly_payment / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Remaining Balance</span>
                          <span className="font-semibold text-red-600">
                            Rp {(loan.remaining_balance / 1000000000).toFixed(1)}B
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Repayment Progress</span>
                          <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Mulai: {formatDateID(loan.start_date)}</span>
                          <span>Berakhir: {formatDateID(loan.end_date)}</span>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-6">Expense Distribution</h3>
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
                              cat.color === 'blue' ? 'bg-blue-600' :
                              cat.color === 'green' ? 'bg-green-600' :
                              cat.color === 'orange' ? 'bg-orange-600' :
                              'bg-purple-600'
                            }`}
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-6">Budget vs Actual</h3>
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
                              {percentage.toFixed(0)}% of budget
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span>Budget: Rp {(budget / 1000000).toFixed(0)}M</span>
                            <span>Actual: Rp {(cat.amount / 1000000).toFixed(0)}M</span>
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

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  {transactions.filter((t: Transaction) => t.status === 'pending').map((transaction: Transaction) => (
                    <div key={transaction.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.category}</p>
                          <p className="text-sm text-gray-600">{formatDateID(transaction.date)}</p>
                        </div>
                        <p className="text-base font-bold text-orange-600">
                          Rp {(transaction.amount / 1000000).toFixed(0)}M
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            api.put(`/transactions/${transaction.id}`, { ...transaction, status: 'approved' })
                              .then(() => fetchData());
                          }}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            api.put(`/transactions/${transaction.id}`, { ...transaction, status: 'rejected' })
                              .then(() => fetchData());
                          }}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'reports') && (
            <div className="space-y-4">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  {activeTab === 'reports' ? 'Laporan Bagi Hasil Per Dapur' :
                   activeTab === 'sewa' ? 'Laporan Sewa Dapur' :
                   activeTab === 'margin' ? 'Laporan Selisih Bahan (60:20:20)' :
                   activeTab === 'operasional' ? 'Laporan Operasional Dapur' :
                   'Laporan Realisasi Bagi Hasil Investor'}
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cari Dapur berdasarkan nama..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={kitchenSearchQuery}
                      onChange={(e) => setKitchenSearchQuery(e.target.value)}
                    />
                    <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                  <select 
                    className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    value={selectedKitchenId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedKitchenId(id);
                      fetchReport(id);
                    }}
                  >
                    <option value="">Pilih Dapur Result...</option>
                    {filteredKitchens.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => selectedKitchenId && fetchReport(selectedKitchenId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Refresh Laporan
                  </button>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>💡 Info Skema Keuangan:</strong> Perhitungan di bawah ini didasarkan pada alur kerja MBG. 
                    <strong> Modal Rp15.000/porsi</strong> (Rp5rb Operasional, Rp10rb Bahan Baku). 
                    Selisih bersih bahan baku setelah dikurangi biaya tetap <strong>Rp15jt (Honor 4 Tenaga Utama)</strong> 
                    dibagi dengan rasio <strong>60% DPP : 20% DPD : 20% Koperasi</strong>.
                  </p>
                </div>
              </div>

              {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {/* Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                      <h4 className="font-bold text-gray-900">{reportData.dapur_name}</h4>
                      <p className="text-sm text-gray-500">Skema: {reportData.type}</p>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tanggal Masuk Dana</p>
                          <p className="text-sm font-bold text-gray-900">{reportData.period ? formatDateID(reportData.period) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Laporan</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            reportData.record_status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {reportData.record_status || 'PENDING'}
                          </span>
                        </div>
                      </div>

                      {(activeTab === 'reports' || activeTab === 'sewa') && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Pendapatan Sewa (Gross)</span>
                          <span className="font-bold text-gray-900">Rp {reportData.rental_income.toLocaleString()}</span>
                        </div>
                      )}
                      {(activeTab === 'reports' || activeTab === 'margin' || activeTab === 'operasional') && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Selisih Bahan Baku (Gross)</span>
                          <span className="font-bold text-gray-900">Rp {reportData.selisih_bahan_baku.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {/* Tracking Tambahan Sesuai Muktamar */}
                      <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Transfer Investor</span>
                          <span className="text-xs font-black text-slate-700">
                            {reportData.record_status === 'APPROVED' ? 'Sudah Ditransfer' : 'Menunggu Approval'}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase text-right">Estimasi Transfer</span>
                          <span className="text-xs font-black text-slate-700">
                             {reportData.period ? formatDateID(new Date(new Date(reportData.period).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString()) : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Sisa Bersih (Net)</span>
                        <span className="text-lg font-black text-blue-600">Rp {reportData.sisa_bersih.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                       <PieChart className="w-5 h-5 text-blue-600" />
                       Rincian Pembagian (Split)
                    </h4>
                    <div className="space-y-4">
                      {/* Rental Split & Investor */}
                      {(activeTab === 'reports' || activeTab === 'investasi' || activeTab === 'sewa') && (
                        <div className="space-y-2">
                          <p className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nisbah / Margin (%)</p>
                          <div className="grid grid-cols-1 gap-2">
                             {(activeTab === 'reports' || activeTab === 'investasi') && reportData.investor_share > 0 && (
                               <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                 <span className="text-sm font-medium">Bagian Investor</span>
                                 <span className="font-bold">Rp {reportData.investor_share.toLocaleString()}</span>
                               </div>
                             )}
                             {(activeTab === 'reports' || activeTab === 'sewa') && (
                               <>
                                 <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                   <span className="text-sm font-medium text-blue-800">Bagian DPP Wahdah</span>
                                   <span className="font-bold text-blue-900">Rp {reportData.dpp_share_sewa.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                   <span className="text-sm font-medium text-indigo-800">Bagian YWMP</span>
                                   <span className="font-bold text-indigo-900">Rp {reportData.ywmp_share_sewa.toLocaleString()}</span>
                                 </div>
                               </>
                             )}
                          </div>
                        </div>
                      )}

                      {/* Margin Split */}
                      {(activeTab === 'reports' || activeTab === 'margin') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bagi Hasil Selisih Bahan</p>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">60:20:20 Split</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                             <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                               <div>
                                 <span className="text-sm font-medium text-blue-800">DPP Wahdah (60%)</span>
                                 <p className="text-[10px] text-blue-600">Pusat Management</p>
                               </div>
                               <span className="font-bold text-blue-900">Rp {reportData.dpp_share_selisih.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                               <div>
                                 <span className="text-sm font-medium text-emerald-800">DPD (20%)</span>
                                 <p className="text-[10px] text-emerald-600">Daerah Pelaksana</p>
                               </div>
                               <span className="font-bold text-emerald-900">Rp {reportData.dpd_share_selisih.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                               <div>
                                 <span className="text-sm font-medium text-purple-800">Koperasi (20%)</span>
                                 <p className="text-[10px] text-purple-600">Penyedia Bahan Baku</p>
                               </div>
                               <span className="font-bold text-purple-900">Rp {reportData.kop_share_selisih.toLocaleString()}</span>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      
          {activeTab === 'investasi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Realisasi Investasi per Dapur</h3>
                <p className="text-sm text-gray-500 mb-4">Pantau persentase Return on Investment (ROI) dari masing-masing dapur.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kitchens.filter(k => k.accumulated_profit > 0).map((kitchen: any) => {
                    const target = kitchen.initial_capital * 1.5;
                    const percentage = Math.min((kitchen.accumulated_profit / target) * 100, 100);
                    return (
                      <div key={kitchen.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between mb-3">
                           <div>
                              <h4 className="font-bold text-gray-900">{kitchen.name}</h4>
                              <p className="text-xs text-gray-500">Target BEP + 50% Profit</p>
                           </div>
                           <span className="text-[10px] font-black text-[#1A4D43] bg-[#E6F3F0] px-2 py-1 rounded-full h-fit">
                              {percentage.toFixed(1)}% RECOVERED
                           </span>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 mb-2 overflow-hidden border border-gray-200">
                           <div className="h-full bg-gradient-to-r from-[#2BBF9D] to-[#1A4D43]" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                           <span>Rlz: Rp {(kitchen.accumulated_profit / 1000000).toFixed(1)}M</span>
                           <span>Trg: Rp {(target / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sewa' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5">
                 <h3 className="text-lg font-bold text-blue-900 mb-1">Distribusi Sewa Dapur</h3>
                 <p className="text-xs text-blue-700">Tampilan rekapitulasi Gross Pendapatan Sewa Dapur dan rincian bagi hasil ke Pusat Manajemen.</p>
              </div>
              <div className="flex gap-3">
                 <select className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 bg-white" value={selectedKitchenId || ''} onChange={(e) => { const id = Number(e.target.value); setSelectedKitchenId(id); fetchReport(id); }}>
                    <option value="">Pilih Dapur...</option>
                    {filteredKitchens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                 </select>
                 <button onClick={() => selectedKitchenId && fetchReport(selectedKitchenId)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">Muat Data</button>
              </div>
              {reportData && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                       <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Gross Pendapatan Sewa</h4>
                       <span className="text-2xl font-black text-gray-900">Rp {reportData.rental_income.toLocaleString()}</span>
                       <div className="mt-4 pt-4 border-t border-gray-100">
                         <p className="text-[10px] text-gray-500">Status: <span className="font-bold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">{reportData.record_status || 'APPROVED'}</span></p>
                       </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3">
                       <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Alokasi Dana Pusat</h4>
                       <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <div>
                           <p className="font-bold text-blue-900 text-sm">DPP Wahdah</p>
                           <p className="text-[10px] text-blue-700">Manajemen Pusat</p>
                         </div>
                         <span className="text-lg font-bold text-blue-900">Rp {reportData.dpp_share_sewa.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                         <div>
                           <p className="font-bold text-indigo-900 text-sm">YWMP</p>
                           <p className="text-[10px] text-indigo-700">Yayasan</p>
                         </div>
                         <span className="text-lg font-bold text-indigo-900">Rp {reportData.ywmp_share_sewa.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {activeTab === 'margin' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg p-5">
                 <h3 className="text-lg font-bold text-emerald-900 mb-1">Selisih Bahan Baku (Koperasi)</h3>
                 <p className="text-xs text-emerald-700">Pemantauan margin terpusat. Dibagi dengan rasio 60% DPP, 20% DPD, 20% Koperasi.</p>
              </div>
              <div className="flex gap-3">
                 <select className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 bg-white" value={selectedKitchenId || ''} onChange={(e) => { const id = Number(e.target.value); setSelectedKitchenId(id); fetchReport(id); }}>
                    <option value="">Pilih Dapur...</option>
                    {filteredKitchens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                 </select>
                 <button onClick={() => selectedKitchenId && fetchReport(selectedKitchenId)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm">Muat Data</button>
              </div>
              {reportData && (
                 <div className="space-y-4">
                   <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Margin Kotor</h4>
                        <span className="text-xl font-black text-gray-900">Rp {reportData.selisih_bahan_baku.toLocaleString()}</span>
                      </div>
                      <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                      <div className="text-right">
                        <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Sisa Bersih (Didistribusikan)</h4>
                        <span className="text-xl font-black text-emerald-600">Rp {reportData.sisa_bersih.toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-blue-500">
                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">60% Porsi</p>
                         <p className="text-sm font-bold text-gray-900 mb-1">DPP Wahdah</p>
                         <p className="text-lg font-black text-blue-600">Rp {reportData.dpp_share_selisih.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-emerald-500">
                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">20% Porsi</p>
                         <p className="text-sm font-bold text-gray-900 mb-1">DPD Pelaksana</p>
                         <p className="text-lg font-black text-emerald-600">Rp {reportData.dpd_share_selisih.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-purple-500">
                         <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">20% Porsi</p>
                         <p className="text-sm font-bold text-gray-900 mb-1">Koperasi</p>
                         <p className="text-lg font-black text-purple-600">Rp {reportData.kop_share_selisih.toLocaleString()}</p>
                      </div>
                   </div>
                 </div>
              )}
            </div>
          )}

          {activeTab === 'operasional' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-5">
                 <h3 className="text-lg font-bold text-orange-900 mb-1">Kinerja Operasional Dapur</h3>
                 <p className="text-xs text-orange-700">Mencatat pengeluaran tetap bulanan termasuk Honor Kepala Dapur, Akuntan, dan Staff operasional.</p>
              </div>
              <div className="flex gap-3">
                 <select 
                    className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:bg-gray-50" 
                    value={selectedKitchenId || ''} 
                    disabled={profile?.role === 'PIC Dapur'}
                    onChange={(e) => { const id = Number(e.target.value); setSelectedKitchenId(id); fetchReport(id); }}
                 >
                    <option value="">Pilih Dapur...</option>
                    {filteredKitchens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                 </select>
                 <button onClick={() => selectedKitchenId && fetchReport(selectedKitchenId)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm">Muat Data</button>
              </div>
              
              {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-orange-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-orange-600" /></div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Alokasi Dana Operasional</h4>
                          <p className="text-[10px] text-gray-500">Estimasi dari Rp 5.000/porsi</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">Honor Tetap Staff (Per Bulan)</span>
                          <span className="font-bold text-red-600">- Rp 6.000.000</span>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">Potongan Tenaga Utama Dapur</span>
                          <span className="font-bold text-red-600">- Rp 15.000.000</span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Tracking BGN</h4>
                      <p className="text-xs text-gray-600 mb-4 border-b border-gray-100 pb-3">
                        Dapur ini telah tersinkronisasi dengan pelaporan pusat. Penggunaan dana BGN per termin diteruskan untuk pembayaran gaji operasional.
                      </p>
                      <div className="flex justify-between text-xs">
                         <span className="text-gray-500 uppercase font-bold tracking-wider">Status Termin:</span>
                         <span className="font-black text-green-600">SELESAI DITRANSFER</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

      {/* Transaction Modal */}
      {isTransModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4">
            <h2 className="text-lg font-bold mb-4">{editingTrans ? 'Edit Transaction' : 'New Transaction'}</h2>
            <form onSubmit={handleTransSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <h2 className="text-lg font-bold mb-4">{editingLoan ? 'Edit Loan' : 'New Loan'}</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Balance</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
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
                  <option value="active">Active</option>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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
          <div className="bg-white rounded-xl max-w-lg w-full p-4 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#E2F8F3] p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#2BBF9D]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#1A4D43]">Lapor Dana BGN</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Input dana masuk per 10 hari</p>
              </div>
            </div>
            
            <form onSubmit={handleBGNSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    required
                    value={bgnForm.date}
                    onChange={e => setBgnForm({...bgnForm, date: e.target.value})}
                    className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Periode Termin</label>
                  <select 
                    value={bgnForm.period}
                    onChange={e => setBgnForm({...bgnForm, period: e.target.value})}
                    className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  >
                    <option value="Tgl 1-10">Tgl 1-10</option>
                    <option value="Tgl 11-20">Tgl 11-20</option>
                    <option value="Tgl 21-30">Tgl 21-30</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jumlah Dana (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                  <input 
                    type="number" 
                    required
                    placeholder="Contoh: 150000000"
                    value={bgnForm.amount || ''}
                    onChange={e => setBgnForm({...bgnForm, amount: Number(e.target.value)})}
                    className="w-full border border-gray-100 rounded-lg pl-12 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ref/Bukti Transfer</label>
                <input 
                  type="text" 
                  placeholder="Nomor referensi atau link bukti"
                  required
                  value={bgnForm.proof_ref}
                  onChange={e => setBgnForm({...bgnForm, proof_ref: e.target.value})}
                  className="w-full border border-gray-100 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsBGNModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-100 rounded-lg hover:bg-gray-50 font-bold text-gray-500 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1A4D43] text-white rounded-lg hover:bg-[#1A4D43]/90 font-bold transition-all shadow-lg shadow-[#1A4D43]/20 active:scale-95"
                >
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

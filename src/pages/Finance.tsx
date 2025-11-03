import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, XCircle } from 'lucide-react';

const mockTransactions = [
  { id: 1, date: '2024-03-15', type: 'income', category: 'BGN Fund Transfer', amount: 500000000, status: 'approved' },
  { id: 2, date: '2024-03-14', type: 'expense', category: 'Kitchen Operations', amount: 125000000, status: 'approved' },
  { id: 3, date: '2024-03-13', type: 'expense', category: 'Payroll', amount: 85000000, status: 'approved' },
  { id: 4, date: '2024-03-12', type: 'expense', category: 'Procurement', amount: 95000000, status: 'pending' },
  { id: 5, date: '2024-03-11', type: 'income', category: 'Investment Partnership', amount: 300000000, status: 'approved' },
  { id: 6, date: '2024-03-10', type: 'expense', category: 'Construction Payment', amount: 255000000, status: 'approved' },
];

const mockLoans = [
  { id: 1, number: 'LOAN-2023-001', lender: 'Bank Mandiri', amount: 5000000000, interestRate: 8.5, monthlyPayment: 185000000, remainingBalance: 3200000000, status: 'active', startDate: '2023-06-01', endDate: '2026-06-01' },
  { id: 2, number: 'LOAN-2023-002', lender: 'PT Investor Maju', amount: 2000000000, interestRate: 10.0, monthlyPayment: 85000000, remainingBalance: 1500000000, status: 'active', startDate: '2023-08-15', endDate: '2025-08-15' },
];

const expenseCategories = [
  { category: 'Kitchen Operations', amount: 450000000, percentage: 35, color: 'blue' },
  { category: 'Payroll', amount: 360000000, percentage: 28, color: 'green' },
  { category: 'Construction', amount: 320000000, percentage: 25, color: 'orange' },
  { category: 'Procurement', amount: 155000000, percentage: 12, color: 'purple' },
];

export const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'loans' | 'expenses'>('dashboard');

  const totalIncome = mockTransactions
    .filter(t => t.type === 'income' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = mockTransactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashFlow = totalIncome - totalExpense;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Monitor cash flow, expenses, and funding</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          New Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'loans'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Funding & Loans
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'expenses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Expense Tracking
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-green-600 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700 font-medium mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">
                    Rp {(totalIncome / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-green-600 mt-2">+15% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-red-600 p-3 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-700 font-medium mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">
                    Rp {(totalExpense / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-red-600 mt-2">+8% from last month</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Net Cash Flow</p>
                  <p className="text-2xl font-bold text-blue-900">
                    Rp {(cashFlow / 1000000000).toFixed(1)}B
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Positive flow</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expense</h3>
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

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Repayment Progress</h3>
                  <div className="space-y-4">
                    {mockLoans.map((loan) => {
                      const percentage = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
                      return (
                        <div key={loan.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-900 font-medium">{loan.lender}</span>
                            <span className="text-xs text-gray-600">{percentage.toFixed(0)}% paid</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Remaining: Rp {(loan.remainingBalance / 1000000000).toFixed(1)}B</span>
                            <span>Monthly: Rp {(loan.monthlyPayment / 1000000).toFixed(0)}M</span>
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
              {mockTransactions.map((transaction) => {
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
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}Rp {(transaction.amount / 1000000).toFixed(0)}M
                        </p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockLoans.map((loan) => {
                  const paidAmount = loan.amount - loan.remainingBalance;
                  const percentage = (paidAmount / loan.amount) * 100;

                  return (
                    <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{loan.number}</h3>
                          <p className="text-sm text-gray-600">{loan.lender}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
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
                          <span className="text-sm text-gray-600">Interest Rate</span>
                          <span className="font-semibold text-gray-900">{loan.interestRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Monthly Payment</span>
                          <span className="font-semibold text-blue-600">
                            Rp {(loan.monthlyPayment / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Remaining Balance</span>
                          <span className="font-semibold text-red-600">
                            Rp {(loan.remainingBalance / 1000000000).toFixed(1)}B
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
                          <span>Start: {loan.startDate}</span>
                          <span>End: {loan.endDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">BGN Fund Transfers</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">March 2024 Transfer</p>
                      <p className="text-sm text-gray-600">Received: March 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+Rp 500M</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">February 2024 Transfer</p>
                      <p className="text-sm text-gray-600">Received: February 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+Rp 500M</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
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

                <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget vs Actual</h3>
                  <div className="space-y-4">
                    {expenseCategories.map((cat) => {
                      const budget = cat.amount * 1.2;
                      const percentage = (cat.amount / budget) * 100;
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

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  {mockTransactions.filter(t => t.status === 'pending').map((transaction) => (
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
                        <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Approve
                        </button>
                        <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

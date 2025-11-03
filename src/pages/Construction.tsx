import React, { useState } from 'react';
import { Building2, FileText, TrendingUp, Image, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const mockContracts = [
  { id: 1, number: 'CTR-2024-001', vendor: 'PT Bangun Jaya', kitchen: 'Dapur Surabaya Timur', value: 850000000, progress: 68, status: 'ongoing', startDate: '2024-01-15', endDate: '2024-06-15' },
  { id: 2, number: 'CTR-2024-002', vendor: 'CV Konstruksi Maju', kitchen: 'Dapur Jakarta Timur', value: 920000000, progress: 45, status: 'ongoing', startDate: '2024-02-01', endDate: '2024-07-01' },
  { id: 3, number: 'CTR-2023-089', vendor: 'PT Karya Utama', kitchen: 'Dapur Semarang', value: 750000000, progress: 100, status: 'completed', startDate: '2023-10-01', endDate: '2024-03-01' },
  { id: 4, number: 'CTR-2024-003', vendor: 'PT Mandiri Konstruksi', kitchen: 'Dapur Yogyakarta', value: 680000000, progress: 35, status: 'delayed', startDate: '2024-01-20', endDate: '2024-06-20' },
];

const mockProgress = [
  { id: 1, contractId: 1, date: '2024-03-01', percentage: 68, notes: 'Foundation complete, wall construction in progress', termin: 3, amount: 255000000, paymentStatus: 'paid' },
  { id: 2, contractId: 1, date: '2024-02-15', percentage: 50, notes: 'Foundation work completed', termin: 2, amount: 212500000, paymentStatus: 'paid' },
  { id: 3, contractId: 1, date: '2024-01-20', percentage: 25, notes: 'Site preparation and excavation complete', termin: 1, amount: 212500000, paymentStatus: 'paid' },
];

export const Construction: React.FC = () => {
  const [selectedContract, setSelectedContract] = useState(mockContracts[0]);
  const [activeTab, setActiveTab] = useState<'contracts' | 'progress'>('contracts');

  const getStatusBadge = (status: string) => {
    const styles = {
      ongoing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      delayed: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.ongoing;
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengawasan Pembangunan</h1>
          <p className="text-gray-600 mt-1">Monitor kontrak dan progress pembangunan dapur</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Tambah Kontrak
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'contracts'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Contract List
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'progress'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Progress Tracking
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'contracts' && (
                <div className="space-y-4">
                  {mockContracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedContract.id === contract.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{contract.number}</h3>
                          <p className="text-sm text-gray-600">{contract.vendor}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(contract.status)}`}>
                          {contract.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">{contract.kitchen}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          Rp {(contract.value / 1000000).toFixed(0)}M
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Progress</span>
                          <span className="font-medium">{contract.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${contract.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart Timeline</h3>
                    <div className="space-y-3">
                      {mockContracts.filter(c => c.status !== 'completed').map((contract) => (
                        <div key={contract.id} className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{contract.kitchen}</span>
                            <span className="text-xs text-gray-500">
                              {contract.startDate} - {contract.endDate}
                            </span>
                          </div>
                          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                              style={{ width: `${contract.progress}%` }}
                            >
                              <span className="text-xs font-medium text-white">
                                {contract.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Updates</h3>
                    <div className="space-y-4">
                      {mockProgress.map((progress) => (
                        <div key={progress.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 mb-1">
                                  Progress: {progress.percentage}%
                                </p>
                                <p className="text-sm text-gray-600">{progress.notes}</p>
                                <p className="text-xs text-gray-500 mt-1">{progress.date}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(progress.paymentStatus)}`}>
                              {progress.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>Termin {progress.termin}: Rp {(progress.amount / 1000000).toFixed(0)}M</span>
                            </div>
                            <button className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium">
                              View Details
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

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Contract Number</p>
                <p className="font-medium text-gray-900">{selectedContract.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendor</p>
                <p className="font-medium text-gray-900">{selectedContract.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Kitchen</p>
                <p className="font-medium text-gray-900">{selectedContract.kitchen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                <p className="font-semibold text-lg text-blue-600">
                  Rp {(selectedContract.value / 1000000).toFixed(0)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Period</p>
                <p className="text-sm text-gray-900">
                  {selectedContract.startDate} - {selectedContract.endDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedContract.status)}`}>
                  {selectedContract.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Documentation</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-300"
                >
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              View All Photos
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Request Revision
              </button>
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

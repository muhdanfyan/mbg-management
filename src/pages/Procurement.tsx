import React, { useState } from 'react';
import { ShoppingCart, Package, FileText, Search, Filter, QrCode, TrendingUp, AlertCircle } from 'lucide-react';

const mockEquipment = [
  { id: 1, name: 'Industrial Oven', category: 'Cooking Equipment', price: 45000000, stock: 5, supplier: 'PT Kitchen Pro', status: 'available', image: '🔥' },
  { id: 2, name: 'Commercial Refrigerator', category: 'Storage', price: 35000000, stock: 8, supplier: 'CV Cold Storage', status: 'available', image: '❄️' },
  { id: 3, name: 'Food Processor Large', category: 'Processing', price: 25000000, stock: 2, supplier: 'PT Foodtech', status: 'low_stock', image: '⚙️' },
  { id: 4, name: 'Industrial Gas Stove', category: 'Cooking Equipment', price: 18000000, stock: 12, supplier: 'PT Kitchen Pro', status: 'available', image: '🔥' },
  { id: 5, name: 'Stainless Steel Work Table', category: 'Furniture', price: 8500000, stock: 0, supplier: 'CV Furniture Industri', status: 'out_of_stock', image: '🪑' },
  { id: 6, name: 'Commercial Dishwasher', category: 'Cleaning', price: 42000000, stock: 6, supplier: 'PT Clean Tech', status: 'available', image: '🧼' },
];

const mockPOs = [
  { id: 1, number: 'PO-2024-089', supplier: 'PT Kitchen Pro', items: 5, total: 125000000, status: 'approved', date: '2024-03-15' },
  { id: 2, number: 'PO-2024-088', supplier: 'CV Cold Storage', items: 3, total: 95000000, status: 'waiting_approval', date: '2024-03-14' },
  { id: 3, number: 'PO-2024-087', supplier: 'PT Foodtech', items: 8, total: 185000000, status: 'delivered', date: '2024-03-10' },
  { id: 4, number: 'PO-2024-086', supplier: 'PT Clean Tech', items: 4, total: 156000000, status: 'draft', date: '2024-03-13' },
];

export const Procurement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'po' | 'inventory'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStockStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      low_stock: 'bg-orange-100 text-orange-700',
      out_of_stock: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.available;
  };

  const getPOStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      waiting_approval: 'bg-orange-100 text-orange-700',
      approved: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const filteredEquipment = mockEquipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600 mt-1">Kelola equipment dan purchase orders</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Create New PO
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Equipment Catalog
            </button>
            <button
              onClick={() => setActiveTab('po')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'po'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Inventory
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Cooking Equipment">Cooking Equipment</option>
                  <option value="Storage">Storage</option>
                  <option value="Processing">Processing</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipment.map((equipment) => (
                  <div key={equipment.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 h-48 flex items-center justify-center text-6xl">
                      {equipment.image}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{equipment.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusBadge(equipment.status)}`}>
                          {equipment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{equipment.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-blue-600">
                          Rp {(equipment.price / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {equipment.stock}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Supplier: {equipment.supplier}
                      </p>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Add to PO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'po' && (
            <div className="space-y-4">
              {mockPOs.map((po) => (
                <div key={po.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{po.number}</h3>
                        <p className="text-sm text-gray-600">{po.supplier}</p>
                        <p className="text-xs text-gray-500 mt-1">{po.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPOStatusBadge(po.status)}`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="text-sm font-medium text-gray-900">{po.items} items</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="text-sm font-semibold text-blue-600">
                        Rp {(po.total / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {po.status === 'waiting_approval' ? 'Pending' : po.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    {po.status === 'waiting_approval' && (
                      <>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-blue-900">{mockEquipment.length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-sm text-orange-700 font-medium mb-1">Low Stock Items</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {mockEquipment.filter(e => e.status === 'low_stock').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700 font-medium mb-1">Available Items</p>
                  <p className="text-3xl font-bold text-green-900">
                    {mockEquipment.filter(e => e.status === 'available').length}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate and manage QR codes for equipment tracking
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockEquipment.slice(0, 4).map((equipment) => (
                    <div key={equipment.id} className="border border-gray-200 rounded-lg p-4 text-center">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-900 mb-1">{equipment.name}</p>
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        Download QR
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Industrial Oven - Routine Check</p>
                      <p className="text-sm text-gray-600">Next maintenance: March 25, 2024</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Due Soon
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Commercial Refrigerator - Annual Service</p>
                      <p className="text-sm text-gray-600">Next maintenance: April 10, 2024</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

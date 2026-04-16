import React, { useState } from 'react';
import { ShoppingCart, Package, FileText, Search, Filter, QrCode, TrendingUp, AlertCircle, Plus, Edit, Trash2, Activity } from 'lucide-react';
import { api, Equipment, PurchaseOrder } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Procurement: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'inventory'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  const [auditForm, setAuditForm] = useState({
    date: new Date().toISOString().split('T')[0],
    invoice_amount: 0, // Harga Nota
    market_amount: 0,  // Harga Real Pasar
    portions: 0,
    items: '',
    kitchen_id: profile?.kitchen_id || null
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const isRestricted = profile?.role === 'PIC Dapur' || profile?.role === 'Operator Koperasi';
      const params = isRestricted && profile?.kitchen_id ? { kitchen_id: profile.kitchen_id } : undefined;

      const [equipData, ordersData] = await Promise.all([
        api.get('/equipment', params),
        api.get('/purchase-orders', params)
      ]);
      setEquipment(Array.isArray(equipData) ? equipData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to fetch procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/audit-spending', {
        kitchen_id: Number(auditForm.kitchen_id || profile?.kitchen_id),
        invoice_amount: auditForm.invoice_amount,
        market_amount: auditForm.market_amount,
        portions: auditForm.portions,
        date: auditForm.date,
        note: auditForm.items
      });

      // Juga simpan sebagai PO untuk record inventaris (Opsional tapi bagus untuk ledger)
      await api.post('/purchase-orders', {
        number: `AUDIT-${Date.now()}`,
        supplier: 'Audit Belanja Harian',
        total_amount: auditForm.invoice_amount,
        date: auditForm.date,
        status: 'delivered',
        notes: `Porsi: ${auditForm.portions}, Item: ${auditForm.items} | Selisih Audit: Rp ${auditForm.invoice_amount - auditForm.market_amount}`
      });

      setIsAuditModalOpen(false);
      fetchData();
      window.history.replaceState({}, '', window.location.pathname);
      alert('Audit Belanja Berhasil Disimpan!');
    } catch (error: any) {
      alert('Gagal Simpan Audit: ' + (error.response?.data?.error || error.message));
    }
  };

  React.useEffect(() => {
    fetchData();
    // Check for query actions
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'audit-belanja') {
      setIsAuditModalOpen(true);
    }
  }, []);

  const handleDeleteEquipment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await api.delete(`/equipment/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete equipment');
      }
    }
  };

  const handleDeletePO = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await api.delete(`/purchase-orders/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete PO');
      }
    }
  };

  const getStockStatusBadge = (status: string) => {
    const styles = {
      in_stock: 'bg-green-100 text-green-700',
      low_stock: 'bg-orange-100 text-orange-700',
      out_of_stock: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.in_stock;
  };

  const getPOStatusBadge = (status: string) => {
    const styles = {
      ordered: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.ordered;
  };

  const filteredEquipment = (equipment || []).filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement & Inventory</h1>
          <p className="text-gray-600 mt-1">Kelola pengadaan peralatan dan inventaris dapur</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingEquipment(null);
              setIsEquipmentModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Alat
          </button>
          <button 
            onClick={() => setIsPOModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Buat PO
          </button>
          {(profile?.role === 'Super Admin' || profile?.role === 'Operator Koperasi') && (
            <button 
              onClick={() => {
                setAuditForm({
                  date: new Date().toISOString().split('T')[0],
                  invoice_amount: 0,
                  market_amount: 0,
                  portions: 0,
                  items: '',
                  kitchen_id: profile?.kitchen_id || null
                });
                setIsAuditModalOpen(true);
              }}
              className="bg-[#1A4D43] text-white px-4 py-2 rounded-lg hover:bg-[#1A4D43]/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-5 h-5" />
              Audit Belanja
            </button>
          )}
        </div>
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
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
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
              Inventory Management
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditingEquipment(item);
                            setIsEquipmentModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-blue-600 font-bold">Rp {(item.price || 0).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-medium ${getStockStatusBadge(item.status || 'in_stock')}`}>
                        {(item.status || 'in_stock').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">PO Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Supplier</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{po.number}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{po.supplier}</td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-900">Rp {(po.total_amount || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{po.date}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPOStatusBadge(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingPO(po);
                              setIsPOModalOpen(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleDeletePO(po.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">QR Code Management</h3>
                <p className="text-sm text-gray-600 mb-6">Scan atau cetak QR code baru untuk peralatan dapur</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Generate Labels</button>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Inventory Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Total Assets</span>
                      <span className="font-medium">1,204 Units</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 mb-1">Stock Alerts</p>
                      <p className="text-lg font-bold text-red-700">12 Items</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Active Assets</p>
                      <p className="text-lg font-bold text-green-700">1,192 Units</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Modal */}
      {isEquipmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                name: formData.get('name'),
                category: formData.get('category'),
                price: parseInt(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                stock_status: formData.get('stock_status'),
                supplier: formData.get('supplier'),
              };
              try {
                if (editingEquipment) {
                  await api.put(`/equipment/${editingEquipment.id}`, data);
                } else {
                  await api.post('/equipment', data);
                }
                setIsEquipmentModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Failed to save equipment');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Equipment Name</label>
                  <input name="name" defaultValue={editingEquipment?.name} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input name="category" defaultValue={editingEquipment?.category} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (IDR)</label>
                    <input name="price" type="number" defaultValue={editingEquipment?.price} required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Units</label>
                    <input name="stock" type="number" defaultValue={editingEquipment?.stock} required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Status</label>
                  <select name="stock_status" defaultValue={editingEquipment?.stock_status || 'in_stock'} className="mt-1 w-full border rounded-lg p-2">
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Supplier</label>
                  <input name="supplier" defaultValue={editingEquipment?.supplier} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsEquipmentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                number: editingPO?.number || `PO-${Date.now()}`,
                supplier: formData.get('supplier'),
                total_amount: parseInt(formData.get('total_amount') as string),
                date: formData.get('date') || new Date().toISOString().split('T')[0],
                status: formData.get('status') || 'ordered',
              };
              try {
                if (editingPO) {
                  await api.put(`/purchase-orders/${editingPO.id}`, data);
                } else {
                  await api.post('/purchase-orders', data);
                }
                setIsPOModalOpen(false);
                setEditingPO(null);
                fetchData();
              } catch (error) {
                alert('Failed to save PO');
              }
            }}>
              <div className="space-y-4">
                {editingPO && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PO Number</label>
                    <input value={editingPO.number} disabled className="mt-1 w-full border rounded-lg p-2 bg-gray-50" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                  <input name="supplier" defaultValue={editingPO?.supplier} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount (IDR)</label>
                  <input name="total_amount" type="number" defaultValue={editingPO?.total_amount} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                {editingPO && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" defaultValue={editingPO.status} className="mt-1 w-full border rounded-lg p-2">
                      <option value="ordered">Ordered</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => {
                  setIsPOModalOpen(false);
                  setEditingPO(null);
                }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingPO ? 'Update PO' : 'Create PO'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Belanja Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#E2F8F3] p-3 rounded-xl">
                <Activity className="w-6 h-6 text-[#2BBF9D]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A4D43]">Audit Belanja Harian</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Validasi biaya bahan baku per porsi</p>
              </div>
            </div>
            
            <form onSubmit={handleAuditSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Belanja</label>
                  <input 
                    type="date" 
                    required
                    value={auditForm.date}
                    onChange={e => setAuditForm({...auditForm, date: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Jumlah Porsi</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Contoh: 500"
                    value={auditForm.portions || ''}
                    onChange={e => setAuditForm({...auditForm, portions: Number(e.target.value)})}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Nota / Kwitansi</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input 
                      type="number" 
                      required
                      placeholder="Harga Nota"
                      value={auditForm.invoice_amount || ''}
                      onChange={e => setAuditForm({...auditForm, invoice_amount: Number(e.target.value)})}
                      className="w-full border border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Harga Real Pasar</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input 
                      type="number" 
                      required
                      placeholder="Harga Pasar"
                      value={auditForm.market_amount || ''}
                      onChange={e => setAuditForm({...auditForm, market_amount: Number(e.target.value)})}
                      className="w-full border border-gray-100 rounded-xl pl-12 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all outline-none font-bold text-orange-700"
                    />
                  </div>
                </div>
              </div>

              {(auditForm.invoice_amount > 0 || auditForm.market_amount > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Selisih Audit</p>
                    <p className={`text-sm font-bold ${auditForm.invoice_amount - auditForm.market_amount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      Rp {(auditForm.invoice_amount - auditForm.market_amount).toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    auditForm.invoice_amount / (auditForm.portions || 1) > 10000 
                    ? 'bg-red-50 border-red-100 text-red-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    <p className="text-[9px] font-black uppercase mb-1">Biaya / Porsi</p>
                    <p className="text-sm font-bold">
                      Rp {(auditForm.invoice_amount / (auditForm.portions || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Belanja Utama</label>
                <textarea 
                  placeholder="Contoh: Beras 50kg, Ayam 25kg, Sayuran..."
                  required
                  rows={2}
                  value={auditForm.items}
                  onChange={e => setAuditForm({...auditForm, items: e.target.value})}
                  className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2BBF9D] focus:border-transparent transition-all outline-none resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 font-bold text-gray-500 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                    auditForm.total_cost / auditForm.portions > 10000 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                    : 'bg-[#1A4D43] hover:bg-[#1A4D43]/90 shadow-[#1A4D43]/10'
                  }`}
                >
                  Simpan Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Building2, ImageIcon, DollarSign, CheckCircle, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, Contract, ProgressUpdate, getImageUrl, Sppg } from '../services/api';

export const Construction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'updates'>('contracts');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [sppgsList, setSppgsList] = useState<Sppg[]>([]);
  const [loading, setLoading] = useState(true);
  const [sppgs, setSppgs] = useState<any[]>([]);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<ProgressUpdate | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || "";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractData, updateData, sppgsData] = await Promise.all([
        api.get('/contracts'),
        api.get('/progress-updates'),
        api.get('/sppgs')
      ]);
      setContracts(contractData);
      setUpdates(updateData);
      setSppgsList(sppgsData);
    } catch (error) {
      console.error('Failed to fetch construction data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteContract = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await api.delete(`/contracts/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete contract');
      }
    }
  };

  const handleDeleteUpdate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this progress update?')) {
      try {
        await api.delete(`/progress-updates/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete update');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-orange-100 text-orange-700'
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      partially_paid: 'bg-blue-100 text-blue-700',
      pending: 'bg-orange-100 text-orange-700',
      late: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Konstruksi Proyek</h1>
          <p className="text-gray-600 mt-1">Pantau progress pembangunan dan renovasi dapur MBG</p>
        </div>
        <button 
          onClick={() => {
            setEditingContract(null);
            setIsContractModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Building2 className="w-5 h-5" />
          Tambah Kontrak
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'contracts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Manajemen Kontrak
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'updates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Update Progress
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'contracts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchFilter && (
                <div className="col-span-full bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="font-bold">Filter Aktif:</span> Menampilkan kontrak untuk SPPG ID "{searchFilter}"
                  </div>
                  <button 
                    onClick={() => setSearchParams({})}
                    className="p-1 hover:bg-blue-100 rounded-full text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {contracts
                .filter(c => !searchFilter || (c.sppg_id === searchFilter || c.project_name.toLowerCase().includes(searchFilter.toLowerCase())))
                .map((contract) => (
                <div key={contract.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{contract.project_name}</h3>
                      <p className="text-sm text-gray-500">{contract.vendor_name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setEditingContract(contract);
                          setIsContractModalOpen(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-green-600" />
                      </button>
                      <button 
                         onClick={() => handleDeleteContract(contract.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-bold text-blue-600">{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${contract.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      Rp {(contract.total_value || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Exp: {contract.end_date}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(contract.status)}`}>
                      {contract.status === 'active' ? 'Aktif' : 
                       contract.status === 'completed' ? 'Selesai' : 'Ditunda'}
                    </span>
                    <div className="flex items-center gap-2">
                      {contract.sppg_id && (() => {
                        const matchingSppg = sppgsList.find(s => s.sppg_id === contract.sppg_id);
                        const hasGallery = matchingSppg?.media && matchingSppg.media.length > 0;
                        if (!hasGallery) return null;
                        
                        return (
                          <a 
                            href={`/sppg-gallery?id=${contract.sppg_id}`}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            <ImageIcon className="w-3 h-3" />
                            GALERI
                          </a>
                        );
                      })()}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(contract.payment_status)}`}>
                        {contract.payment_status === 'paid' ? 'Lunas' : 
                         contract.payment_status === 'partially_paid' ? 'Dibayar Sebagian' : 
                         contract.payment_status === 'late' ? 'Terlambat' : 'Menunggu'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setEditingUpdate(null);
                    setIsUpdateModalOpen(true);
                  }}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Update Progress
                </button>
              </div>
              {updates.map((update) => (
                <div key={update.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="aspect-square w-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {update.photo_url ? (
                        <img src={getImageUrl(update.photo_url)} alt="Progress" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{update.task_name}</h4>
                          <p className="text-sm text-gray-500">{update.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-bold mr-2">+{(update.progress_percentage || 0)}%</span>
                          <button 
                             onClick={() => {
                               setEditingUpdate(update);
                               setIsUpdateModalOpen(true);
                             }}
                            className="p-1 hover:bg-white rounded shadow-sm border border-gray-100"
                          >
                            <Edit className="w-3 h-3 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUpdate(update.id)}
                            className="p-1 hover:bg-white rounded shadow-sm border border-gray-100"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{update.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-green-600 font-medium tracking-tight">
                          <CheckCircle className="w-3 h-3" /> TERVERIFIKASI
                        </span>
                        <span className="text-gray-400">Oleh: Pengawas</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{editingContract ? 'Edit Kontrak Proyek' : 'Tambah Kontrak Proyek Baru'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                project_name: formData.get('project_name'),
                sppg_id: formData.get('sppg_id'),
                vendor_name: formData.get('vendor_name'),
                total_value: parseInt(formData.get('total_value') as string),
                start_date: formData.get('start_date'),
                end_date: formData.get('end_date'),
                status: formData.get('status'),
                payment_status: formData.get('payment_status'),
                progress: parseInt(formData.get('progress') as string) || 0,
              };
              try {
                if (editingContract) {
                  await api.put(`/contracts/${editingContract.id}`, data);
                } else {
                  await api.post('/contracts', data);
                }
                setIsContractModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Gagal menyimpan kontrak');
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Proyek</label>
                    <input name="project_name" defaultValue={editingContract?.project_name} required placeholder="Contoh: Pembangunan Dapur A" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Vendor</label>
                    <input name="vendor_name" defaultValue={editingContract?.vendor_name} required placeholder="Contoh: PT. Bangun Sejahtera" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nilai Total Kontrak (IDR)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Rp</span>
                    <input name="total_value" type="number" defaultValue={editingContract?.total_value} required className="w-full border rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tautkan ke SPPG (Galeri Foto)</label>
                  <select name="sppg_id" defaultValue={editingContract?.sppg_id} className="mt-1 w-full border rounded-lg p-2 bg-blue-50 border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Pilih SPPG untuk sinkronisasi foto</option>
                    {sppgsList.map(s => (
                      <option key={s.sppg_id} value={s.sppg_id}>{s.sppg_id} - {s.location || 'Tanpa Lokasi'}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-600 mt-1 italic font-medium">Foto progress akan otomatis terhubung dengan galeri SPPG yang dipilih.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input name="start_date" type="date" defaultValue={editingContract?.start_date} required className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input name="end_date" type="date" defaultValue={editingContract?.end_date} required className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Pengerjaan</label>
                    <select name="status" defaultValue={editingContract?.status || 'active'} className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="active">Aktif</option>
                      <option value="completed">Selesai</option>
                      <option value="on_hold">Ditunda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                    <select name="payment_status" defaultValue={editingContract?.payment_status || 'pending'} className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="pending">Menunggu</option>
                      <option value="partially_paid">Dibayar Sebagian</option>
                      <option value="paid">Lunas</option>
                      <option value="late">Terlambat</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Progress Pembangunan</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <input 
                      name="progress" 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue={editingContract?.progress || 0} 
                      onChange={(e) => {
                         const val = e.target.value;
                         e.target.nextElementSibling!.textContent = `${val}%`;
                         e.target.nextElementSibling!.className = `flex-shrink-0 w-12 text-center text-lg font-black ${val === '100' ? 'text-green-600' : 'text-blue-600'}`;
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <span className={`flex-shrink-0 w-12 text-center text-lg font-black ${editingContract?.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {editingContract?.progress || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsContractModalOpen(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">Simpan Kontrak</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Progress Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <h2 className="text-lg font-bold mb-4">{editingUpdate ? 'Edit Update Progress' : 'Update Progress Baru'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              
              let photoUrl = formData.get('photo_url') as string;
              const file = (e.target as any).image_file.files[0];
              
              if (file) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                try {
                  const res = await api.post('/upload', uploadFormData);
                  photoUrl = res.url;
                } catch (error) {
                  console.error('Upload failed:', error);
                }
              }

              // Intelligent GDrive link detection
              if (photoUrl && (photoUrl.includes('drive.google.com') || photoUrl.includes('docs.google.com'))) {
                const regExp = /\/d\/([a-zA-Z0-9-_]+)|id=([a-zA-Z0-9-_]+)/;
                const matches = photoUrl.match(regExp);
                const fileId = matches ? (matches[1] || matches[2]) : null;
                if (fileId) {
                  photoUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                }
              }

              const data = {
                contract_id: parseInt(formData.get('contract_id') as string),
                task_name: formData.get('task_name'),
                description: formData.get('description'),
                date: formData.get('date'),
                progress_percentage: parseInt(formData.get('progress_percentage') as string),
                photo_url: photoUrl,
              };
              try {
                if (editingUpdate) {
                  await api.put(`/progress-updates/${editingUpdate.id}`, data);
                } else {
                  await api.post('/progress-updates', data);
                }
                setIsUpdateModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Gagal menyimpan update');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proyek / Kontrak</label>
                  <select name="contract_id" defaultValue={editingUpdate?.contract_id} required className="mt-1 w-full border rounded-lg p-2">
                    <option value="">Pilih proyek</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.project_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Tugas</label>
                  <input name="task_name" defaultValue={editingUpdate?.task_name} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea name="description" defaultValue={editingUpdate?.description} required className="mt-1 w-full border rounded-lg p-2 h-24"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Update</label>
                    <input name="date" type="date" defaultValue={editingUpdate?.date} required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        name="progress_percentage" 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue={editingUpdate?.progress_percentage || 0} 
                        onChange={(e) => {
                           const val = e.target.value;
                           e.target.nextElementSibling!.textContent = `${val}%`;
                           e.target.nextElementSibling!.className = `flex-shrink-0 w-12 text-center text-lg font-black ${val === '100' ? 'text-green-600' : 'text-blue-600'}`;
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1" 
                      />
                      <span className={`flex-shrink-0 w-12 text-center text-lg font-black ${editingUpdate?.progress_percentage === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                        {editingUpdate?.progress_percentage || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Foto Progress</label>
                    <input name="image_file" type="file" accept="image/*" className="mt-1 w-full border rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-xs text-gray-400">Atau masukkan Link Google Drive / Image URL</label>
                    <input name="photo_url" defaultValue={editingUpdate?.photo_url} className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="https://drive.google.com/..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

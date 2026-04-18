import React, { useState } from 'react';
import { Building2, ImageIcon, DollarSign, CheckCircle, Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, Contract, ProgressUpdate } from '../services/api';
import { getGoogleImageUrl } from '../utils/mediaUtils';

export const Construction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'updates'>('contracts');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [sppgs, setSppgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<ProgressUpdate | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || "";

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch data in parallel
      const [contractData, updateData, sppgData] = await Promise.all([
        api.get('/contracts'),
        api.get('/progress-updates'),
        api.get('/sppgs')
      ]);
      
      console.log('SPPG Data fetched:', sppgData); // Debug log for user visibility
      
      setContracts(Array.isArray(contractData) ? contractData : []);
      setUpdates(Array.isArray(updateData) ? updateData : []);
      setSppgs(Array.isArray(sppgData) ? sppgData : []);
    } catch (error) {
      console.error('Failed to fetch construction data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const totalValue = contracts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
  const avgProgress = contracts.length > 0 
    ? Math.round(contracts.reduce((acc, curr) => acc + (curr.progress || 0), 0) / contracts.length) 
    : 0;

  const handleDeleteContract = async (id: number) => {
    if (window.confirm('Hapus kontrak ini?')) {
      try {
        await api.delete(`/contracts/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus kontrak');
      }
    }
  };

  const handleDeleteUpdate = async (id: number) => {
    if (window.confirm('Hapus pembaruan progres ini?')) {
      try {
        await api.delete(`/progress-updates/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus update');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E8289]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#164E4D] tracking-tight">Konstruksi Proyek</h1>
          <p className="text-[#164E4D]/60 mt-2 font-medium">Monitoring pembangunan dan infrastruktur dapur nasional.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-blue-600/60 font-bold uppercase tracking-wider">Total Kontrak</p>
              <p className="text-xl font-bold text-blue-900">{contracts.length}</p>
            </div>
          </div>
          <div className="glass-card px-6 py-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-600/60 font-bold uppercase tracking-wider">Nilai Proyek</p>
              <p className="text-xl font-bold text-emerald-900">Rp {(totalValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
          <div className="glass-card px-6 py-4 flex items-center gap-4 border-r-4 border-r-[#DE9F22]">
            <div className="p-3 bg-[#DE9F22]/10 rounded-xl text-[#DE9F22]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#DE9F22]/60 font-bold uppercase tracking-wider">Rata-rata Progres</p>
              <p className="text-xl font-bold text-[#164E4D]">{avgProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <button 
          onClick={() => {
            setEditingContract(null);
            setIsContractModalOpen(true);
          }}
          className="premium-button-primary flex items-center gap-2 shadow-lg shadow-[#1E8289]/20"
        >
          <Plus className="w-5 h-5" />
          Tambah Kontrak Baru
        </button>
      </div>

      {/* Tabs & Content */}
      <div className="glass-card overflow-hidden">
        <div className="bg-white/30 border-b border-white/20">
          <div className="flex gap-8 px-8">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-5 px-1 border-b-2 font-bold text-sm tracking-wide transition-all ${
                activeTab === 'contracts'
                  ? 'border-[#1E8289] text-[#164E4D]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              MANAJEMEN KONTRAK
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`py-5 px-1 border-b-2 font-bold text-sm tracking-wide transition-all ${
                activeTab === 'updates'
                  ? 'border-[#DE9F22] text-[#164E4D]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              LAPORAN PROGRES
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'contracts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchFilter && (
                <div className="col-span-full bg-[#F0F7F7] border border-[#1E8289]/20 p-4 rounded-xl flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm text-[#164E4D]">
                    <span className="font-extrabold uppercase text-[10px] bg-[#1E8289] text-white px-2 py-0.5 rounded">Filter</span>
                    <span>Menampilkan kontrak untuk <span className="font-bold underline italic">"{searchFilter}"</span></span>
                  </div>
                  <button 
                    onClick={() => setSearchParams({})}
                    className="p-1.5 hover:bg-white/50 rounded-full text-[#1E8289]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {contracts
                .filter(c => !searchFilter || (c.sppg_id === searchFilter || c.project_name.toLowerCase().includes(searchFilter.toLowerCase())))
                .map((contract) => (
                <div key={contract.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#DE9F22] animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{contract.sppg_id || 'UMUM'}</span>
                      </div>
                      <h3 className="font-bold text-[#164E4D] text-lg leading-tight group-hover:text-[#1E8289] transition-colors">{contract.project_name}</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">{contract.vendor_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingContract(contract);
                          setIsContractModalOpen(true);
                        }}
                        className="p-2 hover:bg-[#F0F7F7] rounded-lg transition-colors group/btn"
                      >
                        <Edit className="w-4 h-4 text-[#1E8289]" />
                      </button>
                      <button 
                         onClick={() => handleDeleteContract(contract.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Progres</span>
                      <span className="text-[#164E4D]">{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#DE9F22] to-[#B8861B] h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${contract.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold mb-6">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5 text-[#1E8289]" />
                      Rp {(contract.total_value || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {contract.end_date}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      contract.status === 'active' ? 'bg-[#F0F7F7] text-[#164E4D]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {contract.status === 'active' ? 'AKTIF' : 'SELESAI'}
                    </span>
                    <div className="flex items-center gap-2">
                      {contract.sppg_id && (
                        <a 
                          href={`/sppg-gallery?id=${contract.sppg_id}`}
                          className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1E8289] hover:bg-[#1E8289] hover:text-white px-2 py-1.5 rounded-lg border border-[#1E8289]/20 transition-all"
                        >
                          <ImageIcon className="w-3 h-3" />
                          GALERI
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {updates.map((update, idx) => (
                <div key={update.id} className="relative pl-12 group">
                  {/* Timeline Line */}
                  {idx !== updates.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-0.5 bg-gray-100"></div>
                  )}
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-2 w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center z-10 group-hover:border-[#1E8289] transition-colors">
                    <Clock className="w-5 h-5 text-[#DE9F22]" />
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 aspect-video md:aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                        {update.photo_url ? (
                          <img src={getGoogleImageUrl(update.photo_url)} alt="Progress" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="w-8 h-8 text-gray-200" />
                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Tanpa Pratinjau</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-[#DE9F22] uppercase tracking-widest mb-1">{update.date}</p>
                            <h4 className="text-xl font-extrabold text-[#164E4D] leading-none mb-1">{update.task_name}</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#F0F7F7] text-[#164E4D] px-3 py-1 rounded-lg text-sm font-bold">
                              +{update.progress_percentage}%
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingUpdate(update);
                                  setIsUpdateModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4 text-gray-400 hover:text-green-600" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUpdate(update.id)}
                                className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-[#164E4D]/70 text-sm leading-relaxed mb-6 font-medium">{update.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-1.5 text-emerald-500">
                              <CheckCircle className="w-3.5 h-3.5" /> DIVERIFIKASI OLEH AUDIT MBG
                            </span>
                            <span>•</span>
                            <span className="text-gray-500">PJ: PENGAWAS LAPANGAN</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => {
                    setEditingUpdate(null);
                    setIsUpdateModalOpen(true);
                  }}
                  className="premium-button-primary bg-white text-[#164E4D] border-2 border-dashed border-[#DE9F22]/30 py-4 px-12 hover:bg-[#F0F7F7] hover:border-[#DE9F22] shadow-none"
                >
                  Buat Update Progres Manual
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contract Modal - Implementation of premium styling */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-[#1A4D43]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#1A4D43]">{editingContract ? 'Edit Kontrak' : 'Kontrak Baru'}</h2>
              <button onClick={() => setIsContractModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
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
                if (editingContract) await api.put(`/contracts/${editingContract.id}`, data);
                else await api.post('/contracts', data);
                setIsContractModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Gagal menyimpan.');
              }
            }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Nama Proyek</label>
                  <input name="project_name" defaultValue={editingContract?.project_name} required className="premium-input w-full" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Nama Vendor / Rekanan</label>
                  <input name="vendor_name" defaultValue={editingContract?.vendor_name} required className="premium-input w-full" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Referensi SPPG</label>
                  <select name="sppg_id" defaultValue={editingContract?.sppg_id} className="premium-input w-full appearance-none">
                    <option value="">-- Tanpa Relasi SPPG --</option>
                    {sppgs.map(s => (
                      <option key={s.sppg_id} value={s.sppg_id}>
                        {s.sppg_id} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Nilai Kontrak (IDR)</label>
                  <input name="total_value" type="number" defaultValue={editingContract?.total_value} required className="premium-input w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Tanggal Berakhir</label>
                  <input name="end_date" type="date" defaultValue={editingContract?.end_date} required className="premium-input w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Progres Terkini (%)</label>
                  <input name="progress" type="number" min="0" max="100" defaultValue={editingContract?.progress} required className="premium-input w-full" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => setIsContractModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Batal</button>
                <button type="submit" className="premium-button-primary px-8">Simpan & Konfirmasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-[#1A4D43]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#1A4D43]">Log Update Progres</h2>
              <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              try {
                let finalPhotoUrl = editingUpdate?.photo_url || "";
                
                // Handle file upload if present
                const fileInput = e.target.querySelector('input[type="file"]');
                if (fileInput && fileInput.files && fileInput.files[0]) {
                  setUploading(true);
                  const uploadRes = await api.upload(fileInput.files[0]);
                  finalPhotoUrl = uploadRes.url;
                }

                const payload = {
                  contract_id: parseInt(formData.get('contract_id') as string) || 0,
                  task_name: formData.get('task_name'),
                  description: formData.get('description'),
                  date: formData.get('date'),
                  progress_percentage: parseInt(formData.get('progress_percentage') as string) || 0,
                  photo_url: finalPhotoUrl,
                };

                if (payload.contract_id === 0) {
                  alert('Silakan pilih kontrak terlebih dahulu.');
                  return;
                }

                if (editingUpdate) await api.put(`/progress-updates/${editingUpdate.id}`, payload);
                else await api.post('/progress-updates', payload);
                setIsUpdateModalOpen(false);
                fetchData();
              } catch (error: any) {
                console.error('Save error:', error);
                alert('Gagal menyimpan update: ' + (error.message || 'Error tidak diketahui'));
              } finally {
                setUploading(false);
              }
            }}>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Pilih Kontrak</label>
                  <select name="contract_id" defaultValue={editingUpdate?.contract_id} required className="premium-input w-full appearance-none">
                    <option value="">-- Pilih Project --</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>{c.project_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Nama Task</label>
                  <input name="task_name" defaultValue={editingUpdate?.task_name} required className="premium-input w-full" placeholder="Contoh: Pengecoran Lantai 2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Tanggal Update</label>
                    <input name="date" type="date" defaultValue={editingUpdate?.date} required className="premium-input w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Penambahan Progres (%)</label>
                    <input name="progress_percentage" type="number" min="0" max="100" defaultValue={editingUpdate?.progress_percentage} required className="premium-input w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Deksripsi Detail</label>
                  <textarea name="description" defaultValue={editingUpdate?.description} required className="premium-input w-full h-24 pt-3" placeholder="Jelaskan kendala atau pencapaian hari ini..."></textarea>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Upload Foto Progres</label>
                   <div className="flex items-center gap-4">
                      <input type="file" accept="image/*" className="premium-input flex-1 text-xs" />
                      {editingUpdate?.photo_url && !uploading && (
                        <img src={getGoogleImageUrl(editingUpdate.photo_url)} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt="Preview" />
                      )}
                   </div>
                   <p className="text-[9px] text-gray-400 mt-2 italic">* Biarkan kosong jika tidak ingin mengubah foto lama.</p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">Batal</button>
                <button type="submit" disabled={uploading} className="premium-button-primary px-8 flex items-center gap-2">
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Mengunggah...
                    </>
                  ) : 'Simpan Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

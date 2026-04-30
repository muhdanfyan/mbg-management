import React, { useState, useEffect } from 'react';
import { User, Building2, MapPin, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [kitchen, setKitchen] = useState<any>(null);
  const [isEditingKitchen, setIsEditingKitchen] = useState(false);
  const [kitchenForm, setKitchenForm] = useState({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    capacity: 0
  });

  useEffect(() => {
    if (profile?.role === 'PIC Dapur' || profile?.role === 'Super Admin') {
      fetchKitchen();
    }
  }, [profile]);

  const fetchKitchen = async () => {
    try {
      const data = await api.get('/profile/kitchen');
      setKitchen(data);
      setKitchenForm({
        name: data.name,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        capacity: data.capacity
      });
    } catch (err) {
      console.error('Failed to fetch kitchen', err);
    }
  };

  const handleUpdateKitchen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile/kitchen', kitchenForm);
      toast.success('Data dapur berhasil diperbarui');
      fetchKitchen();
      setIsEditingKitchen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui data dapur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile */}
      <div className="relative h-48 bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-3xl overflow-hidden shadow-2xl shadow-[#2BBF9D]/20">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-xl ring-4 ring-white/20">
              <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-gray-300" />
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-[#2BBF9D] text-white rounded-lg shadow-lg hover:bg-[#1A4D43] transition-all scale-0 group-hover:scale-100 duration-200">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-20 text-white">
            <h1 className="text-3xl font-black tracking-tight">{profile?.full_name}</h1>
            <p className="text-[#E2F8F3] font-bold uppercase tracking-[0.2em] text-xs mt-1">{profile?.role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20 pt-8">
        {/* User Info Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-[#1A4D43] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#2BBF9D]" />
              Informasi Akun
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-[#2BBF9D] uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-bold text-gray-700">{profile?.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-[#2BBF9D] uppercase tracking-widest mb-1">Departemen</p>
                <p className="text-sm font-bold text-gray-700">{profile?.department || '-'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-[#2BBF9D] uppercase tracking-widest mb-1">Posisi</p>
                <p className="text-sm font-bold text-gray-700">{profile?.position || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Management Card */}
        <div className="lg:col-span-2">
          {(profile?.role === 'PIC Dapur' || profile?.role === 'Super Admin') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-black text-[#1A4D43] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2BBF9D]" />
                  Kelola Data Dapur
                </h3>
                {!isEditingKitchen && (
                  <button
                    onClick={() => setIsEditingKitchen(true)}
                    className="px-4 py-2 bg-[#E2F8F3] text-[#2BBF9D] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2BBF9D] hover:text-white transition-all shadow-sm"
                  >
                    Edit Data
                  </button>
                )}
              </div>

              <div className="p-8">
                {isEditingKitchen ? (
                  <form onSubmit={handleUpdateKitchen} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Dapur</label>
                        <input
                          type="text"
                          value={kitchenForm.name}
                          onChange={(e) => setKitchenForm({ ...kitchenForm, name: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2BBF9D]/20 focus:border-[#2BBF9D] transition-all font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kapasitas (Porsi)</label>
                        <input
                          type="number"
                          value={kitchenForm.capacity}
                          onChange={(e) => setKitchenForm({ ...kitchenForm, capacity: parseInt(e.target.value) })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2BBF9D]/20 focus:border-[#2BBF9D] transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Lengkap</label>
                      <textarea
                        rows={3}
                        value={kitchenForm.address}
                        onChange={(e) => setKitchenForm({ ...kitchenForm, address: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2BBF9D]/20 focus:border-[#2BBF9D] transition-all font-bold text-gray-700 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={kitchenForm.lat}
                          onChange={(e) => setKitchenForm({ ...kitchenForm, lat: parseFloat(e.target.value) })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2BBF9D]/20 focus:border-[#2BBF9D] transition-all font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={kitchenForm.lng}
                          onChange={(e) => setKitchenForm({ ...kitchenForm, lng: parseFloat(e.target.value) })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2BBF9D]/20 focus:border-[#2BBF9D] transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#1A4D43] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#2BBF9D] transition-all shadow-lg shadow-[#1A4D43]/20 disabled:opacity-50 active:scale-[0.98]"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingKitchen(false)}
                        className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#E2F8F3] rounded-xl">
                          <Building2 className="w-5 h-5 text-[#2BBF9D]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Dapur</p>
                          <p className="font-bold text-[#1A4D43]">{kitchen?.name || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#E2F8F3] rounded-xl">
                          <User className="w-5 h-5 text-[#2BBF9D]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kapasitas</p>
                          <p className="font-bold text-[#1A4D43]">{kitchen?.capacity || 0} Porsi / Hari</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#E2F8F3] rounded-xl">
                        <MapPin className="w-5 h-5 text-[#2BBF9D]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lokasi & Alamat</p>
                        <p className="font-bold text-[#1A4D43] leading-relaxed mb-4">{kitchen?.address || '-'}</p>
                        
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                          <div className="flex gap-8">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lat</p>
                              <p className="text-sm font-bold text-gray-600">{kitchen?.lat || '0.000'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lng</p>
                              <p className="text-sm font-bold text-gray-600">{kitchen?.lng || '0.000'}</p>
                            </div>
                          </div>
                          <a 
                            href={`https://www.google.com/maps?q=${kitchen?.lat},${kitchen?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white text-[#2BBF9D] border border-[#2BBF9D]/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2BBF9D] hover:text-white transition-all shadow-sm"
                          >
                            Buka di Maps
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary Snippet */}
                    <div className="p-6 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] rounded-3xl text-white">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Ringkasan Keuangan Dapur</p>
                        <Building2 className="w-4 h-4 opacity-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-2xl font-black">Rp 14.5jt</p>
                          <p className="text-[10px] font-bold opacity-70 uppercase mt-1">Laba Akumulasi</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black">PRE-BEP</p>
                          <p className="text-[10px] font-bold opacity-70 uppercase mt-1">Status Investasi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

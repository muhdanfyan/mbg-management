import React, { useState, useEffect } from 'react';
import { ImageIcon, Building2, MapPin, X, ChevronRight, LayoutGrid, List, ArrowUpRight, Search, Filter, Trash2, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api, Sppg, getImageUrl, resolveGoogleDriveUrl, getGoogleDriveSources } from '../services/api';
import { Pagination } from '../components/UI/Pagination';
import { useAuth } from '../contexts/AuthContext';

const SafeImage = ({ url, alt, className }: { url: string, alt: string, className: string }) => {
  const sources = getGoogleDriveSources(url);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fallbackUrl = getImageUrl(url);

  return (
    <img
      src={sources[currentIndex] || fallbackUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
         if (currentIndex < sources.length - 1) {
             setCurrentIndex(prev => prev + 1);
         }
      }}
    />
  );
};

export const SppgGallery: React.FC = () => {
  const [sppgs, setSppgs] = useState<Sppg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSppg, setSelectedSppg] = useState<Sppg | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { profile } = useAuth();
  const location = useLocation();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgress, setFilterProgress] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Manage Media State
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim() || !selectedSppg) return;
    try {
      setIsUploading(true);
      await api.post('/sppg-media', {
         sppg_id: selectedSppg.sppg_id,
         preview_url: newMediaUrl
      });
      const data = await fetchSppgs();
      if (data) {
        const found = data.find((s: Sppg) => s.sppg_id === selectedSppg.sppg_id);
        if (found) setSelectedSppg(found);
      }
      setNewMediaUrl('');
      setIsAddingMedia(false);
    } catch(err) {
      alert("Failed to add media");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!window.confirm("Yakin ingin menghapus foto ini?")) return;
    try {
      await api.delete(`/sppg-media/${mediaId}`);
      const data = await fetchSppgs();
      if (data && selectedSppg) {
        const found = data.find((s: Sppg) => s.sppg_id === selectedSppg.sppg_id);
        if (found) setSelectedSppg(found);
      }
    } catch (err) {
       alert("Gagal menghapus gambar");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSppgs();
      
      // Auto-open based on URL ID
      const queryParams = new URLSearchParams(location.search);
      const targetId = queryParams.get('id');
      if (targetId && data) {
        const found = data.find((s: Sppg) => s.sppg_id === targetId);
        if (found) setSelectedSppg(found);
      }
    };
    fetchData();
  }, [location.search]);

  const fetchSppgs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/sppgs');
      setSppgs(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch SPPG data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };


  // Filtering Logic
  const filteredSppgs = sppgs.filter(sppg => {
    const matchesSearch = sppg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sppg.sppg_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sppg.location || '').toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesFilter = filterProgress === 'all' || 
                          (filterProgress === '100' && sppg.progress === '100%') ||
                          (filterProgress === 'ongoing' && sppg.progress !== '100%');
                          
    return matchesSearch && matchesFilter;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedSppgs = filteredSppgs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSppgs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A4D43]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Galeri SPPG YWMP</h1>
          <p className="text-gray-600 mt-1">Daftar progres pembangunan dapur SPPG di seluruh wilayah</p>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-[#1A4D43]' : 'text-gray-400'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-[#1A4D43]' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search SPPG (Name, ID, Location)..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A4D43] focus:border-transparent outline-none"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <select
            value={filterProgress}
            onChange={(e) => { setFilterProgress(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A4D43] focus:border-transparent outline-none appearance-none bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="ongoing">Sedang Pembangunan</option>
            <option value="100">Selesai (100%)</option>
          </select>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedSppgs.map((sppg: Sppg) => (
            <div
              key={sppg.id}
              onClick={() => setSelectedSppg(sppg)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {sppg.media && sppg.media.length > 0 ? (
                    <SafeImage
                      url={sppg.media[0].preview_url}
                      alt={sppg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-[#1A4D43] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    {sppg.media?.length || 0} FOTO
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-medium flex items-center gap-1">
                    Lihat Galeri <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{sppg.name}</h3>
                  <span className="text-[#1A4D43] font-bold text-xs shrink-0 bg-[#E6F3F0] px-2 py-0.5 rounded">
                    {sppg.sppg_id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{sppg.location || 'Lokasi tidak terekam'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="text-[10px] text-gray-400 font-medium">PROGRESS</div>
                  <div className="text-sm font-bold text-[#2BBF9D]">{sppg.progress}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama SPPG</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {paginatedSppgs.map((sppg: Sppg) => (
                <tr key={sppg.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 text-sm text-[#1A4D43] font-bold">{sppg.sppg_id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{sppg.name}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-xs">{sppg.location}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#2BBF9D] font-bold">{sppg.progress}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedSppg(sppg)}
                      className="bg-[#1A4D43] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#153b34] transition-colors inline-flex items-center gap-2"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      View {sppg.media?.length || 0} Photos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-gray-100 italic">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSppgs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Gallery Modal */}
      {selectedSppg && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-[#1A4D43] p-3 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedSppg.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    {selectedSppg.sppg_id} • {selectedSppg.location || 'Global Territory'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSppg(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {selectedSppg.media && selectedSppg.media.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                  {selectedSppg.media.map((item: any, idx: number) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 break-inside-avoid">
                      <SafeImage
                        url={item.preview_url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id); }} className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-lg">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <div className="w-full flex items-center justify-between">
                          <span className="text-white text-xs font-bold tracking-widest uppercase">
                            PHOTO #{idx + 1}
                          </span>
                          <a
                            href={resolveGoogleDriveUrl(item.preview_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-full">
                    <ImageIcon className="w-16 h-16 opacity-20" />
                  </div>
                  <p className="font-bold">Belum ada foto pembangunan tersedia.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
              {isAddingMedia && (
                <form onSubmit={handleAddMedia} className="flex gap-2">
                  <input 
                     type="text" 
                     placeholder="Masukkan Link Gambar atau Google Drive URL..." 
                     className="flex-1 px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#1A4D43]"
                     value={newMediaUrl}
                     onChange={(e) => setNewMediaUrl(e.target.value)}
                     disabled={isUploading}
                     required
                  />
                  <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700">
                    {isUploading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button type="button" onClick={() => setIsAddingMedia(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-300">
                    Batal
                  </button>
                </form>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
                   <div className="flex flex-col shrink-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Record</span>
                      <span className="text-sm font-bold text-green-600">VERIFIED DATA</span>
                   </div>
                   <div className="w-px h-8 bg-gray-200 shrink-0"></div>
                   <div className="flex flex-col shrink-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Media</span>
                      <span className="text-sm font-bold text-gray-900">{selectedSppg.media?.length || 0} Files</span>
                   </div>
                   <div className="w-px h-8 bg-gray-200 shrink-0"></div>
                     <a 
                       href={`/construction?search=${selectedSppg.sppg_id}`}
                       className="flex flex-col group shrink-0"
                     >
                       <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                          Cek Status Pembangunan
                          <ArrowUpRight className="w-2.5 h-2.5" />
                       </span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Construction Module</span>
                     </a>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {!isAddingMedia && (profile?.role === 'Super Admin' || profile?.role === 'Manager' || profile?.role === 'PIC Dapur') && (
                    <button
                      onClick={() => setIsAddingMedia(true)}
                      className="bg-white border-2 border-[#1A4D43] text-[#1A4D43] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Tambah Foto
                    </button>
                  )}
                  <button
                    onClick={() => {
                        setSelectedSppg(null);
                        setIsAddingMedia(false);
                        setNewMediaUrl('');
                    }}
                    className="bg-[#1A4D43] text-white px-4 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#1A4D43]/20 transition-all shrink-0"
                  >
                    Close Gallery
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

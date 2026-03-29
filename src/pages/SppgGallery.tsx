import React, { useState, useEffect } from 'react';
import { ImageIcon, Building2, MapPin, X, ChevronRight, LayoutGrid, List, ArrowUpRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api, Sppg } from '../services/api';
import { Pagination } from '../components/UI/Pagination';

export const SppgGallery: React.FC = () => {
  const [sppgs, setSppgs] = useState<Sppg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSppg, setSelectedSppg] = useState<Sppg | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const location = useLocation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const getGoogleImageUrl = (url: string) => {
    if (url && url.includes('lh3.googleusercontent.com/d/')) {
      const parts = url.split('/d/');
      if (parts.length > 1) {
        const id = parts[1].split('/')[0];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
      }
    }
    return url;
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedSppgs = sppgs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sppgs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D43]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri SPPG YWMP</h1>
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

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedSppgs.map((sppg: Sppg) => (
            <div
              key={sppg.id}
              onClick={() => setSelectedSppg(sppg)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {sppg.media && sppg.media.length > 0 ? (
                  <img
                    src={getGoogleImageUrl(sppg.media[0].preview_url)}
                    alt={sppg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
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
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama SPPG</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {paginatedSppgs.map((sppg: Sppg) => (
                <tr key={sppg.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-[#1A4D43] font-bold">{sppg.sppg_id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{sppg.name}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-xs">{sppg.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2BBF9D] font-bold">{sppg.progress}</td>
                  <td className="px-6 py-4 text-right">
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
      <div className="mt-12 pt-8 border-t border-gray-100 italic">
        <Pagination
          currentPage={currentPage}
          totalItems={sppgs.length}
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
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-[#1A4D43] p-3 rounded-2xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSppg.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    {selectedSppg.sppg_id} • {selectedSppg.location || 'Global Territory'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSppg(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {selectedSppg.media && selectedSppg.media.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {selectedSppg.media.map((item: any, idx: number) => (
                    <div key={item.id} className="relative group rounded-2xl overflow-hidden shadow-sm border border-gray-100 break-inside-avoid">
                      <img
                        src={getGoogleImageUrl(item.preview_url)}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                        <div className="w-full flex items-center justify-between">
                          <span className="text-white text-xs font-bold tracking-widest uppercase">
                            PHOTO #{idx + 1}
                          </span>
                          <a
                            href={getGoogleImageUrl(item.preview_url)}
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
                  <div className="bg-gray-50 p-6 rounded-full">
                    <ImageIcon className="w-16 h-16 opacity-20" />
                  </div>
                  <p className="font-bold">Belum ada foto pembangunan tersedia.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Record</span>
                    <span className="text-sm font-bold text-green-600">VERIFIED DATA</span>
                 </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Media</span>
                    <span className="text-sm font-bold text-gray-900">{selectedSppg.media?.length || 0} Files</span>
                 </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                   <a 
                     href={`/construction?search=${selectedSppg.sppg_id}`}
                     className="flex flex-col group"
                   >
                     <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                        Cek Status Pembangunan
                        <ArrowUpRight className="w-2.5 h-2.5" />
                     </span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Construction Module</span>
                   </a>
              </div>
              <button
                onClick={() => setSelectedSppg(null)}
                className="bg-[#1A4D43] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-[#1A4D43]/20 transition-all"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

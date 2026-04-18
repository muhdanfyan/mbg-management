import React, { useState } from 'react';
import { MapPin, Search, Filter, Edit, Trash2, Navigation, Clock, Plus, Info, ShieldCheck, Truck, CreditCard, X, Building2, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { api, Kitchen, Route } from '../services/api';
import { Pagination } from '../components/UI/Pagination';
import { useAuth } from '../contexts/AuthContext';

// Sub-component to fit map bounds to all markers
// Sub-component for Map Picking
const MapPicker: React.FC<{ lat: number; lng: number; onChange: (lat: number, lng: number) => void }> = ({ lat, lng, onChange }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker position={[lat, lng]} draggable={true} eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      },
    }} />
  );
};

// Sub-component for searching location on map
const MapSearch: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const map = useMap();

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        onLocationSelect(newLat, newLng);
        map.setView([newLat, newLng], 15);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="absolute top-2 left-2 z-[1000] flex gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Cari lokasi (Kecamatan, alamat...)"
          className="px-3 py-1.5 border rounded-lg shadow-md text-sm w-64 bg-white"
        />
        <button 
          type="button"
          onClick={handleSearch}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-blue-700 text-sm"
        >
          Cari
        </button>
      </div>
    </div>
  );
};

// Sub-component for current location button
const CurrentLocationButton: React.FC<{ onLocationFound?: (lat: number, lng: number) => void }> = ({ onLocationFound }) => {
  const map = useMap();
  
  const handleCurrentLocation = () => {
    map.locate({ setView: true, maxZoom: 16 }).on('locationfound', (e) => {
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng);
      }
    });
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000]">
      <button
        type="button"
        onClick={handleCurrentLocation}
        className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-[#1A4D43] transition-all active:scale-95 flex items-center justify-center border border-gray-100"
        title="Lokasi Saat Ini"
      >
        <Navigation className="w-6 h-6 fill-current" />
      </button>
    </div>
  );
};

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Interfaces for Indonesian Regions API
interface Province {
  id: string;
  name: string;
}

interface Regency {
  id: string;
  province_id: string;
  name: string;
}

export const Locations: React.FC = () => {
  const { hasRole } = useAuth();
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<Kitchen | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'finance' | 'construction' | 'data' | 'logistics'>('finance');
  const [viewingKitchen, setViewingKitchen] = useState<Kitchen | null>(null);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'routes'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Region Data State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [detectedProvince, setDetectedProvince] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sub-component to fit map bounds to all markers (defined inside for easy scope)
  const AutoFitBounds: React.FC<{ kitchensList: Kitchen[] }> = ({ kitchensList }) => {
    const map = useMap();
    React.useEffect(() => {
      if (kitchensList.length > 0) {
        const bounds = L.latLngBounds(kitchensList.map(k => [k.lat, k.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [kitchensList, map]);
    return null;
  };

  // Modal State for Map Picker
  const [pickerPos, setPickerPos] = useState({ lat: -5.14, lng: 119.43 });
  const [detectedRegion, setDetectedRegion] = useState('');

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchRegencies = async (provinceId: string) => {
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      const data = await response.json();
      setRegencies(data);
    } catch (error) {
      console.error('Error fetching regencies:', error);
    }
  };

  const fetchRegionFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await response.json();
      if (data.address) {
        const provinceName = (data.address.state || '').toUpperCase();
        const cityName = (data.address.city || data.address.town || data.address.county || '').toUpperCase();
        
        // Find matching province
        const matchedProv = provinces.find(p => 
          provinceName.includes(p.name) || p.name.includes(provinceName) ||
          provinceName.replace('PROVINSI ', '').includes(p.name)
        );

        if (matchedProv) {
          setSelectedProvinceId(matchedProv.id);
          setDetectedProvince(matchedProv.name);
          
          // Fetch regencies for this province to find the city
          const regRes = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${matchedProv.id}.json`);
          const regData: Regency[] = await regRes.json();
          setRegencies(regData);

          const matchedReg = regData.find(r => 
            cityName.includes(r.name) || r.name.includes(cityName) ||
            cityName.replace('KABUPATEN ', '').includes(r.name.replace('KABUPATEN ', '')) ||
            cityName.replace('KOTA ', '').includes(r.name.replace('KOTA ', ''))
          );

          if (matchedReg) {
            setDetectedRegion(matchedReg.name);
          }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const updatePosition = (lat: number, lng: number) => {
    setPickerPos({ lat, lng });
    fetchRegionFromCoords(lat, lng);
  };

  const [addressValue, setAddressValue] = useState('');


  const fetchData = async () => {
    try {
      setLoading(true);
      const [kitchensData, routesData] = await Promise.all([
        api.get('/kitchens'),
        api.get('/routes')
      ]);
      setKitchens(Array.isArray(kitchensData) ? kitchensData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
    } catch (error) {
      console.error('Failed to fetch locations data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    fetchProvinces();
  }, []);

  // Update regencies when province ID changes
  React.useEffect(() => {
    if (selectedProvinceId) {
      fetchRegencies(selectedProvinceId);
    }
  }, [selectedProvinceId]);

  const handleDeleteKitchen = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this kitchen?')) {
      try {
        await api.delete(`/kitchens/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete kitchen');
      }
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await api.delete(`/routes/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete route');
      }
    }
  };

  const filteredKitchens = kitchens.filter(kitchen => {
    const matchesSearch = kitchen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kitchen.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kitchen.id.toString().includes(searchTerm);
    const matchesRegion = selectedRegion === 'all' || kitchen.region.toUpperCase().includes(selectedRegion.toUpperCase());
    return matchesSearch && matchesRegion;
  });

  const totalKitchens = filteredKitchens.length;
  const paginatedKitchens = filteredKitchens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on search or filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion]);

  const handleSyncSppg = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyelaraskan data SPPG dari sumber YWMP? Ini akan memperbarui data infrastruktur, readiness, dan armada.')) {
      return;
    }
    setLoading(true);
    try {
      await api.post('/sync-sppg', {});
      alert('Sinkronisasi SPPG berhasil!');
      window.location.reload();
    } catch (error: any) {
      alert('Gagal melakukan sinkronisasi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-[#E2F8F3] text-[#2BBF9D]',
      construction: 'bg-orange-50 text-orange-600',
      inactive: 'bg-gray-100 text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getRouteStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700'
    };
    return styles[status as keyof typeof styles] || styles.scheduled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2BBF9D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4D43] tracking-tight">Peta Lokasi & Distribusi</h1>
          <p className="text-gray-500 mt-1 font-medium">Kelola lokasi dapur dan rute distribusi di Makassar</p>
        </div>
        <div className="flex gap-3">
          {hasRole(['Super Admin']) && (
              <button 
                onClick={handleSyncSppg}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Activity className="w-5 h-5" />
                Sinkron Data SPPG
              </button>
          )}
          <button 
            onClick={() => {
              setEditingKitchen(null);
              setPickerPos({ lat: -5.14, lng: 119.43 });
              setDetectedRegion('KOTA MAKASSAR');
              setAddressValue('');
              setIsKitchenModalOpen(true);
            }}
            className="premium-button-primary flex items-center gap-2 shadow-lg shadow-[#2BBF9D]/20 px-6 py-2.5"
          >
            <Plus className="w-5 h-5 font-bold" />
            Tambah Lokasi
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'map'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tampilan Peta
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Daftar Dapur
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'routes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Rute Distribusi
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, alamat, atau ID dapur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent min-w-[200px]"
            >
              <option value="all">Semua Wilayah</option>
              {provinces.map(prov => (
                <option key={prov.id} value={prov.name}>{prov.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          {activeTab === 'map' && (
            <div className="h-[600px] w-full">
              <MapContainer 
                center={[-5.1476, 119.4326]} 
                zoom={12} 
                scrollWheelZoom={false} 
                className="h-full w-full rounded-lg"
                zoomControl={false}
              >
                <ZoomControl position="topright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapSearch onLocationSelect={() => { /* MapSearch uses useMap internally to setView, so this is just for callback if needed */}} />
                <AutoFitBounds kitchensList={filteredKitchens} />
                {filteredKitchens.map(kitchen => (
                  <Marker key={kitchen.id} position={[kitchen.lat, kitchen.lng]}>
                    <Popup>
                      <div className="font-bold">{kitchen.name}</div>
                      <div>{kitchen.address}</div>
                      <div>Kapasitas: {kitchen.capacity} porsi/hari</div>
                      <div>Status: {kitchen.status}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama Dapur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Alamat</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Region</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Kapasitas</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKitchens.map((kitchen, index) => (
                    <tr key={kitchen.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{kitchen.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{kitchen.address}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900">{kitchen.region}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{kitchen.capacity} porsi/hari</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(kitchen.status)}`}>
                          {kitchen.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setViewingKitchen(kitchen);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Detail"
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingKitchen(kitchen);
                              setPickerPos({ lat: kitchen.lat, lng: kitchen.lng });
                              setDetectedRegion(kitchen.region);
                              // Try to extract province if possible (assuming format "CITY, PROVINCE")
                              if (kitchen.region.includes(',')) {
                                const [city, prov] = kitchen.region.split(', ');
                                setDetectedRegion(city);
                                const foundProv = provinces.find(p => p.name === prov);
                                if (foundProv) setSelectedProvinceId(foundProv.id);
                              }
                              setAddressValue(kitchen.address);
                              setIsKitchenModalOpen(true);
                            }}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Ubah"
                          >
                            <Edit className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteKitchen(kitchen.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalItems={totalKitchens}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setEditingRoute(null);
                    setIsRouteModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Tambah Rute
                </button>
              </div>
              {routes.map((route) => {
                const kitchen = kitchens.find(k => k.id === route.kitchen_id);
                return (
                  <div
                    key={route.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Navigation className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{route.route_name}</h3>
                          <p className="text-sm text-gray-600">{kitchen?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRouteStatusBadge(route.status)}`}>
                          {route.status.replace('_', ' ')}
                        </span>
                        <button 
                          onClick={() => {
                            setEditingRoute(route);
                            setIsRouteModalOpen(true);
                          }}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoute(route.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                        <p className="text-sm font-medium text-gray-900">{route.vehicle}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Driver</p>
                        <p className="text-sm font-medium text-gray-900">{route.driver}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ETA</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">{route.eta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Kitchen Modal */}
      {isKitchenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingKitchen ? 'Edit Kitchen' : 'Add New Kitchen'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                name: formData.get('name'),
                type: formData.get('type'),
                address: formData.get('address'),
                lat: pickerPos.lat,
                lng: pickerPos.lng,
                capacity: parseInt(formData.get('capacity') as string) || 0,
                status: formData.get('status'),
                region: `${formData.get('regency') || 'Unknown'}, ${detectedProvince || 'Nasional'}`,
                investor_share: parseFloat(formData.get('investor_share') as string) || 0,
                dpp_share: parseFloat(formData.get('dpp_share') as string) || 0,
              };

              try {
                if (editingKitchen) {
                  await api.put(`/kitchens/${editingKitchen.id}`, data);
                } else {
                  await api.post('/kitchens', data);
                }
                setIsKitchenModalOpen(false);
                fetchData();
              } catch (error: any) {
                console.error('Save error:', error);
                alert(`Failed to save kitchen: ${error.message || 'Unknown error'}`);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama</label>
                  <input name="name" defaultValue={editingKitchen?.name} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select name="type" defaultValue={editingKitchen?.type || 'INVESTOR'} className="mt-1 w-full border rounded-lg p-2">
                    <option value="INVESTOR">INVESTOR</option>
                    <option value="BANGUN_SENDIRI">BANGUN SENDIRI (BSI)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Investor Share (0.0 - 1.0)</label>
                    <input name="investor_share" type="number" step="0.01" defaultValue={editingKitchen?.investor_share || 0.75} required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DPP Share (0.0 - 1.0)</label>
                    <input name="dpp_share" type="number" step="0.01" defaultValue={editingKitchen?.dpp_share || 0.25} required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input 
                    name="address" 
                    value={addressValue}
                    onChange={(e) => setAddressValue(e.target.value)}
                    required 
                    className="mt-1 w-full border rounded-lg p-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pilih Lokasi di Peta</label>
                  <div className="h-64 w-full relative rounded-lg border overflow-hidden">
                    <MapContainer 
                      center={[editingKitchen?.lat || -5.14, editingKitchen?.lng || 119.43]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={false}
                    >
                      <ZoomControl position="topright" />
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapSearch onLocationSelect={updatePosition} />
                      <MapPicker lat={pickerPos.lat} lng={pickerPos.lng} onChange={updatePosition} />
                      <CurrentLocationButton onLocationFound={updatePosition} />
                    </MapContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input name="lat" type="number" step="any" value={pickerPos.lat} onChange={(e) => setPickerPos({ ...pickerPos, lat: parseFloat(e.target.value) })} required className="mt-1 w-full border rounded-lg p-2 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input name="lng" type="number" step="any" value={pickerPos.lng} onChange={(e) => setPickerPos({ ...pickerPos, lng: parseFloat(e.target.value) })} required className="mt-1 w-full border rounded-lg p-2 bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity (portions/day)</label>
                  <input name="capacity" type="number" defaultValue={editingKitchen?.capacity} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" defaultValue={editingKitchen?.status || 'active'} className="mt-1 w-full border rounded-lg p-2">
                      <option value="active">Aktif</option>
                      <option value="construction">Konstruksi</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <select 
                      name="province_name" 
                      value={selectedProvinceId} 
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedProvinceId(id);
                        const prov = provinces.find(p => p.id === id);
                        if (prov) setDetectedProvince(prov.name);
                      }} 
                      required 
                      className="mt-1 w-full border rounded-lg p-2" 
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(prov => (
                        <option key={prov.id} value={prov.id}>{prov.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kabupaten/Kota</label>
                    <select 
                      name="regency" 
                      value={detectedRegion} 
                      onChange={(e) => setDetectedRegion(e.target.value)} 
                      required 
                      className="mt-1 w-full border rounded-lg p-2" 
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Pilih Kabupaten/Kota</option>
                      {regencies.map(reg => (
                        <option key={reg.id} value={reg.name}>{reg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsKitchenModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                kitchen_id: parseInt(formData.get('kitchen_id') as string),
                route_name: formData.get('route_name'),
                vehicle: formData.get('vehicle'),
                driver: formData.get('driver'),
                status: formData.get('status'),
                eta: formData.get('eta'),
              };
              try {
                if (editingRoute) {
                  await api.put(`/routes/${editingRoute.id}`, data);
                } else {
                  await api.post('/routes', data);
                }
                setIsRouteModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Failed to save route');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source Kitchen</label>
                  <select name="kitchen_id" defaultValue={editingRoute?.kitchen_id || kitchens[0]?.id} required className="mt-1 w-full border rounded-lg p-2">
                    {kitchens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route Name</label>
                  <input name="route_name" defaultValue={editingRoute?.route_name} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                  <input name="vehicle" defaultValue={editingRoute?.vehicle} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driver</label>
                  <input name="driver" defaultValue={editingRoute?.driver} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" defaultValue={editingRoute?.status || 'scheduled'} className="mt-1 w-full border rounded-lg p-2">
                      <option value="scheduled">Scheduled</option>
                      <option value="in_transit">In Transit</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ETA</label>
                    <input name="eta" defaultValue={editingRoute?.eta} placeholder="08:30" required className="mt-1 w-full border rounded-lg p-2" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsRouteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kitchen Detail Modal */}
      {isDetailModalOpen && viewingKitchen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in-center shadow-blue-500/20">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] p-3 rounded-xl shadow-lg shadow-green-200">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{viewingKitchen.name}</h2>
                  <p className="text-sm text-gray-500 font-medium">Siklus: <span className="text-[#2BBF9D] font-bold">10 Hari (Termin)</span> | Wilayah: <span className="font-bold">{viewingKitchen.region}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90 group"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-8 bg-white border-b border-gray-100 gap-8">
              {[
                { id: 'finance', label: 'Keuangan', icon: CreditCard },
                { id: 'data', label: 'Data Dapur', icon: Info },
                { id: 'construction', label: 'Konstruksi', icon: Building2 },
                { id: 'logistics', label: 'Logistik', icon: Truck },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={`py-4 flex items-center gap-2 border-b-2 transition-all font-bold text-sm ${
                      isActive 
                        ? 'border-[#2BBF9D] text-[#1A4D43]' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#2BBF9D]' : 'text-gray-300'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
              {activeDetailTab === 'finance' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <DollarSign className="w-3 h-3" />
                        Target Porsi (BGN)
                      </div>
                      <p className="text-3xl font-black text-gray-900">{viewingKitchen.portion_target?.toLocaleString() || 0} <span className="text-sm font-normal text-gray-400">/ hari</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-orange-500">
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <Activity className="w-3 h-3" />
                        Status BEP
                      </div>
                      <p className={`text-2xl font-black ${viewingKitchen.bep_status === 'POST-BEP' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {viewingKitchen.bep_status || 'PRE-BEP'}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <BarChart3 className="w-3 h-3" />
                        Total Akumulasi Laba
                      </div>
                      <p className="text-2xl font-black text-emerald-700">Rp {(viewingKitchen.accumulated_profit || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* BEP Progress Bar */}
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-lg font-black text-[#1A4D43] mb-1">Kemajuan Balik Modal (BEP)</h3>
                        <p className="text-sm text-gray-500">Target Modal: <span className="font-bold text-gray-900">Rp {(viewingKitchen.initial_capital || 0).toLocaleString()}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-[#2BBF9D]">
                          {viewingKitchen.initial_capital > 0 
                            ? Math.min(100, Math.round((viewingKitchen.accumulated_profit / viewingKitchen.initial_capital) * 100))
                            : 0}%
                        </span>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Progress Investasi</p>
                      </div>
                    </div>
                    <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-200">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1A4D43] to-[#2BBF9D] rounded-full transition-all duration-1000 shadow-inner"
                        style={{ width: `${viewingKitchen.initial_capital > 0 ? Math.min(100, (viewingKitchen.accumulated_profit / viewingKitchen.initial_capital) * 100) : 0}%` }}
                      ></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-bold">
                      <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                        <span className="text-gray-500">Jatah Investor:</span>
                        <span className="text-[#1A4D43] font-black">{(viewingKitchen.investor_share * 100).toFixed(0)}%</span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                        <span className="text-gray-500">Jatah DPP/Pusat:</span>
                        <span className="text-[#1A4D43] font-black">{(viewingKitchen.dpp_share * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'data' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-2 duration-300">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-[#1A4D43] flex items-center gap-2">
                       <Building2 className="w-5 h-5" /> Penanggung Jawab & Lahan
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Nama PJ Dapur</p>
                        <p className="text-lg font-black text-gray-900">{viewingKitchen.sppg_detail?.stakeholder?.pj?.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Kontak</p>
                        <p className="text-sm font-bold text-blue-600">{viewingKitchen.sppg_detail?.stakeholder?.pj?.phone || '-'}</p>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Pemilik Lahan</p>
                        <p className="text-lg font-black text-gray-900">{viewingKitchen.sppg_detail?.stakeholder?.landlord?.name || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-[#1A4D43] flex items-center gap-2">
                       <Info className="w-5 h-5 text-[#2BBF9D]" /> Spesifikasi Fisik
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Luas Lahan</p>
                        <p className="text-xl font-black text-gray-900">{viewingKitchen.sppg_detail?.infrastructure?.land_area || 0} m²</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Luas Bangunan</p>
                        <p className="text-xl font-black text-gray-900">{viewingKitchen.sppg_detail?.infrastructure?.building_area || 0} m²</p>
                      </div>
                    </div>
                    <div className="bg-[#1A4D43] p-6 rounded-2xl text-white">
                      <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mb-2">Alat Dapur Terverifikasi</p>
                      <ul className="text-sm space-y-1 opacity-90 font-medium">
                        <li>• Kuali Industri & Kompor High Pressure</li>
                        <li>• Meja Persiapan Stainless Steel</li>
                        <li>• Cold Storage / Freezer 600L</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'construction' && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100">
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Kesiapan Infrastruktur</h3>
                      <p className="text-sm text-gray-500">Checklist kelayakan operasional gedung</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-black ${viewingKitchen.sppg_detail?.readiness?.is_ready_to_run ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                      {viewingKitchen.sppg_detail?.readiness?.is_ready_to_run ? 'READY - SIAP PAKAI' : 'TERTUNDA - DALAM PROSES'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: 'Instalasi IPAL', status: viewingKitchen.sppg_detail?.readiness?.has_ipal },
                      { label: 'Sistem Sentral Gas', status: viewingKitchen.sppg_detail?.readiness?.has_gas },
                      { label: 'Daya Listrik Sesuai', status: viewingKitchen.sppg_detail?.readiness?.has_listrik },
                      { label: 'Filter Air Bersih', status: viewingKitchen.sppg_detail?.readiness?.has_water_filter },
                      { label: 'Sistem Exhaust', status: viewingKitchen.sppg_detail?.readiness?.has_exhaust },
                      { label: 'Sertifikasi Halal', status: viewingKitchen.sppg_detail?.readiness?.has_halal_cert },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 group hover:border-[#2BBF9D] transition-colors">
                        <span className="text-xs font-bold text-gray-600">{item.label}</span>
                        <div className={`p-1.5 rounded-full ${item.status ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                          {item.status ? <ShieldCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'logistics' && (
                <div className="space-y-8 animate-in slide-in-from-left-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                       <Truck className="w-10 h-10 text-[#2BBF9D] mx-auto mb-3" />
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Armada</p>
                       <p className="text-3xl font-black text-gray-900">{viewingKitchen.sppg_detail?.fleets?.length || 0}</p>
                    </div>
                    <div className="md:col-span-2 bg-[#1A4D43] p-6 rounded-2xl text-white flex items-center justify-between">
                       <div>
                         <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Status Pengiriman</p>
                         <h4 className="text-2xl font-black">Semua Rute Aktif</h4>
                       </div>
                       <div className="text-right">
                         <button className="bg-[#2BBF9D] px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-black/20">Manage Routes</button>
                       </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Daftar Unit Kendaraan</h4>
                    <div className="space-y-3">
                      {viewingKitchen.sppg_detail?.fleets?.map((f: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm font-black text-xs text-[#1A4D43]">{i+1}</div>
                            <span className="font-bold text-gray-700">{f.fleet_type} - {f.vehicle_description}</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Aktif</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <p className="text-[10px] text-gray-400 font-medium italic">Data Sinkron: {new Date().toLocaleDateString('id-ID')} | Power by Wahdah MBG Engine</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-black text-xs hover:bg-gray-300 transition-all uppercase tracking-widest"
                >
                  Tutup
                </button>
                <button 
                   className="px-8 py-3 bg-[#1A4D43] text-white rounded-xl font-black text-xs shadow-xl shadow-[#1A4D43]/20 hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest"
                >
                  Cetak Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
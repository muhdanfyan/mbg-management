import React, { useState } from 'react';
import { MapPin, Search, Filter, Eye, Edit, Trash2, Navigation, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const mockKitchens = [
  { id: 1, name: 'Dapur Panakkukang', address: 'Jl. Boulevard, Panakkukang', lat: -5.1415, lng: 119.453, capacity: 500, status: 'active', region: 'Makassar' },
  { id: 2, name: 'Dapur Rappocini', address: 'Jl. Sultan Alauddin, Rappocini', lat: -5.1632, lng: 119.443, capacity: 450, status: 'active', region: 'Makassar' },
  { id: 3, name: 'Dapur Tamalanrea', address: 'Jl. Perintis Kemerdekaan, Tamalanrea', lat: -5.135, lng: 119.49, capacity: 400, status: 'construction', region: 'Makassar' },
  { id: 4, name: 'Dapur Biringkanaya', address: 'Jl. Poros Sudiang, Biringkanaya', lat: -5.101, lng: 119.52, capacity: 350, status: 'active', region: 'Makassar' },
  { id: 5, name: 'Dapur Manggala', address: 'Jl. Antang Raya, Manggala', lat: -5.17, lng: 119.48, capacity: 300, status: 'active', region: 'Makassar' },
];

const mockRoutes = [
  { id: 1, kitchenId: 1, routeName: 'Route A - Panakkukang', vehicle: 'DD 1234 XYZ', driver: 'Ahmad Fauzi', status: 'in_transit', eta: '13:30' },
  { id: 2, kitchenId: 1, routeName: 'Route B - Panakkukang', vehicle: 'DD 5678 ABC', driver: 'Budi Santoso', status: 'completed', eta: '12:00' },
  { id: 3, kitchenId: 2, routeName: 'Route A - Rappocini', vehicle: 'DD 9012 DEF', driver: 'Candra Wijaya', status: 'scheduled', eta: '14:00' },
  { id: 4, kitchenId: 4, routeName: 'Route A - Biringkanaya', vehicle: 'DD 3456 GHI', driver: 'Dedi Supardi', status: 'in_transit', eta: '13:45' },
];

export const Locations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'routes'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const filteredKitchens = mockKitchens.filter(kitchen => {
    const matchesSearch = kitchen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kitchen.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || kitchen.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      construction: 'bg-orange-100 text-orange-700',
      inactive: 'bg-gray-100 text-gray-700'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peta Lokasi & Distribusi</h1>
          <p className="text-gray-600 mt-1">Kelola lokasi dapur dan rute distribusi di Makassar</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Tambah Lokasi
        </button>
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
              Map View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Kitchen List
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'routes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Distribution Routes
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search kitchens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="all">All Regions</option>
              <option value="Makassar">Makassar</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          {activeTab === 'map' && (
            <div className="h-[600px] w-full">
              <MapContainer center={[-5.1476, 119.4326]} zoom={12} scrollWheelZoom={false} className="h-full w-full rounded-lg">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKitchens.map((kitchen) => (
                    <tr key={kitchen.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
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
                          <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-green-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

          {activeTab === 'routes' && (
            <div className="space-y-4">
              {mockRoutes.map((route) => {
                const kitchen = mockKitchens.find(k => k.id === route.kitchenId);
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
                          <h3 className="font-semibold text-gray-900 mb-1">{route.routeName}</h3>
                          <p className="text-sm text-gray-600">{kitchen?.name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRouteStatusBadge(route.status)}`}>
                        {route.status.replace('_', ' ')}
                      </span>
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
                    {route.status === 'in_transit' && (
                      <div className="mt-4 bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-700">Progress</span>
                          <span className="text-xs font-medium text-blue-700">65%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { MapPin, Search, Filter, Eye, Edit, Trash2, Navigation, Clock, CheckCircle } from 'lucide-react';

const mockKitchens = [
  { id: 1, name: 'Dapur Jakarta Pusat', address: 'Jl. Sudirman No. 123, Jakarta Pusat', lat: -6.2088, lng: 106.8456, capacity: 500, status: 'active', region: 'Jakarta' },
  { id: 2, name: 'Dapur Jakarta Selatan', address: 'Jl. TB Simatupang No. 45, Jakarta Selatan', lat: -6.3024, lng: 106.7946, capacity: 450, status: 'active', region: 'Jakarta' },
  { id: 3, name: 'Dapur Surabaya Timur', address: 'Jl. Ahmad Yani No. 78, Surabaya', lat: -7.2575, lng: 112.7521, capacity: 400, status: 'construction', region: 'Surabaya' },
  { id: 4, name: 'Dapur Bandung Utara', address: 'Jl. Setiabudhi No. 234, Bandung', lat: -6.8700, lng: 107.5740, capacity: 350, status: 'active', region: 'Bandung' },
  { id: 5, name: 'Dapur Semarang Barat', address: 'Jl. Pemuda No. 156, Semarang', lat: -6.9667, lng: 110.4167, capacity: 300, status: 'active', region: 'Semarang' },
];

const mockRoutes = [
  { id: 1, kitchenId: 1, routeName: 'Route A - Jakarta Pusat', vehicle: 'B 1234 XYZ', driver: 'Ahmad Fauzi', status: 'in_transit', eta: '13:30' },
  { id: 2, kitchenId: 1, routeName: 'Route B - Jakarta Pusat', vehicle: 'B 5678 ABC', driver: 'Budi Santoso', status: 'completed', eta: '12:00' },
  { id: 3, kitchenId: 2, routeName: 'Route A - Jakarta Selatan', vehicle: 'B 9012 DEF', driver: 'Candra Wijaya', status: 'scheduled', eta: '14:00' },
  { id: 4, kitchenId: 4, routeName: 'Route A - Bandung', vehicle: 'D 3456 GHI', driver: 'Dedi Supardi', status: 'in_transit', eta: '13:45' },
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
          <p className="text-gray-600 mt-1">Kelola lokasi dapur dan rute distribusi</p>
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
              <option value="Jakarta">Jakarta</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Bandung">Bandung</option>
              <option value="Semarang">Semarang</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>

          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600 mb-4">Map visualization showing all kitchen locations</p>
                  <div className="flex items-center justify-center gap-4">
                    {mockKitchens.map((kitchen) => (
                      <div
                        key={kitchen.id}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                      >
                        <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-gray-900">{kitchen.name}</p>
                        <p className="text-xs text-gray-500">{kitchen.region}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium">Total Locations</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{mockKitchens.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium">Active Kitchens</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {mockKitchens.filter(k => k.status === 'active').length}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-700 font-medium">Under Construction</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {mockKitchens.filter(k => k.status === 'construction').length}
                  </p>
                </div>
              </div>
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

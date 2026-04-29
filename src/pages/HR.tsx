import React, { useState } from 'react';
import { Search, Calendar, Edit, Trash2, UserCircle, Briefcase, Clock, CheckCircle, UserPlus, Image as ImageIcon, Upload, Building2 } from 'lucide-react';
import { api, Employee, Vacancy, Applicant, getImageUrl } from '../services/api';
import { SearchableSelect } from '../components/UI/SearchableSelect';
import { Pagination } from '../components/UI/Pagination';
// Force reload to pick up useAuth import
import { useAuth } from '../contexts/AuthContext';

export const HR: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'recruitment' | 'attendance' | 'payroll'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState<any>({
    name: '',
    department_id: '',
    position_id: '',
    kitchen_id: '',
    salary: 0,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, vacData, deptData, posData, kitchensData] = await Promise.all([
        api.get('/employees'),
        api.get('/vacancies'),
        api.get('/departments'),
        api.get('/positions'),
        api.get('/kitchens')
      ]);
      setEmployees(empData);
      setVacancies(vacData);
      setDepartments(deptData);
      setPositions(posData);
      setKitchens(kitchensData);
    } catch (error) {
      console.error('Failed to fetch HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete employee');
      }
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vacancy?')) {
      try {
        await api.delete(`/vacancies/${id}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete vacancy');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      terminated: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getApplicantStatusBadge = (status: string) => {
    const styles = {
      applied: 'bg-blue-100 text-blue-700',
      interview: 'bg-orange-100 text-orange-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.applied;
  };

  const filteredEmployees = (employees || []).filter(emp => {
    const matchesSearch = (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position_detail?.name || emp.position || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKitchen = !profile?.kitchen_id || emp.kitchen_id === profile.kitchen_id;
    
    return matchesSearch && matchesKitchen;
  });

  const totalEmployees = filteredEmployees.length;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on search or tab change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative h-48 rounded-[2rem] overflow-hidden group shadow-2xl">
        <img 
          src="/Users/pondokit/.gemini/antigravity/brain/03370879-5ab3-40d7-8d20-82b5e0926c8a/hr_hero_modern_1776937081203.png" 
          alt="HR Hero" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A4D43] via-[#1A4D43]/60 to-transparent flex flex-col justify-center px-10">
          <h1 className="text-3xl font-black text-white tracking-tight">Manajemen SDM & Karir</h1>
          <p className="text-white/80 mt-2 font-medium max-w-md">Kelola aset berharga perusahaan dengan sistem cerdas dan terintegrasi.</p>
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
          <span className="text-white text-[10px] font-black uppercase tracking-widest">HR Command Center</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D43] tracking-tight">Data Karyawan & Organisasi</h2>
          <p className="text-gray-500 mt-1 font-medium">Monitoring status dan performa SDM di seluruh unit dapur</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingEmployee(null);
              setPreviewUrl(null);
              setEmployeeForm({
                name: '',
                department_id: '',
                position_id: '',
                kitchen_id: profile?.kitchen_id || '',
                salary: 0,
                hire_date: new Date().toISOString().split('T')[0],
                status: 'active'
              });
              setIsEmployeeModalOpen(true);
            }}
            className="premium-button-primary flex items-center gap-2 shadow-lg shadow-[#2BBF9D]/20"
          >
            <UserPlus className="w-5 h-5 font-bold" />
            Tambah Karyawan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Database Karyawan
            </button>
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'recruitment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Rekrutmen
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Kehadiran
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-3 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'payroll'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Penggajian (Payroll)
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedEmployees.map((employee: Employee) => (
                  <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100 flex-shrink-0">
                        {employee.photo ? (
                          <img src={getImageUrl(employee.photo)} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-8 h-8 opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-0.5 truncate">{employee.name}</h3>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                          {employee.position_detail?.name || employee.position}
                        </p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(employee.status)}`}>
                          {employee.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">ID Karyawan</p>
                        <p className="text-sm font-bold text-gray-900">{employee.number}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Departemen</p>
                        <p className="text-sm font-bold text-gray-900">
                          {employee.department_detail?.name || employee.department}
                        </p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Penempatan (Unit Dapur)</p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#1A4D43]">
                          <Building2 className="w-3.5 h-3.5 text-[#2BBF9D]" />
                          {employee.kitchen_detail?.name || 'Pusat / Kantor'}
                        </div>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-200 mt-1">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Bergabung Sejak</p>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {employee.hire_date}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingEmployee(employee);
                          setPreviewUrl(employee.photo || null);
                          setEmployeeForm({
                            name: employee.name,
                            department_id: employee.department_id,
                            position_id: employee.position_id,
                            kitchen_id: employee.kitchen_id || '',
                            salary: employee.salary,
                            hire_date: employee.hire_date,
                            status: employee.status
                          });
                          setIsEmployeeModalOpen(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalEmployees}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Lowongan Pekerjaan</h3>
                <button 
                  onClick={() => {
                    setEditingVacancy(null);
                    setIsVacancyModalOpen(true);
                  }}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 text-sm font-medium"
                >
                  + Pasang Lowongan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vacancies.map((vacancy: Vacancy) => (
                  <div key={vacancy.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{vacancy.title}</h4>
                        <p className="text-sm text-gray-600">{vacancy.department}</p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditingVacancy(vacancy);
                            setIsVacancyModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteVacancy(vacancy.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-xs text-gray-500 mb-1">Batas Waktu: {vacancy.deadline}</p>
                        <p className="text-xs text-blue-600 font-medium">{vacancy.applicants_list?.length || 0} Pelamar</p>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalEmployees}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-green-600 mb-2 font-medium">Tepat Waktu</div>
                  <div className="text-2xl font-bold text-green-700">94.2%</div>
                  <div className="text-sm text-green-600 mt-1">Rata-rata bulan ini</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <div className="text-orange-600 mb-2 font-medium">Terlambat</div>
                  <div className="text-2xl font-bold text-orange-700">4.8%</div>
                  <div className="text-sm text-orange-600 mt-1">Rata-rata bulan ini</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="text-red-600 mb-2 font-medium">Absen</div>
                  <div className="text-2xl font-bold text-red-700">1.0%</div>
                  <div className="text-sm text-red-600 mt-1">Rata-rata bulan ini</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Karyawan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Jabatan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Gaji Bersih</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee: Employee) => (
                      <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{employee.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{employee.position_detail?.name || employee.position}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                          Rp {(employee.salary / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Dibayar
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <h2 className="text-lg font-bold mb-4">{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              if (!employeeForm.department_id || !employeeForm.position_id) {
                alert('Mohon pilih Departemen dan Jabatan terlebih dahulu');
                return;
              }

              const data = {
                number: editingEmployee ? editingEmployee.number : "",
                name: employeeForm.name,
                kitchen_id: employeeForm.kitchen_id ? parseInt(employeeForm.kitchen_id.toString()) : null,
                department_id: parseInt(employeeForm.department_id.toString()),
                position_id: parseInt(employeeForm.position_id.toString()),
                hire_date: employeeForm.hire_date,
                status: employeeForm.status,
                salary: parseFloat(employeeForm.salary?.toString() || '0'),
                photo: previewUrl || ""
              };
              try {
                if (editingEmployee) {
                  await api.put(`/employees/${editingEmployee.id}`, data);
                } else {
                  await api.post('/employees', data);
                }
                setIsEmployeeModalOpen(false);
                setPreviewUrl(null);
                fetchData();
              } catch (error: any) {
                alert('Gagal menyimpan data: ' + error.message);
              }
            }}>
               <div className="space-y-4">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={getImageUrl(previewUrl)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploading(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const res = await api.post('/upload', formData);
                              setPreviewUrl(res.url);
                            } catch (error) {
                              alert('Gagal upload gambar');
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">
                    {uploading ? 'Sedang mengupload...' : 'Foto Profil Karyawan'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Induk Karyawan</label>
                  <div className="mt-1 w-full bg-gray-50 border rounded-lg p-2 text-gray-500 font-mono text-sm">
                    {editingEmployee ? editingEmployee.number : 'EMP-YYYY-XXX (Otomatis)'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input 
                    name="name" 
                    value={employeeForm.name} 
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    required 
                    className="mt-1 w-full border rounded-lg p-2" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SearchableSelect 
                      label="Departemen"
                      name="department_id"
                      value={employeeForm.department_id}
                      placeholder="Pilih Dept"
                      options={[
                        { value: '', label: 'Pilih Dept' },
                        ...departments.map(d => ({ value: d.id, label: d.name }))
                      ]}
                      onChange={(val) => setEmployeeForm({ ...employeeForm, department_id: val })}
                    />
                  </div>
                  <div>
                    <SearchableSelect 
                      label="Jabatan"
                      name="position_id"
                      value={employeeForm.position_id}
                      placeholder="Pilih Jabatan"
                      options={[
                        { value: '', label: 'Pilih Jabatan' },
                        ...positions.map(p => ({ value: p.id, label: p.name }))
                      ]}
                      onChange={(val) => setEmployeeForm({ ...employeeForm, position_id: val })}
                    />
                  </div>
                </div>
                <div>
                  <SearchableSelect 
                    label="Target Dapur (Penempatan)"
                    name="kitchen_id"
                    value={employeeForm.kitchen_id}
                    placeholder="Pilih Dapur"
                    options={[
                      { value: '', label: 'Pilih Dapur' },
                      ...kitchens.map(k => ({ value: k.id, label: k.name }))
                    ]}
                    onChange={(val) => setEmployeeForm({ ...employeeForm, kitchen_id: val })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gaji (IDR)</label>
                  <input 
                    name="salary" 
                    type="number" 
                    value={employeeForm.salary} 
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                    required 
                    className="mt-1 w-full border rounded-lg p-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Masuk</label>
                  <input 
                    name="hire_date" 
                    type="date" 
                    value={employeeForm.hire_date} 
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hire_date: e.target.value })}
                    required 
                    className="mt-1 w-full border rounded-lg p-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    name="status" 
                    value={employeeForm.status} 
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                    className="mt-1 w-full border rounded-lg p-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacancy Modal */}
      {isVacancyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4">
            <h2 className="text-lg font-bold mb-4">{editingVacancy ? 'Edit Vacancy' : 'Post New Vacancy'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                title: formData.get('title'),
                department: formData.get('department'),
                type: formData.get('type'),
                deadline: formData.get('deadline'),
                description: formData.get('description'),
                status: 'active'
              };
              try {
                if (editingVacancy) {
                  await api.put(`/vacancies/${editingVacancy.id}`, data);
                } else {
                  await api.post('/vacancies', data);
                }
                setIsVacancyModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Failed to save vacancy');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input name="title" defaultValue={editingVacancy?.title} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input name="department" defaultValue={editingVacancy?.department} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vacancy Type</label>
                    <select
                      value={editingVacancy?.type || 'Full-time'}
                      onChange={(e) => setEditingVacancy(prev => prev ? { ...prev, type: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={editingVacancy?.deadline || ''}
                      onChange={(e) => setEditingVacancy(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingVacancy?.description || ''}
                    onChange={(e) => setEditingVacancy(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Enter job description..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsVacancyModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

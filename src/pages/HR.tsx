import React, { useState } from 'react';
import { Search, Calendar, Edit, Trash2, UserCircle, Briefcase, Clock, CheckCircle, UserPlus } from 'lucide-react';
import { api, Employee, Vacancy, Applicant } from '../services/api';
import { Pagination } from '../components/UI/Pagination';

export const HR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'recruitment' | 'attendance' | 'payroll'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, vacData, deptData, posData] = await Promise.all([
        api.get('/employees'),
        api.get('/vacancies'),
        api.get('/departments'),
        api.get('/positions')
      ]);
      setEmployees(Array.isArray(empData) ? empData : []);
      setVacancies(Array.isArray(vacData) ? vacData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setPositions(Array.isArray(posData) ? posData : []);
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
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus karyawan');
      }
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) {
      try {
        await api.delete(`/vacancies/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus lowongan');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      terminated: 'bg-red-100 text-red-700'
    };
    const labels: any = {
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      terminated: 'Berhenti'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status as keyof typeof styles] || styles.active}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
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

  const filteredEmployees = (employees || []).filter(emp =>
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position_detail?.name || emp.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen SDM</h1>
          <p className="text-gray-600 mt-1">Kelola karyawan dan rekrutmen</p>
        </div>
        <button 
          onClick={() => {
            setEditingEmployee(null);
            setIsEmployeeModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Karyawan
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Data Karyawan
            </button>
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'recruitment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Rekrutmen
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Kehadiran
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'payroll'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Penggajian
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'employees' && (
            <div className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEmployees.map((employee: Employee) => (
                  <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100 flex-shrink-0">
                        {employee.photo ? (
                          <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-10 h-10 opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-0.5 truncate">{employee.name}</h3>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                          {employee.position_detail?.name || employee.position}
                        </p>
                        {getStatusBadge(employee.status)}
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
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Bergabung Sejak</p>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {formatDateID(employee.hire_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => {
                          setEditingEmployee(employee);
                          setIsEmployeeModalOpen(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Ubah
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
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lowongan Kerja</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="text-green-600 mb-2 font-medium">Tepat Waktu</div>
                  <div className="text-3xl font-bold text-green-700">94.2%</div>
                  <div className="text-sm text-green-600 mt-1">Rata-rata bulan ini</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <div className="text-orange-600 mb-2 font-medium">Terlambat Datang</div>
                  <div className="text-3xl font-bold text-orange-700">4.8%</div>
                  <div className="text-sm text-orange-600 mt-1">Rata-rata bulan ini</div>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                  <div className="text-red-600 mb-2 font-medium">Absen</div>
                  <div className="text-3xl font-bold text-red-700">1.0%</div>
                  <div className="text-sm text-red-600 mt-1">Rata-rata bulan ini</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
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
                        <td className="py-4 px-4 font-medium text-gray-900">{employee.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{employee.position_detail?.name || employee.position}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-blue-600">
                          Rp {(employee.salary / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Terbayar
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
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingEmployee ? 'Ubah Karyawan' : 'Tambah Karyawan Baru'}</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                number: editingEmployee ? editingEmployee.number : "",
                name: formData.get('name'),
                department_id: parseInt(formData.get('department_id') as string),
                position_id: parseInt(formData.get('position_id') as string),
                hire_date: formData.get('hire_date'),
                status: formData.get('status'),
                salary: parseFloat(formData.get('salary') as string || '0'),
              };
              try {
                if (editingEmployee) {
                  await api.put(`/employees/${editingEmployee.id}`, data);
                } else {
                  await api.post('/employees', data);
                }
                setIsEmployeeModalOpen(false);
                fetchData();
              } catch (error) {
                alert('Gagal menyimpan data karyawan');
              }
            }}>
               <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Induk Karyawan (NIK)</label>
                  <div className="mt-1 w-full bg-gray-50 border rounded-lg p-2 text-gray-500 font-mono text-sm">
                    {editingEmployee ? editingEmployee.number : 'EMP-YYYY-XXX (Auto-generated)'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input name="name" defaultValue={editingEmployee?.name} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Departemen</label>
                    <select name="department_id" defaultValue={editingEmployee?.department_id} required className="mt-1 w-full border rounded-lg p-2">
                       <option value="">Pilih Departemen</option>
                       {(departments || []).map(d => (
                         <option key={d.id} value={d.id}>{d.name}</option>
                       ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                    <select name="position_id" defaultValue={editingEmployee?.position_id} required className="mt-1 w-full border rounded-lg p-2">
                       <option value="">Pilih Jabatan</option>
                       {(positions || []).map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary (IDR)</label>
                  <input name="salary" type="number" defaultValue={editingEmployee?.salary} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                  <input name="hire_date" type="date" defaultValue={editingEmployee?.hire_date} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" defaultValue={editingEmployee?.status || 'active'} className="mt-1 w-full border rounded-lg p-2">
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="terminated">Diberhentikan</option>
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
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingVacancy ? 'Ubah Lowongan' : 'Pasang Lowongan Baru'}</h2>
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
                alert('Gagal menyimpan lowongan');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Judul Pekerjaan</label>
                  <input name="title" defaultValue={editingVacancy?.title} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <input name="category" defaultValue={editingVacancy?.category || 'Umum'} required className="mt-1 w-full border rounded-lg p-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Lowongan</label>
                    <select
                      value={editingVacancy?.type || 'Full-time'}
                      onChange={(e) => setEditingVacancy(prev => prev ? { ...prev, type: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="Full-time">Penuh Waktu</option>
                      <option value="Part-time">Paruh Waktu</option>
                      <option value="Contract">Kontrak</option>
                      <option value="Internship">Magang</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
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
                <button type="button" onClick={() => setIsVacancyModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

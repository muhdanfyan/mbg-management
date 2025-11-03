import React, { useState } from 'react';
import { Users, Briefcase, Calendar, DollarSign, Search, UserPlus, Clock, CheckCircle } from 'lucide-react';

const mockEmployees = [
  { id: 1, number: 'EMP-001', name: 'Ahmad Fauzi', position: 'Head Chef', department: 'Kitchen Operations', hireDate: '2023-01-15', salary: 12000000, status: 'active', photo: '👨‍🍳' },
  { id: 2, number: 'EMP-002', name: 'Siti Nurhaliza', position: 'Finance Manager', department: 'Finance', hireDate: '2023-02-20', salary: 15000000, status: 'active', photo: '👩‍💼' },
  { id: 3, number: 'EMP-003', name: 'Budi Santoso', position: 'Procurement Officer', department: 'Procurement', hireDate: '2023-03-10', salary: 9000000, status: 'active', photo: '👨‍💼' },
  { id: 4, number: 'EMP-004', name: 'Rina Wijaya', position: 'HR Specialist', department: 'Human Resources', hireDate: '2023-04-05', salary: 10000000, status: 'active', photo: '👩' },
  { id: 5, number: 'EMP-005', name: 'Dedi Supardi', position: 'Driver', department: 'Logistics', hireDate: '2023-05-12', salary: 6000000, status: 'active', photo: '👨' },
  { id: 6, number: 'EMP-006', name: 'Maya Kusuma', position: 'Kitchen Staff', department: 'Kitchen Operations', hireDate: '2023-06-18', salary: 5500000, status: 'active', photo: '👩‍🍳' },
];

const mockVacancies = [
  { id: 1, title: 'Senior Chef', department: 'Kitchen Operations', status: 'open', posted: '2024-03-01', applicants: 12 },
  { id: 2, title: 'Accountant', department: 'Finance', status: 'open', posted: '2024-03-05', applicants: 8 },
  { id: 3, title: 'Kitchen Helper', department: 'Kitchen Operations', status: 'open', posted: '2024-03-10', applicants: 24 },
];

const mockApplicants = [
  { id: 1, vacancyId: 1, name: 'Rizki Pratama', email: 'rizki@email.com', status: 'interview', interviewDate: '2024-03-20 10:00' },
  { id: 2, vacancyId: 1, name: 'Indah Permata', email: 'indah@email.com', status: 'applied', interviewDate: null },
  { id: 3, vacancyId: 2, name: 'Andi Wijaya', email: 'andi@email.com', status: 'accepted', interviewDate: null },
];

export const HR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'recruitment' | 'attendance' | 'payroll'>('employees');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen SDM</h1>
          <p className="text-gray-600 mt-1">Kelola karyawan dan rekrutmen</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
              Employee Database
            </button>
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'recruitment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recruitment
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'payroll'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payroll
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
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl">{employee.photo}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{employee.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{employee.position}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadge(employee.status)}`}>
                          {employee.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium text-gray-900">{employee.number}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium text-gray-900">{employee.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Hire Date:</span>
                        <span className="font-medium text-gray-900">{employee.hireDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Vacancies</h3>
                  <div className="space-y-4">
                    {mockVacancies.map((vacancy) => (
                      <div key={vacancy.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{vacancy.title}</h4>
                            <p className="text-sm text-gray-600">{vacancy.department}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {vacancy.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Posted: {vacancy.posted}</span>
                          <span className="font-medium text-blue-600">{vacancy.applicants} applicants</span>
                        </div>
                        <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          View Applicants
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Tracking</h3>
                  <div className="space-y-4">
                    {mockApplicants.map((applicant) => {
                      const vacancy = mockVacancies.find(v => v.id === applicant.vacancyId);
                      return (
                        <div key={applicant.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{applicant.name}</h4>
                              <p className="text-sm text-gray-600">{applicant.email}</p>
                              <p className="text-xs text-gray-500 mt-1">Applied for: {vacancy?.title}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApplicantStatusBadge(applicant.status)}`}>
                              {applicant.status}
                            </span>
                          </div>
                          {applicant.interviewDate && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Calendar className="w-4 h-4" />
                                <span>Interview: {applicant.interviewDate}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                              Accept
                            </button>
                            <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                              Interview
                            </button>
                            <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-700 font-medium mb-1">Present Today</p>
                  <p className="text-2xl font-bold text-green-900">152</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-red-600 mb-2" />
                  <p className="text-sm text-red-700 font-medium mb-1">Absent</p>
                  <p className="text-2xl font-bold text-red-900">4</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Calendar className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-700 font-medium mb-1">On Leave</p>
                  <p className="text-2xl font-bold text-orange-900">8</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Staff</p>
                  <p className="text-2xl font-bold text-blue-900">164</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Calendar - March 2024</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-center p-3 rounded-lg ${
                        day === 15
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                  <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Payroll (March)</p>
                  <p className="text-2xl font-bold text-blue-900">Rp 1.2B</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-700 font-medium mb-1">Paid</p>
                  <p className="text-2xl font-bold text-green-900">142</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                  <Clock className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-700 font-medium mb-1">Pending</p>
                  <p className="text-2xl font-bold text-orange-900">14</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Base Salary</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Allowances</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Deductions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Net Salary</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmployees.map((employee) => {
                      const allowances = 1000000;
                      const deductions = 500000;
                      const netSalary = employee.salary + allowances - deductions;
                      return (
                        <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{employee.photo}</span>
                              <span className="font-medium text-gray-900">{employee.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{employee.position}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            Rp {(employee.salary / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4 px-4 text-sm text-green-600">
                            +Rp {(allowances / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4 px-4 text-sm text-red-600">
                            -Rp {(deductions / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-blue-600">
                            Rp {(netSalary / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Paid
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

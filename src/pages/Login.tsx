import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

const DEMO_USERS = [
  { email: 'superadmin@mbg.com', password: 'pass123', role: 'Super Admin', description: 'Full system access' },
  { email: 'manager@mbg.com', password: 'pass123', role: 'Manager', description: 'Management access' },
  { email: 'finance@mbg.com', password: 'pass123', role: 'Finance', description: 'Financial module' },
  { email: 'hrd@mbg.com', password: 'pass123', role: 'HRD', description: 'HR module' },
  { email: 'procurement@mbg.com', password: 'pass123', role: 'Procurement', description: 'Procurement module' },
  { email: 'staff@mbg.com', password: 'pass123', role: 'Staff', description: 'Limited access' },
  { email: 'pic.panakkukang@mbg.com', password: 'pass123', role: 'PIC Dapur', description: 'Kitchen management' },
  { email: 'akuntan.panakkukang@mbg.com', password: 'pass123', role: 'Akuntan Dapur', description: 'Kitchen financial admin' },
  { email: 'investor@mbg.com', password: 'pass123', role: 'Investor', description: 'Investment monitoring' },
  { email: 'koperasi@mbg.com', password: 'pass123', role: 'Operator Koperasi', description: 'Audit & daily spending' },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  
  // Detect environment: Show demo accounts on all EXCEPT main production domain
  const isDemoEnv = 
    window.location.hostname !== 'mbgone.id' && 
    window.location.hostname !== 'www.mbgone.id';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userEmail: string) => {
    const demoUser = DEMO_USERS.find(u => u.email === userEmail);
    setEmail(userEmail);
    setPassword(demoUser?.password || 'pass123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className={`max-w-5xl w-full grid ${isDemoEnv ? 'md:grid-cols-2' : 'max-w-md'} gap-4`}>
        <div className="bg-white rounded-xl shadow-xl p-4 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100">
              <img src="/logo-wahdah.png?v=2" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Wahdah MBG</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="your.email@mbg.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => window.location.href = '/?page=workflow'}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors border-b border-transparent hover:border-blue-700"
              >
                Lihat Alur Kerja Sistem (Flowchart)
              </button>
            </div>
          </form>
        </div>

        {isDemoEnv && (
          <div className="bg-white rounded-xl shadow-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Demo Accounts</h3>
            <p className="text-sm text-gray-600 mb-6">
              Click any account below to auto-fill the login form
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user.email)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-[#1A4D43] hover:bg-[#F0F7F5] transition-all group text-center"
                >
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1A4D43] truncate">
                    {user.role}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">
                    Demo Account
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Password Default:</strong> pass123
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

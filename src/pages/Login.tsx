import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, ChefHat, AlertCircle } from 'lucide-react';

const DEMO_USERS = [
  { email: 'superadmin@mbg.com', password: 'pass123', role: 'Super Admin', description: 'Full system access' },
  { email: 'manager@mbg.com', password: 'pass123', role: 'Manager', description: 'Management access' },
  { email: 'finance@mbg.com', password: 'pass123', role: 'Finance', description: 'Financial module' },
  { email: 'hrd@mbg.com', password: 'pass123', role: 'HRD', description: 'HR module' },
  { email: 'procurement@mbg.com', password: 'pass123', role: 'Procurement', description: 'Procurement module' },
  { email: 'staff@mbg.com', password: 'pass123', role: 'Staff', description: 'Limited access' },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

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
    setEmail(userEmail);
    setPassword('pass123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
              <img src="/logo-wahdah.png?v=2" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wahdah MBG</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Demo Accounts</h3>
          <p className="text-sm text-gray-600 mb-6">
            Click any account below to auto-fill the login form
          </p>

          <div className="space-y-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user.email)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Demo
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                <p className="text-xs text-gray-500">{user.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>All accounts use password:</strong> pass123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

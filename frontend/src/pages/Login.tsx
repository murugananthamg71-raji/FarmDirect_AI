import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogIn, Sprout, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);

      // Redirect based on role
      const role = res.data.user.role;
      if (role === 'FARMER') navigate('/farmer-dashboard');
      else if (role === 'BUYER') navigate('/buyer-dashboard');
      else if (role === 'LOGISTICS') navigate('/logistics-dashboard');
      else if (role === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-lightbg text-primary mb-2">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-darktext">Sign in to FarmDirect AI</h2>
          <p className="text-sm text-gray-500">Direct agricultural marketplace platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@demo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Credentials Buttons */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="text-xs font-bold text-gray-500 text-center uppercase">
            Quick Fill Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setDemoAccount('farmer@demo.com')}
              className="p-2 rounded-lg bg-green-50 text-primary font-semibold hover:bg-green-100 text-left border border-green-200"
            >
              🧑‍🌾 Farmer (farmer@demo.com)
            </button>
            <button
              onClick={() => setDemoAccount('buyer@demo.com')}
              className="p-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 text-left border border-blue-200"
            >
              🛒 Buyer (buyer@demo.com)
            </button>
            <button
              onClick={() => setDemoAccount('logistics@demo.com')}
              className="p-2 rounded-lg bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 text-left border border-purple-200"
            >
              🚚 Logistics (logistics@demo.com)
            </button>
            <button
              onClick={() => setDemoAccount('admin@demo.com')}
              className="p-2 rounded-lg bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100 text-left border border-amber-200"
            >
              🛡️ Admin (admin@demo.com)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};


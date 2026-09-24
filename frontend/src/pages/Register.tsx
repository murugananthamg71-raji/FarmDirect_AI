import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import { UserPlus, Sprout, AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'BUYER';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role-specific fields
  const [farmName, setFarmName] = useState('');
  const [isFpo, setIsFpo] = useState(false);
  const [district, setDistrict] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('Mini Truck (1.5 Ton)');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        full_name: fullName,
        email,
        password,
        phone,
        role,
        district,
        state,
      };

      if (role === 'FARMER') {
        payload.farm_name = farmName || `${fullName}'s Farm`;
        payload.is_fpo = isFpo;
      } else if (role === 'BUYER') {
        payload.delivery_address = deliveryAddress || `${district}, ${state}`;
      } else if (role === 'LOGISTICS') {
        payload.vehicle_type = vehicleType;
        payload.vehicle_number = vehicleNumber || 'TN-37-AZ-9988';
      }

      const res = await api.post('/auth/register', payload);
      login(res.data.access_token, res.data.user);

      if (role === 'FARMER') navigate('/farmer-dashboard');
      else if (role === 'BUYER') navigate('/buyer-dashboard');
      else if (role === 'LOGISTICS') navigate('/logistics-dashboard');
      else navigate('/admin-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-lightbg text-primary mb-2">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-darktext">Create FarmDirect Account</h2>
          <p className="text-sm text-gray-500">Choose your role and get started in seconds</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  role === 'BUYER'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span>🛒 Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  role === 'FARMER'
                    ? 'bg-green-50 border-primary text-primary shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span>🧑‍🌾 Farmer / FPO</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('LOGISTICS')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  role === 'LOGISTICS'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span>🚚 Logistics</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramanathan K."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Role-based Dynamic Fields */}
          {role === 'FARMER' && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Farm / Enterprise Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Green Agri Organic Farm"
                  className="w-full px-3 py-1.5 rounded-lg border border-green-300 bg-white text-sm"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs font-bold text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFpo}
                  onChange={(e) => setIsFpo(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Register as Farmer Producer Organization (FPO)</span>
              </label>
            </div>
          )}

          {role === 'BUYER' && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Door No, Street Name, Landmark..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-sm"
              />
            </div>
          )}

          {role === 'LOGISTICS' && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-sm"
                >
                  <option value="Three Wheeler (500 kg)">Three Wheeler (500 kg)</option>
                  <option value="Mini Truck (1.5 Ton)">Mini Truck (1.5 Ton)</option>
                  <option value="Heavy Commercial Vehicle (5 Ton)">Heavy Commercial Vehicle (5 Ton)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase mb-1">Vehicle Reg Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="TN-37-AZ-9988"
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};


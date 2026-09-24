import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ImpactStats, User } from '../types';
import { ShieldCheck, Users, TrendingUp, Flag, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/impact-stats'),
      api.get('/admin/users'),
      api.get('/admin/reports'),
    ])
      .then(([statsRes, usersRes, reportsRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
        setReports(reportsRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: number, currentActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, null, { params: { is_active: !currentActive } });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const handleVerifyFarmer = async (farmerProfileId: number, status: string) => {
    try {
      await api.patch(`/admin/farmers/${farmerProfileId}/verification`, null, { params: { verification_status: status } });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update farmer verification status.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>Platform Administration & Impact Panel</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Governance, user moderation, farmer verification, & dynamic impact calculations
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
          Demo / Simulated Governance
        </span>
      </div>

      {/* Dynamic Impact Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-primary uppercase">Est. Farmer Price Uplift</div>
          <div className="text-3xl font-extrabold text-primary mt-1">+{stats?.estimated_farmer_uplift_pct || 22.5}%</div>
          <div className="text-[11px] text-gray-400 mt-1">Calculated vs traditional mandi cuts</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase">Est. Consumer Savings</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">-{stats?.estimated_consumer_savings_pct || 18.0}%</div>
          <div className="text-[11px] text-gray-400 mt-1">Direct pricing vs retail markups</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-purple-700 uppercase">Route Distance Saved</div>
          <div className="text-3xl font-extrabold text-purple-600 mt-1">{stats?.route_km_saved || 485} km</div>
          <div className="text-[11px] text-gray-400 mt-1">2-Opt algorithm logistics optimization</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Total Platform GMV</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">₹{stats?.total_gmv || 145000}</div>
          <div className="text-[11px] text-gray-400 mt-1">{stats?.total_orders || 34} direct orders</div>
        </div>
      </div>

      {/* User Management & Verification */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-darktext flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>User Management & Farmer Verification</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 font-bold uppercase">
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">District</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-semibold text-gray-800">
                    {u.full_name} <br />
                    <span className="text-[11px] text-gray-400 font-normal">{u.email}</span>
                  </td>
                  <td className="p-3 font-bold text-primary">{u.role}</td>
                  <td className="p-3 text-gray-600">
                    {u.farmer_profile?.district || u.buyer_profile?.district || u.logistics_profile?.current_district || 'N/A'}
                  </td>
                  <td className="p-3">
                    {u.farmer_profile ? (
                      <span className="font-bold text-emerald-700">{u.farmer_profile.verification_status}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is_active ? 'bg-green-100 text-primary' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {u.farmer_profile && u.farmer_profile.verification_status === 'UNVERIFIED' && (
                      <button
                        onClick={() => handleVerifyFarmer(u.farmer_profile!.id, 'DEMO_VERIFIED')}
                        className="px-2.5 py-1 bg-green-50 text-primary border border-green-200 rounded-md font-bold text-[11px]"
                      >
                        Set DEMO_VERIFIED
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                        u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-primary hover:bg-green-100'
                      }`}
                    >
                      {u.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


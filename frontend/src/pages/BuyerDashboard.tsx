import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ShoppingBag, Clock, DollarSign, ArrowRight } from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/buyer')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span>Consumer & Bulk Buyer Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your farm-direct produce orders, direct savings, & order history
          </p>
        </div>

        <Link
          to="/marketplace"
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <span>Browse Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Orders Placed</div>
          <div className="text-3xl font-extrabold text-primary mt-1">{data?.total_orders || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Direct from farmers</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Active / In-Transit Orders</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{data?.pending_orders || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Being packed or delivered</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase">Total Spent</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">₹{data?.total_spent || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">18% saved vs retail markets</div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-darktext flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>My Recent Orders</span>
        </h3>

        {data?.recent_orders?.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No recent orders found.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {data?.recent_orders?.map((o: any) => (
              <div key={o.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-gray-600 mt-1">
                    Producer: <span className="font-semibold text-gray-800">{o.farm_name || o.farmer_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-primary text-base">₹{o.total_amount}</span>
                  <Link to={`/orders/${o.id}/tracking`} className="px-3 py-1.5 bg-lightbg text-primary rounded-lg font-bold text-xs">
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


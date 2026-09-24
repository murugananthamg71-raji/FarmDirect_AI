import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  Sprout,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  PlusCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    api
      .get('/dashboard/farmer')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update order status');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" />
            <span>Farmer & FPO Producer Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time harvest listings, direct sales earnings, & order fulfillment management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-product"
            className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Harvest</span>
          </Link>
          <Link
            to="/ai-tools"
            className="px-4 py-2.5 bg-lightbg hover:bg-green-100 text-primary border border-green-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>AI Tools</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Total Direct Earnings</div>
          <div className="text-3xl font-extrabold text-primary mt-1">₹{data?.total_earnings || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Net payouts directly from buyers</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase">Active Listings</div>
          <div className="text-3xl font-extrabold text-darktext mt-1">{data?.active_listings || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Produce items available on marketplace</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Pending Orders</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{data?.pending_orders || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Awaiting packing / confirmation</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase">Completed Deliveries</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{data?.delivered_orders || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Successfully fulfilled orders</div>
        </div>
      </div>

      {/* Incoming Orders Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-darktext flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Recent Customer Orders</span>
        </h3>

        {data?.recent_orders?.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No recent customer orders yet.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {data?.recent_orders?.map((o: any) => (
              <div key={o.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">#{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-gray-600">
                    Items: {o.items.map((i: any) => `${i.product_name} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                  <div className="text-gray-400 text-[11px]">Address: {o.delivery_address}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-primary text-base mr-2">₹{o.total_amount}</span>

                  {o.status === 'PLACED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'CONFIRMED')}
                      className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-xs"
                    >
                      Confirm Order
                    </button>
                  )}

                  {o.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'PACKED')}
                      className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-lg text-xs"
                    >
                      Mark PACKED
                    </button>
                  )}

                  {o.status === 'PACKED' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'READY_FOR_PICKUP')}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs"
                    >
                      Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ShoppingBag, Eye, Calendar, MapPin } from 'lucide-react';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-primary" />
        <span>My Harvest Orders ({orders.length})</span>
      </h1>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
          <p className="text-sm text-gray-500">You haven't placed any direct produce orders yet.</p>
          <Link to="/marketplace" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-primary text-sm">#{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    Producer: <span className="font-semibold text-gray-800">{o.farm_name || o.farmer_name}</span>
                  </div>
                  <div>
                    Items: {o.items.map((i) => `${i.product_name} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(o.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-500">Total: </span>
                  <span className="text-lg font-extrabold text-primary">₹{o.total_amount.toFixed(2)}</span>
                </div>

                <Link
                  to={`/orders/${o.id}/tracking`}
                  className="px-4 py-2 rounded-xl bg-lightbg hover:bg-green-100 text-primary font-bold text-xs transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Timeline</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


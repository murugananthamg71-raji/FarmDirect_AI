import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Truck, MapPin, CheckCircle, Navigation, ArrowRight } from 'lucide-react';

export const LogisticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogisticsData = () => {
    setLoading(true);
    Promise.all([api.get('/dashboard/logistics'), api.get('/logistics/deliveries')])
      .then(([dashRes, delivRes]) => {
        setData(dashRes.data);
        setDeliveries(delivRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const handleRespondDelivery = async (deliveryId: number, accept: boolean) => {
    try {
      await api.post(`/logistics/deliveries/${deliveryId}/respond`, null, { params: { accept } });
      fetchLogisticsData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to respond to delivery.');
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: number, status: string) => {
    try {
      await api.patch(`/logistics/deliveries/${deliveryId}/status`, null, { params: { status_str: status } });
      fetchLogisticsData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update delivery status.');
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
            <Truck className="w-6 h-6 text-primary" />
            <span>Logistics Partner Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            2-Opt batched delivery pickup pool, route optimization, & delivery tracking
          </p>
        </div>

        <Link
          to="/logistics-route"
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Interactive Route Map</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Available Pool Assignments</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{data?.unassigned_pool_count || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Orders ready for pickup in district</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-primary uppercase">My Active Deliveries</div>
          <div className="text-3xl font-extrabold text-primary mt-1">{data?.active_deliveries || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Accepted / In Transit</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase">Completed Deliveries</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{data?.completed_deliveries || 0}</div>
          <div className="text-[11px] text-gray-400 mt-1">Successfully fulfilled</div>
        </div>
      </div>

      {/* Deliveries Pool & Active Deliveries List */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-darktext">Delivery Pool & Active Assignments</h3>

        {deliveries.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No deliveries available.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {deliveries.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">Delivery #{d.id}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="text-gray-700 font-medium">
                    Pickup: <span className="font-bold text-gray-900">{d.pickup_district}</span> → Drop: <span className="font-bold text-gray-900">{d.drop_district}</span> ({d.distance_km} km)
                  </div>
                  <div className="text-gray-500 text-[11px]">Address: {d.drop_address}</div>
                </div>

                <div className="flex items-center gap-2">
                  {d.status === 'UNASSIGNED' && (
                    <button
                      onClick={() => handleRespondDelivery(d.id, true)}
                      className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-lg text-xs"
                    >
                      Accept Assignment
                    </button>
                  )}

                  {d.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(d.id, 'PICKED_UP')}
                      className="px-3.5 py-1.5 bg-purple-600 text-white font-bold rounded-lg text-xs"
                    >
                      Confirm PICKED_UP
                    </button>
                  )}

                  {d.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(d.id, 'IN_TRANSIT')}
                      className="px-3.5 py-1.5 bg-orange-600 text-white font-bold rounded-lg text-xs"
                    >
                      Mark IN_TRANSIT
                    </button>
                  )}

                  {d.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(d.id, 'DELIVERED')}
                      className="px-3.5 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs"
                    >
                      Mark DELIVERED
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


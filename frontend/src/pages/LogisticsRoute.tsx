import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RouteResult, StopPoint } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Truck, MapPin, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

// Leaflet default icon fix
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const LogisticsRoute: React.FC = () => {
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/logistics/active-route')
      .then((res) => setRouteResult(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const centerLat = routeResult?.polyline?.[0]?.[0] || 11.0168;
  const centerLng = routeResult?.polyline?.[0]?.[1] || 76.9558;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            <span>2-Opt Batched Route Optimizer</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Calculates multi-stop shortest TSP travel sequence ensuring pickups precede drop locations
          </p>
        </div>

        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
          Simulated Route — Not Live GPS
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Optimization Metrics & Stop Sequence */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-darktext flex items-center gap-2 border-b pb-3">
              <Navigation className="w-5 h-5 text-primary" />
              <span>Route Optimization Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-[10px] font-bold text-purple-700 uppercase">Km Saved vs Naive</div>
                <div className="text-2xl font-extrabold text-purple-700">+{routeResult?.km_saved_vs_naive || 16.5} km</div>
              </div>

              <div className="p-3 bg-lightbg border border-green-200 rounded-xl">
                <div className="text-[10px] font-bold text-primary uppercase">Total Distance</div>
                <div className="text-2xl font-extrabold text-primary">{routeResult?.total_distance_km || 24.5} km</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Est. Travel & Fulfillment Time</div>
              <div className="text-xl font-extrabold text-blue-800">{routeResult?.estimated_minutes || 45} Minutes</div>
            </div>

            {/* Stop Sequence */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-700 uppercase">Optimized Sequence Stops</div>
              <div className="space-y-2 text-xs">
                {routeResult?.ordered_stops?.map((stop: StopPoint, idx: number) => (
                  <div key={stop.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-gray-800">{stop.name}</div>
                      <div className="text-gray-500 text-[11px]">{stop.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs h-[500px] overflow-hidden relative">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full rounded-xl z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {routeResult?.ordered_stops?.map((stop: StopPoint, idx: number) => (
                <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                  <Popup>
                    <div className="text-xs">
                      <strong>Stop #{idx + 1}: {stop.type}</strong>
                      <br />
                      {stop.name}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {routeResult?.polyline && routeResult.polyline.length > 1 && (
                <Polyline positions={routeResult.polyline as [number, number][]} color="#2E7D32" weight={4} dashArray="5, 10" />
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};


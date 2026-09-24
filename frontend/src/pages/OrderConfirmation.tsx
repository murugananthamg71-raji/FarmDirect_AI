import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const orders = location.state?.orders || ['FD-2026-09-DEMO'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-lightbg text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl font-extrabold text-darktext">Order Placed Successfully!</h1>
      <p className="text-sm text-gray-600">
        Your harvest orders have been dispatched directly to the farmers for packing & route dispatch.
      </p>

      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2 max-w-md mx-auto">
        <div className="text-xs font-bold text-gray-500 uppercase">Order Reference Numbers</div>
        {orders.map((o: string) => (
          <div key={o} className="font-extrabold text-primary text-base">
            #{o}
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-dark transition flex items-center justify-center space-x-2"
        >
          <span>Track My Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/marketplace"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
        >
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ShieldCheck, CreditCard, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('RS Puram, Coimbatore, Tamil Nadu - 641002');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/orders', {
        delivery_address: deliveryAddress,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
      });

      clearCart();
      navigate('/order-confirmation', { state: { orders: res.data.orders } });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Mandatory Simulated Payment Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
        <div className="text-xs text-amber-900">
          <span className="font-extrabold uppercase">Simulated Payment Gateway</span> — This is a demo prototype. No real money will be charged from your account.
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
        <h1 className="text-2xl font-extrabold text-darktext">Order Checkout</h1>

        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Address</label>
            <textarea
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium"
            />
          </div>

          {/* Delivery Slot */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preferred Delivery Slot</label>
            <select
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
            >
              <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
            </select>
          </div>

          {/* Payment Method Options */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Simulated Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'UPI' ? 'bg-green-50 border-primary text-primary shadow-xs' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span>📱 UPI (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'CARD' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span>💳 Card (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'COD' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span>💵 Cash on Delivery</span>
              </button>
            </div>
          </div>

          {/* Order Summary Line */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-sm font-bold text-darktext">
            <span>Total Payable Amount:</span>
            <span className="text-xl font-extrabold text-primary">₹{totalAmount.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{loading ? 'Processing Order...' : 'Confirm & Place Order'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};


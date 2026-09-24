import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-lightbg text-primary inline-flex">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-darktext">Your FarmDirect cart is empty</h2>
        <p className="text-xs text-gray-500">Explore fresh harvests directly from verified farmers.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-xs hover:bg-primary-dark transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <span>Shopping Cart ({cartItems.length} Produce Items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase">{item.product.category}</span>
                <h4 className="font-bold text-darktext text-sm">{item.product.name}</h4>
                <div className="text-xs text-gray-500">
                  Seller: <span className="font-semibold text-gray-700">{item.product.farm_name || item.product.farmer_name}</span>
                </div>
                <div className="text-xs font-extrabold text-primary">
                  ₹{item.price_per_unit} / {item.product.unit}
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white text-xs">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 font-bold text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 font-bold text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-darktext border-b pb-2">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items):</span>
                <span className="font-bold text-gray-800">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated Direct Logistics:</span>
                <span className="font-bold text-fresh">FREE (Demo)</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-darktext pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs text-primary space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Direct Multi-Farmer Order Splitting</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Orders will be split into individual fulfillment orders per farmer for direct transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


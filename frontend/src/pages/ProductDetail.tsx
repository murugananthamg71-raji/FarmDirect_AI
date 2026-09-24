import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { FairPriceBreakdown } from '../components/FairPriceBreakdown';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  ShoppingCart,
  Star,
  Flag,
  ArrowLeft,
  Tag,
  CheckCircle,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Quality Concern');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        return api.get(`/products/${id}/reviews`);
      })
      .then((res) => setReviews(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
        <button onClick={() => navigate('/marketplace')} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">
          Return to Marketplace
        </button>
      </div>
    );
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reports', {
        product_id: product.id,
        reason: reportReason,
        details: reportDetails || 'Listing report submitted by buyer',
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportModal(false);
        setReportSubmitted(false);
      }, 2000);
    } catch (err) {
      alert('Failed to submit report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/marketplace')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-xs relative">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            {product.is_organic && (
              <span className="absolute top-4 left-4 bg-fresh text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                🌱 100% Organic Certified
              </span>
            )}
          </div>

          {/* Farmer Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Direct Harvest Producer</span>
              <h4 className="text-base font-bold text-darktext flex items-center gap-1.5">
                <span>{product.farm_name || product.farmer_name}</span>
                {product.is_fpo && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">FPO</span>}
              </h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{product.district}, {product.state}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-primary border border-green-200">
                <ShieldCheck className="w-4 h-4" />
                <span>{product.verification_status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase">{product.category}</span>
              <button
                onClick={() => setReportModal(true)}
                className="text-xs font-semibold text-gray-400 hover:text-red-600 flex items-center gap-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Listing</span>
              </button>
            </div>

            <h1 className="text-3xl font-extrabold text-darktext mt-1">{product.name}</h1>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing & Bulk Tiers */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-primary">₹{product.price_per_unit}</span>
                <span className="text-sm text-gray-500 font-semibold"> / {product.unit}</span>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Stock: {product.quantity} {product.unit}
              </span>
            </div>

            {/* Bulk Tiers */}
            {product.price_tiers && product.price_tiers.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>Bulk Discount Tiers</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.price_tiers.map((t) => (
                    <div key={t.id} className="bg-white p-2 rounded-lg border border-amber-200 font-semibold text-amber-800">
                      ≥ {t.min_quantity} {product.unit}: <span className="font-bold text-primary">₹{t.price_per_unit}</span>/{product.unit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 font-bold text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-center font-bold text-sm focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 font-bold text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} {product.unit} to Cart</span>
              </button>
            </div>
          </div>

          {/* Fair Price Breakdown */}
          <FairPriceBreakdown pricePerUnit={product.price_per_unit} unit={product.unit} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-6">
        <h3 className="text-xl font-bold text-darktext flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Verified Buyer Reviews ({reviews.length})</span>
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500">No reviews submitted yet for this harvest.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>{r.buyer_name}</span>
                  <div className="flex text-amber-500">
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Listing Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-darktext">Report Product Listing</h3>
            {reportSubmitted ? (
              <div className="p-4 bg-green-50 text-primary font-semibold text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Report submitted to admin moderation queue.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                  >
                    <option value="Quality Concern">Quality Concern / Misleading Description</option>
                    <option value="Inaccurate Price">Inaccurate Price / Stock Information</option>
                    <option value="Prohibited Content">Unverified organic claim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Details</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context for admin review..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


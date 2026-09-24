import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { api } from '../services/api';
import { StepTimeline } from '../components/StepTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Clock, Star, CheckCircle, ShieldCheck } from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.items.length) return;
    try {
      await api.post('/reviews', {
        product_id: order.items[0].product_id,
        rating,
        comment,
      });
      setReviewSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Orders</span>
      </button>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-darktext flex items-center gap-2">
              <span>Order #{order.order_number}</span>
              <StatusBadge status={order.status} />
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Producer: <span className="font-semibold text-gray-800">{order.farm_name || order.farmer_name}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-500">Total Payable: </span>
            <span className="text-2xl font-extrabold text-primary">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Timeline Visualizer */}
        <StepTimeline currentStatus={order.status} />
      </div>

      {/* Status History Audit Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-darktext flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Status Update History</span>
        </h3>

        <div className="space-y-3 text-xs">
          {order.status_history.map((h) => (
            <div key={h.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-800">
                  Status changed to <span className="text-primary">{h.to_status}</span>
                </div>
                {h.notes && <div className="text-gray-500">{h.notes}</div>}
              </div>
              <div className="text-right text-gray-400 text-[11px]">
                <div>Role: {h.created_by_role}</div>
                <div>{new Date(h.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Form (Only Unlocked on DELIVERED) */}
      {order.status === 'DELIVERED' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-darktext flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Leave Verified Product Review</span>
          </h3>

          {reviewSubmitted ? (
            <div className="p-4 bg-green-50 text-primary font-semibold text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Thank you! Your verified review has been published.</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-xl font-bold p-1 ${rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Comment</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share harvest quality, freshness, and packaging feedback..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-dark transition"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};


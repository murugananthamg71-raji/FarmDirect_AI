import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Notification } from '../types';
import { Bell, CheckCircle2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    api
      .get('/notifications')
      .then((res) => setNotifications(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        <span>Notifications Center</span>
      </h1>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                n.is_read ? 'bg-white border-gray-100' : 'bg-green-50/50 border-green-200'
              }`}
            >
              <div className="space-y-1">
                <h4 className="font-bold text-darktext text-sm">{n.title}</h4>
                <p className="text-xs text-gray-600">{n.message}</p>
                <span className="text-[10px] text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="p-2 text-primary hover:bg-green-100 rounded-lg transition"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


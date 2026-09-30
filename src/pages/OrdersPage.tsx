import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface OrdersPageProps {
  onNavigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { error } = useToast();

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackParam = urlParams.get('track');
    if (trackParam) {
      setTrackOrderNumber(trackParam);
    }

    if (user) {
      setIsLoadingUserOrders(true);
      fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('saturn_token')}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setMyOrders(data.data || []);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingUserOrders(false));
    }
  }, [user]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim() || !trackPhone.trim()) {
      error('Please enter both your Order Number and registered phone number.');
      return;
    }

    setIsTracking(true);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: trackOrderNumber.trim(),
          phone: trackPhone.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTrackedOrder(data.data);
      } else {
        error(data.message || 'No matching order found.');
        setTrackedOrder(null);
      }
    } catch {
      error('Network error during order tracking');
    } finally {
      setIsTracking(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">SHIPPED</span>;
      case 'PACKED':
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">{status}</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Order Tracking & History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor shipment status or review past computer hardware purchases
        </p>
      </div>

      {/* 1. PUBLIC ORDER TRACKING LOOKUP FORM */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Track Order Status</h2>
        </div>
        <p className="text-xs text-slate-500">
          Enter your Saturn Tech BD Order ID (e.g. STB-2026-1042) and the phone number used during checkout.
        </p>

        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={trackOrderNumber}
            onChange={(e) => setTrackOrderNumber(e.target.value.toUpperCase())}
            placeholder="Order ID (STB-2026-XXXX)"
            className="px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <input
            type="tel"
            required
            value={trackPhone}
            onChange={(e) => setTrackPhone(e.target.value)}
            placeholder="Contact Phone (018XXXXXXXX)"
            className="px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 tabular-nums"
          />
          <button
            type="submit"
            disabled={isTracking}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            {isTracking ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        {/* Tracked Order Result Card */}
        {trackedOrder && (
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Order #{trackedOrder.orderNumber}
                </span>
                <div className="text-[11px] text-slate-500">
                  Placed on {new Date(trackedOrder.createdAt).toLocaleString('en-US')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(trackedOrder.orderStatus)}
                <button
                  onClick={() => onNavigate(`/order-success?id=${trackedOrder.id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Invoice →
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Status Timeline:</span>
              <div className="space-y-2">
                {trackedOrder.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">{h.status}:</span>{' '}
                      <span className="text-slate-600">{h.note}</span>
                      <div className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CUSTOMER ORDERS (IF LOGGED IN) */}
      {user && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">My Purchase History</h2>

          {isLoadingUserOrders ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading your orders...</div>
          ) : myOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-900">No orders yet</div>
              <p className="text-xs text-slate-500">You haven't completed any orders with this account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-sm text-slate-900">
                        Order #{order.orderNumber}
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        · Payment: {order.paymentMethod} ({order.paymentStatus})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                      <button
                        onClick={() => onNavigate(`/order-success?id=${order.id}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-800">
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          ৳{it.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">
                      Shipping to: {order.deliveryAddress.district} ({order.shippingMethod})
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 tabular-nums">
                      Total: ৳{order.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Truck, Package, AlertCircle, MessageCircle, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { OrderTimeline } from '../components/OrderTimeline';
import { useStore } from '../context/StoreContext';

export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useStore();

  const [orderIdInput, setOrderIdInput] = useState(searchParams.get('orderId') || '');
  const [contactInput, setContactInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(id.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No order found matching this Order ID. Please check and retry.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      fetchOrder(paramId);
    }
  }, [searchParams]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
          Real-Time Shipment Tracking
        </span>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Track Your NIRA Shipment
        </h1>
        <p className="text-stone-500 text-xs">
          Enter your unique NIRA Order ID (e.g., NIRA-20260910-001) to view live progress from our Kerala facility to your doorstep.
        </p>
      </div>

      {/* Search Bar Form */}
      <form
        onSubmit={handleTrackSubmit}
        className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center"
      >
        <div className="relative flex-1 w-full">
          <Package className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Order ID (e.g. CP-20260910-001)"
            value={orderIdInput}
            onChange={e => setOrderIdInput(e.target.value.toUpperCase())}
            required
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm font-mono uppercase rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !orderIdInput.trim()}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>{isLoading ? 'Locating...' : 'Track Package'}</span>
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result View */}
      {order && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Status Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[11px] text-stone-400 font-mono">ORDER #{order.orderId}</span>
                <h2 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                  Status: <span className="text-emerald-800">{order.orderStatus}</span>
                </h2>
              </div>
              <div className="text-xs sm:text-right">
                <span className="text-stone-400">Estimated Delivery:</span>
                <p className="font-bold text-stone-800 text-sm flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>{order.estimatedDelivery}</span>
                </p>
              </div>
            </div>

            {/* Visual Timeline Component */}
            <div className="py-4">
              <OrderTimeline
                timeline={order.trackingTimeline}
                currentStatus={order.orderStatus}
              />
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-800" />
                Destination Address
              </h3>
              <div className="text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-900">{order.customerName}</p>
                <p>{order.shippingAddress?.house}, {order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pinCode}</p>
                <p className="text-stone-400 pt-1">Recipient: {order.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-800" />
                Shipment Contents ({order.items.length} items)
              </h3>
              <div className="divide-y divide-stone-100 max-h-40 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-stone-800 font-medium truncate max-w-[200px]">{item.name}</span>
                    <span className="text-stone-500 font-mono">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Callout */}
          <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-600 text-center sm:text-left">
              <p className="font-bold text-stone-900">Need delivery assistance?</p>
              <p className="text-stone-500 mt-0.5">Our Kozhikode dispatch desk is available Monday to Saturday, 9 AM – 6 PM IST.</p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I need help with shipment ${order.orderId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Dispatch Desk</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

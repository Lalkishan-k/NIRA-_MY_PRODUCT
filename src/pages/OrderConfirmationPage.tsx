import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  ArrowRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#064e3b', '#047857', '#fbbf24', '#f59e0b']
    });

    if (orderId) {
      api.getOrder(orderId).then(data => {
        setOrder(data);
      }).catch(err => {
        console.warn('Could not fetch order from API:', err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 text-sm">Verifying order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Order Placed</h2>
        <p className="text-stone-600 text-sm">
          Your order #{orderId} has been successfully recorded. A confirmation email and tracking link has been sent to your inbox.
        </p>
        <Link
          to={`/track-order?orderId=${orderId}`}
          className="inline-block px-6 py-2.5 bg-emerald-800 text-white rounded-full text-xs font-semibold"
        >
          Track This Order
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
            Thank you for choosing pure coconut oil!
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Order #{order.orderId} Confirmed
          </h1>
          <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
            We have received your order. Our team in Kozhikode will carefully prepare your fresh batch for express dispatch.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            to={`/track-order?orderId=${order.orderId}`}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-colors shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-full flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping & Delivery Box */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-800" />
            Delivery Address
          </h3>

          <div className="text-xs text-stone-600 leading-relaxed space-y-1">
            <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
            <p>{order.shippingAddress?.house}, {order.shippingAddress?.street}</p>
            {order.shippingAddress?.locality && <p>{order.shippingAddress.locality}</p>}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pinCode}
            </p>
            <p className="pt-1 text-stone-500">Phone: {order.phone}</p>
            <p className="text-stone-500">Email: {order.email}</p>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <span>Expected Delivery: {order.estimatedDelivery}</span>
          </div>
        </div>

        {/* Payment Summary Box */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-800" />
            Payment Details
          </h3>

          <div className="text-xs text-stone-600 space-y-2">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-stone-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {order.paymentStatus}
              </span>
            </div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between font-mono text-[11px]">
                <span>Razorpay Txn ID:</span>
                <span className="text-stone-800">{order.razorpayPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Order Status:</span>
              <span className="font-bold text-stone-900">{order.orderStatus}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900">
            <span>Total Paid:</span>
            <span className="font-serif text-xl">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Purchased Items Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-800" />
          Items in this Shipment
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items.map(item => (
            <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-50 border border-stone-200"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900">{item.name}</p>
                  <p className="text-[11px] text-stone-500">Pack: {item.size} • Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-900">
                ₹{item.unitPrice * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-stone-200 space-y-1.5 text-xs text-stone-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Discount ({order.couponCode}):</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
            <span>Final Amount:</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:underline"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping More Pure Oils</span>
        </Link>
      </div>
    </div>
  );
};

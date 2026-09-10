import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Tag,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingCost,
    discount,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isApplyingCoupon,
    freeShippingRemaining
  } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCoupon(couponInput.trim());
    if (success) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Your Basket is Empty</h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto">
          Looks like you haven&apos;t added any pure Kerala coconut oil to your basket yet. Discover our fresh cold-pressed oils and family packs.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-sm font-semibold transition-colors shadow-md"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Shopping Basket</h1>
          <p className="text-stone-500 text-xs mt-1">Review your selected pure Kerala oils before checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Empty Basket</span>
        </button>
      </div>

      {/* Free Shipping Tracker */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        {freeShippingRemaining > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-800" />
                Add ₹{freeShippingRemaining} more to get FREE Delivery anywhere in India!
              </span>
              <span>₹{subtotal} / ₹{settings.freeShippingThreshold}</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%`
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Congratulations! You have unlocked FREE Express Delivery on this order.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 divide-y divide-stone-200 border-y border-stone-200">
          {cart.map(item => (
            <div key={`${item.productId}-${item.size}`} className="py-6 flex gap-4 sm:gap-6">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-stone-50 border border-stone-200 shrink-0"
              />

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-stone-900">{item.name}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">Size: {item.size}</p>
                    </div>
                    <span className="font-serif font-bold text-base text-stone-900 sm:text-lg">
                      ₹{item.unitPrice * item.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">₹{item.unitPrice} per unit</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon Input */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-800" />
              Have a Promo Code?
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="font-mono font-bold text-xs text-emerald-900">{appliedCoupon}</span>
                  <p className="text-[11px] text-emerald-700">Coupon applied successfully</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-rose-600 p-1"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PURE10"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick coupon suggestions */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-[11px] text-stone-500">
              <span>Available coupons:</span>
              <button
                onClick={() => applyCoupon('PURE10')}
                className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100"
              >
                PURE10
              </button>
              <button
                onClick={() => applyCoupon('FLAT50')}
                className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100"
              >
                FLAT50
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-emerald-800 font-bold">FREE</span>
                  ) : (
                    `₹${shippingCost}`
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Coupon Savings:</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-stone-900">Total Payable:</span>
                <span className="font-serif text-2xl font-black text-stone-900">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Secure Razorpay & Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

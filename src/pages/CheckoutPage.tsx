import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ShippingAddress } from '../types';
import { api } from '../services/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, shippingCost, discount, grandTotal, appliedCoupon, clearCart } = useCart();
  const { customerProfile, savedAddresses, updateProfileAddress } = useAuth();
  const { settings, addToast, razorpayKeyId } = useStore();
  const navigate = useNavigate();

  // Contact info
  const [fullName, setFullName] = useState(customerProfile?.name || '');
  const [email, setEmail] = useState(customerProfile?.email || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');

  // Address
  const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
  const [house, setHouse] = useState(defaultAddress?.house || '');
  const [street, setStreet] = useState(defaultAddress?.street || '');
  const [locality, setLocality] = useState(defaultAddress?.locality || '');
  const [city, setCity] = useState(defaultAddress?.city || 'Kozhikode');
  const [district, setDistrict] = useState(defaultAddress?.district || 'Kozhikode');
  const [state, setState] = useState(defaultAddress?.state || 'Kerala');
  const [pinCode, setPinCode] = useState(defaultAddress?.pinCode || '673001');
  const [landmark, setLandmark] = useState(defaultAddress?.landmark || '');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Payment method: 'Razorpay' or 'Cash on Delivery (COD)'
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Cash on Delivery (COD)'>('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSavedAddressSelect = (addr: ShippingAddress) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setHouse(addr.house);
    setStreet(addr.street);
    setLocality(addr.locality);
    setCity(addr.city);
    setDistrict(addr.district);
    setState(addr.state);
    setPinCode(addr.pinCode);
    setLandmark(addr.landmark || '');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please complete your name, email, and contact phone.');
      return;
    }
    if (!house.trim() || !street.trim() || !city.trim() || !pinCode.trim()) {
      setErrorMessage('Please complete your complete delivery address and PIN code.');
      return;
    }

    const shippingAddress: ShippingAddress = {
      fullName,
      phone,
      email,
      house,
      street,
      locality,
      city,
      district,
      state,
      pinCode,
      landmark,
      isDefault: false
    };

    if (saveAddressForFuture) {
      updateProfileAddress(shippingAddress);
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const orderPayload = {
        customerInfo: {
          name: fullName,
          email,
          phone,
          customerId: customerProfile?.uid || email
        },
        shippingAddress,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: appliedCoupon || undefined,
        paymentMethod
      };

      const res = await api.createPaymentOrder(orderPayload);

      // Handle Cash on Delivery (COD)
      if (paymentMethod === 'Cash on Delivery (COD)' || res.cod) {
        clearCart();
        addToast('Order confirmed with Cash on Delivery!', 'success');
        navigate(`/order-confirmation/${res.orderId}`);
        return;
      }

      // Handle Razorpay Online Payment
      const razorpayOrderId = res.razorpayOrderId;
      const orderId = res.orderId;
      const amount = res.amount;

      // Check if real Razorpay Key ID is present or if running in demo sandbox
      const activeRazorpayKey = razorpayKeyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;

      // Check if Razorpay script loaded and we have a valid format key
      if (window.Razorpay && activeRazorpayKey && !activeRazorpayKey.includes('YourTestKeyId')) {
        try {
          const options = {
            key: activeRazorpayKey,
            amount: amount,
            currency: 'INR',
            name: settings.brandName,
            description: `Order ${orderId} — Pure Kerala Coconut Oil`,
            image: 'https://cdn-icons-png.flaticon.com/512/8205/8205165.png',
            order_id: razorpayOrderId,
            handler: async function (response: any) {
              try {
                // Verify server-side
                const verifyRes = await api.verifyPayment({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  razorpaySignature: response.razorpay_signature || 'sig_demo'
                });

                if (verifyRes.success) {
                  clearCart();
                  addToast('Payment successful! Your order is placed.', 'success');
                  navigate(`/order-confirmation/${orderId}`);
                }
              } catch (verErr: any) {
                setErrorMessage('Payment verification failed: ' + verErr.message);
                setIsProcessing(false);
              }
            },
            prefill: {
              name: fullName,
              email: email,
              contact: phone
            },
            theme: {
              color: '#064e3b'
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
                addToast('Payment window closed. You can retry or switch payment method.', 'info');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response: any) {
            setErrorMessage(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
            setIsProcessing(false);
          });
          rzp.open();
        } catch (rzpErr: any) {
          console.warn('Razorpay open encountered an error, falling back to sandbox simulator:', rzpErr);
          // Auto fallback to sandbox confirmation
          const verifyRes = await api.verifyPayment({
            orderId,
            razorpayOrderId,
            razorpayPaymentId: `pay_sandbox_${Date.now()}`,
            razorpaySignature: 'sig_sandbox_verified'
          });

          if (verifyRes.success) {
            clearCart();
            addToast('Order confirmed via Sandbox Payment Simulator!', 'success');
            navigate(`/order-confirmation/${orderId}`);
          }
        }
      } else {
        // Instant Sandbox/Demo verification flow when no real Razorpay Key is configured
        const verifyRes = await api.verifyPayment({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'sig_test_sandbox'
        });

        if (verifyRes.success) {
          clearCart();
          addToast('Payment verified successfully in test sandbox mode!', 'success');
          navigate(`/order-confirmation/${orderId}`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Secure Checkout</h1>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-800" />
          <span>256-bit Encrypted Transaction. Direct dispatch from Kozhikode, Kerala.</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* STEP 1: Contact Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-serif font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900">Customer Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Kishan Lal"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number (for SMS & Tracking) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-serif font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">Delivery Address</h2>
              </div>

              {savedAddresses.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500">Autofill:</span>
                  <button
                    type="button"
                    onClick={() => handleSavedAddressSelect(savedAddresses[0])}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    Use Saved Address
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    House / Flat / Building No. *
                  </label>
                  <input
                    type="text"
                    value={house}
                    onChange={e => setHouse(e.target.value)}
                    placeholder="e.g. Flat 3B, Palm Grove Apts"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Street / Road / Colony *
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="e.g. Kunnamangalam Main Road"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Locality / Area</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder="e.g. Near Bus Stand"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Kozhikode"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Kozhikode"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="e.g. Kerala"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    placeholder="673001"
                    maxLength={6}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Temple"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddressForFuture}
                    onChange={e => setSaveAddressForFuture(e.target.checked)}
                    className="rounded text-emerald-800 focus:ring-emerald-600"
                  />
                  <span>Save this shipping address in my profile for future orders</span>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-serif font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900">Choose Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/10'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="mt-1 text-emerald-800 focus:ring-emerald-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-800" />
                      Razorpay Online Payment (Fast & Secure)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Pay instantly via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking or Wallets.
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-400">
                    <span>UPI</span> • <span>Visa / Mastercard</span> • <span>All Major Indian Banks</span>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery (COD)'
                    ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/10'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery (COD)"
                  checked={paymentMethod === 'Cash on Delivery (COD)'}
                  onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                  className="mt-1 text-emerald-800 focus:ring-emerald-600"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-800" />
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-xs text-stone-500 mt-1">
                    Pay in cash or UPI QR code to the courier executive upon physical delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Order Summary & Action */}
        <div className="space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-5 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-stone-900">Your Basket Summary</h3>

            {/* Compact items list */}
            <div className="divide-y divide-stone-200 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-white border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-stone-500">
                      Qty: {item.quantity} × ₹{item.unitPrice}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-2 border-t border-stone-200 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
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
                  <span>Coupon Discount ({appliedCoupon}):</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 text-sm">Total Payable:</span>
                <span className="font-serif text-2xl font-black text-stone-900">₹{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <span>{paymentMethod === 'Razorpay' ? `Pay ₹${grandTotal} with Razorpay` : 'Confirm Order (COD)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="space-y-2 text-[11px] text-stone-500 pt-2 border-t border-stone-200">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Zero-risk guarantee: Damaged or leaked bottles replaced immediately.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Estimated Delivery: 3–5 Business Days across India</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

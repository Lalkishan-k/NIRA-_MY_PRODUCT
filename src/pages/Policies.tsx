import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Lock, FileText } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Policies: React.FC = () => {
  const location = useLocation();
  const { settings } = useStore();

  const isShipping = location.pathname.includes('shipping');
  const isRefund = location.pathname.includes('refund');
  const isPrivacy = location.pathname.includes('privacy');
  const isTerms = location.pathname.includes('terms');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto pb-1 gap-4 text-xs font-bold uppercase tracking-wider">
        <Link
          to="/shipping-policy"
          className={`pb-3 border-b-2 whitespace-nowrap ${
            isShipping ? 'border-emerald-800 text-emerald-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Shipping Policy
        </Link>
        <Link
          to="/return-refund-policy"
          className={`pb-3 border-b-2 whitespace-nowrap ${
            isRefund ? 'border-emerald-800 text-emerald-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Return & Refund Policy
        </Link>
        <Link
          to="/privacy-policy"
          className={`pb-3 border-b-2 whitespace-nowrap ${
            isPrivacy ? 'border-emerald-800 text-emerald-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-conditions"
          className={`pb-3 border-b-2 whitespace-nowrap ${
            isTerms ? 'border-emerald-800 text-emerald-900' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Terms & Conditions
        </Link>
      </div>

      {/* Content card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs space-y-6 text-stone-700 leading-relaxed text-sm">
        {isShipping && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-emerald-800" />
              <h1 className="font-serif text-2xl font-bold text-stone-900">Shipping & Delivery Policy</h1>
            </div>
            <p>
              At <b>{settings.brandName}</b>, we take immense care in delivering freshly pressed Kerala coconut oil directly from our Kozhikode facility to your doorstep anywhere across India.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">1. Processing & Dispatch</h3>
            <p>
              Orders are dispatched within 24 to 36 hours of payment verification (except Sundays and national holidays). Every bottle is inspected, tamper-sealed, and wrapped in shock-absorbent corrugated packaging to eliminate leakage during transit.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">2. Shipping Charges & Free Delivery</h3>
            <p>
              We offer <b>FREE Shipping</b> on all domestic orders of ₹{settings.freeShippingThreshold} and above. For orders below this threshold, a flat delivery fee of ₹{settings.shippingCharge} is charged.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">3. Estimated Transit Times</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Kerala, Tamil Nadu, Karnataka: 2–3 business days.</li>
              <li>Maharashtra, Andhra Pradesh, Telangana, Goa: 3–4 business days.</li>
              <li>Delhi NCR, Gujarat, West Bengal, Rajasthan, North India: 4–6 business days.</li>
            </ul>
          </div>
        )}

        {isRefund && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-emerald-800" />
              <h1 className="font-serif text-2xl font-bold text-stone-900">Return & Replacement Policy</h1>
            </div>
            <p>
              Because our products are consumable food-grade culinary and wellness oils, we maintain strict safety protocols.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">1. Damaged or Leaked Bottles</h3>
            <p>
              If your package arrives damaged, unsealed, or leaked during courier transit, please send a photograph of the damaged outer box and bottle to <b>{settings.supportEmail}</b> or WhatsApp at <b>{settings.supportPhone}</b> within 48 hours of delivery.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">2. Immediate Free Replacement</h3>
            <p>
              Upon verification, we will immediately dispatch a fresh replacement bottle at zero additional cost to you, or initiate a 100% refund to your original payment method.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">3. Refunds Processing Time</h3>
            <p>
              Approved refunds are processed back through Razorpay to your source account (UPI / Card / NetBanking) within 5–7 business days.
            </p>
          </div>
        )}

        {isPrivacy && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-emerald-800" />
              <h1 className="font-serif text-2xl font-bold text-stone-900">Privacy & Data Security Policy</h1>
            </div>
            <p>
              Your privacy is of utmost importance to us. {settings.brandName} respects your personal data and adheres to stringent confidentiality standards.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">1. Information We Collect</h3>
            <p>
              We only collect information necessary to process and fulfill your order: Name, Shipping Address, Email Address, and Phone Number.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">2. Payment Security</h3>
            <p>
              We <b>never store</b> your credit card numbers, CVVs, or net banking passwords. All online financial transactions are encrypted with 256-bit SSL and securely handled by <b>Razorpay</b>, an RBI-authorized Payment Gateway.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">3. Zero Spam Guarantee</h3>
            <p>
              We will never sell, rent, or trade your contact information with external marketing agencies.
            </p>
          </div>
        )}

        {isTerms && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-800" />
              <h1 className="font-serif text-2xl font-bold text-stone-900">Terms of Service</h1>
            </div>
            <p>
              By accessing or purchasing from {settings.brandName}, you agree to adhere to our store terms and consumer regulations.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">1. Authentic Quality & FSSAI Compliance</h3>
            <p>
              All products sold on this website comply strictly with standards established by the Food Safety and Standards Authority of India (FSSAI Registration #{settings.fssaiNumber}).
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">2. Natural Characteristic of Coconut Oil</h3>
            <p>
              Customer acknowledges that unrefined coconut oil solidifies into white butter consistency below 24°C. This is a natural physical attribute and not a defect.
            </p>
            <h3 className="font-bold text-stone-900 text-base pt-2">3. Governing Law</h3>
            <p>
              Any disputes arising in connection with orders placed through this website shall be subject to the exclusive jurisdiction of the civil courts in Kozhikode, Kerala, India.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

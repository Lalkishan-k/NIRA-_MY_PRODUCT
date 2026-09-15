import React, { useState, useEffect } from 'react';
import { MapPin, Truck, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { estimatePincodeDelivery } from '../utils/pincodeEstimator';
import { PincodeDeliveryEstimate } from '../types';

interface PincodeDeliveryEstimatorProps {
  productPrice?: number;
  className?: string;
  onPincodeVerified?: (pincode: string, estimate: PincodeDeliveryEstimate) => void;
}

const PINCODE_STORAGE_KEY = 'nira_user_pincode';

export const PincodeDeliveryEstimator: React.FC<PincodeDeliveryEstimatorProps> = ({
  productPrice = 0,
  className = '',
  onPincodeVerified
}) => {
  const [pincode, setPincode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [estimate, setEstimate] = useState<PincodeDeliveryEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize from stored pin if available
  useEffect(() => {
    const savedPin = localStorage.getItem(PINCODE_STORAGE_KEY);
    if (savedPin && savedPin.length === 6) {
      setPincode(savedPin);
      const est = estimatePincodeDelivery(savedPin, productPrice);
      if (est.valid) {
        setEstimate(est);
        onPincodeVerified?.(savedPin, est);
      }
    }
  }, [productPrice]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      setError('Please enter a valid 6-digit Indian PIN code');
      setEstimate(null);
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      const result = estimatePincodeDelivery(clean, productPrice);
      setIsChecking(false);
      if (result.valid) {
        setEstimate(result);
        localStorage.setItem(PINCODE_STORAGE_KEY, clean);
        onPincodeVerified?.(clean, result);
      } else {
        setError(result.message);
        setEstimate(null);
      }
    }, 280);
  };

  const handleClear = () => {
    setPincode('');
    setEstimate(null);
    setError(null);
    localStorage.removeItem(PINCODE_STORAGE_KEY);
  };

  return (
    <div
      className={`rounded-2xl border border-stone-200/90 bg-stone-50/70 p-4 sm:p-5 transition-all shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">Check Delivery & COD Availability</h4>
            <p className="text-xs text-stone-500">Fresh cold-pressed batch dispatched directly from Kerala</p>
          </div>
        </div>
        {estimate && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Change PIN
          </button>
        )}
      </div>

      {/* Form Input */}
      {!estimate ? (
        <form onSubmit={handleCheck} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setPincode(val);
                  setError(null);
                  if (val.length === 6) {
                    const result = estimatePincodeDelivery(val, productPrice);
                    if (result.valid) {
                      setEstimate(result);
                      localStorage.setItem(PINCODE_STORAGE_KEY, val);
                      onPincodeVerified?.(val, result);
                    }
                  }
                }}
                placeholder="Enter 6-digit PIN code (e.g. 673001, 560001)"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-mono placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 text-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={isChecking || pincode.length < 6}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {isChecking ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Check</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium pl-1">{error}</p>}

          {/* Quick pin helper buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-stone-500">
            <span>Try:</span>
            <button
              type="button"
              onClick={() => {
                setPincode('673001');
                const res = estimatePincodeDelivery('673001', productPrice);
                setEstimate(res);
                localStorage.setItem(PINCODE_STORAGE_KEY, '673001');
                onPincodeVerified?.('673001', res);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-200/70 hover:bg-stone-300/70 text-stone-700 font-mono transition-colors cursor-pointer"
            >
              673001 (Kozhikode)
            </button>
            <button
              type="button"
              onClick={() => {
                setPincode('682001');
                const res = estimatePincodeDelivery('682001', productPrice);
                setEstimate(res);
                localStorage.setItem(PINCODE_STORAGE_KEY, '682001');
                onPincodeVerified?.('682001', res);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-200/70 hover:bg-stone-300/70 text-stone-700 font-mono transition-colors cursor-pointer"
            >
              682001 (Kochi)
            </button>
            <button
              type="button"
              onClick={() => {
                setPincode('560001');
                const res = estimatePincodeDelivery('560001', productPrice);
                setEstimate(res);
                localStorage.setItem(PINCODE_STORAGE_KEY, '560001');
                onPincodeVerified?.('560001', res);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-200/70 hover:bg-stone-300/70 text-stone-700 font-mono transition-colors cursor-pointer"
            >
              560001 (Bengaluru)
            </button>
          </div>
        </form>
      ) : (
        /* Result Preview Card */
        <div className="space-y-3 animate-fadeIn">
          <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-xs space-y-2.5">
            {/* Delivery Timeline Heading */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Estimated Delivery</span>
                </div>
                <p className="text-base sm:text-lg font-serif font-bold text-stone-900">
                  {estimate.deliveryTimeframe}
                </p>
                <p className="text-xs text-stone-600">
                  Expected by <span className="font-semibold text-emerald-900">{estimate.estimatedDeliveryDate}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                  📍 {estimate.pincode}
                </span>
                <p className="text-[11px] text-stone-500 mt-1 font-medium">{estimate.city}, {estimate.state}</p>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Cash on Delivery (COD) Available</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Express Courier: {estimate.courierPartners[0]}</span>
              </div>
            </div>

            {/* Free shipping threshold badge */}
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  {productPrice >= estimate.freeShippingThreshold
                    ? '🎉 Free Express Delivery eligible on this order!'
                    : `Free shipping on orders above ₹${estimate.freeShippingThreshold}`}
                </span>
              </div>
              <span className="font-bold text-emerald-900">
                {productPrice >= estimate.freeShippingThreshold ? 'FREE' : `₹${estimate.standardShippingFee}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

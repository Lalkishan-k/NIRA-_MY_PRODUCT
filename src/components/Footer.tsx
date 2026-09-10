import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Heart, ArrowUpRight, MessageCircle } from 'lucide-react';
import { CrackedCoconutPiece } from './CrackedCoconutPiece';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings } = useStore();

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hello NIRA, I would like to inquire about your pure coconut oil products.`);
    window.open(`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand & Heritage */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center shrink-0">
                <CrackedCoconutPiece className="w-7 h-7" />
              </div>
              <span className="font-brand text-2xl sm:text-3xl font-bold text-white tracking-wider">
                {settings.brandName}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Rooted in the lush coconut palm groves of Malabar, Kerala. We craft 100% pure, raw, unfiltered coconut oil using traditional copra selection and natural gravity settling — keeping all natural nutrients, Vitamin E, and polyphenols intact.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700 text-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                FSSAI Lic. #{settings.fssaiNumber}
              </span>
              <span className="bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700 text-amber-300 font-semibold">
                100% Unfiltered (Zero Filtration)
              </span>
            </div>
            {/* WhatsApp CTA */}
            <div className="pt-2">
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full text-xs font-semibold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                Chat on WhatsApp (+91 95625 13642)
              </button>
            </div>
          </div>

          {/* Col 2: Packaging Sizes */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-serif">
              Packaging Sizes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/product/unfiltered-pure-coconut-oil-200ml" className="hover:text-amber-300 transition-colors">
                  200 ml Bottle (Hair & Skin Care)
                </Link>
              </li>
              <li>
                <Link to="/product/unfiltered-pure-coconut-oil-500ml" className="hover:text-amber-300 transition-colors">
                  500 ml Bottle (Kitchen Favorite)
                </Link>
              </li>
              <li>
                <Link to="/product/unfiltered-pure-coconut-oil-1-litre" className="hover:text-amber-300 transition-colors">
                  1 Litre Bottle (Family Value Pack)
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  Compare Sizes <ArrowUpRight className="w-3 h-3 text-stone-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-serif">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/track-order" className="hover:text-amber-300 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-amber-300 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-amber-300 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="hover:text-amber-300 transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-amber-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-serif">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-stone-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {settings.address.line1}, {settings.address.city}, {settings.address.state} — {settings.address.pincode}
                </span>
              </li>
              <li className="flex items-start gap-3 text-stone-400">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <a href={`tel:${settings.supportPhone}`} className="hover:text-white block">
                    {settings.supportPhone} <span className="text-[10px] text-emerald-400 font-normal">(Primary)</span>
                  </a>
                  {settings.secondaryPhone && (
                    <a href={`tel:${settings.secondaryPhone}`} className="hover:text-white block text-xs text-stone-400">
                      {settings.secondaryPhone} <span className="text-[10px] text-stone-500 font-normal">(WhatsApp / Support)</span>
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3 text-stone-400">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  Contact Form & Map Location →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.brandName} Inc. All rights reserved. Sourced & Packed with pride in Kerala, India.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Secured with <span className="font-semibold text-stone-300">Razorpay</span>
            </span>
            <span>•</span>
            <Link to="/admin" className="text-stone-600 hover:text-stone-400">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

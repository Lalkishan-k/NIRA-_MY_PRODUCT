import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    const text = encodeURIComponent(
      `Hello ${settings.brandName}, I have a question regarding pure Kerala coconut oil.`
    );
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      <div className="relative group">
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-400/40"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
        </button>

        {/* Hover Popover */}
        <div
          className={`absolute left-16 bottom-1 bg-white text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl border border-stone-200 text-xs w-56 pointer-events-none transition-all duration-200 ${
            showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          <p className="font-semibold text-emerald-950">Chat with us on WhatsApp</p>
          <p className="text-stone-500 text-[11px] mt-0.5">Direct advice on Kerala coconut oil & bulk orders.</p>
        </div>
      </div>
    </div>
  );
};

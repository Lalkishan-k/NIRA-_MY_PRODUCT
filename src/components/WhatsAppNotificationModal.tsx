import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Copy,
  Check,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Phone,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Order } from '../types';
import {
  generateOrderWhatsAppMessage,
  formatPhoneNumberForWhatsApp,
  openWhatsAppDirect
} from '../utils/whatsappNotifications';
import { useStore } from '../context/StoreContext';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onNotificationSent?: (orderId: string, alertType: string) => void;
}

type AlertStage = 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  order,
  onNotificationSent
}) => {
  const { addToast } = useStore();
  const [selectedStage, setSelectedStage] = useState<AlertStage>('DISPATCHED');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [phoneOverride, setPhoneOverride] = useState<string>('');

  useEffect(() => {
    if (order) {
      // Determine default suggested stage based on order status
      let defaultStage: AlertStage = 'CONFIRMED';
      if (order.orderStatus === 'Packed') defaultStage = 'PACKED';
      else if (order.orderStatus === 'Shipped') defaultStage = 'DISPATCHED';
      else if (order.orderStatus === 'Delivered') defaultStage = 'DELIVERED';
      else defaultStage = 'CONFIRMED';

      setSelectedStage(defaultStage);
      setPhoneOverride(order.phone || order.shippingAddress?.phone || '');
      setCustomMessage(generateOrderWhatsAppMessage(order, defaultStage));
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleStageChange = (stage: AlertStage) => {
    setSelectedStage(stage);
    setCustomMessage(generateOrderWhatsAppMessage(order, stage));
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    addToast('WhatsApp message copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const targetPhone = phoneOverride || order.phone || order.shippingAddress?.phone || '';
    if (!targetPhone) {
      addToast('Please provide a valid recipient phone number.', 'error');
      return;
    }

    openWhatsAppDirect(targetPhone, customMessage);
    addToast(`WhatsApp opened for ${order.customerName} (${selectedStage})`, 'success');
    if (onNotificationSent) {
      onNotificationSent(order.id, selectedStage);
    }
  };

  const stages: { key: AlertStage; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { key: 'CONFIRMED', label: '1. Confirmed', icon: Clock, desc: 'Booking confirmed & batch allocated' },
    { key: 'PACKED', label: '2. Packed', icon: Package, desc: 'Freshly sealed in tamper-proof glass/can' },
    { key: 'DISPATCHED', label: '3. Dispatched', icon: Truck, desc: 'Courier AWB & live tracking link' },
    { key: 'OUT_FOR_DELIVERY', label: '4. Out for Delivery', icon: Send, desc: 'Reaching customer doorstep today' },
    { key: 'DELIVERED', label: '5. Delivered', icon: CheckCircle2, desc: 'Purity care guide & review prompt' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-amber-900/10 flex flex-col max-h-[90vh] overflow-hidden"
        id="whatsapp-notification-modal"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
              <MessageSquare className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg font-bold">Automated WhatsApp Order Alert</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
                  Instant Dispatch
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                Order #{order.orderId} • {order.customerName} ({order.shippingAddress.city}, {order.shippingAddress.state})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-stone-800">
          {/* Recipient info & Stage selector */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Recipient WhatsApp Number
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                    <input
                      type="text"
                      value={phoneOverride}
                      onChange={(e) => setPhoneOverride(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="outline-none text-stone-800 font-mono text-sm w-44"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Formatted: <strong className="font-mono text-emerald-700">+{formatPhoneNumberForWhatsApp(phoneOverride)}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-stone-500 block">Courier Status</span>
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  {order.courierPartner ? `${order.courierPartner} (AWB: ${order.trackingNumber || 'Assigned'})` : 'Standard Logistics'}
                </span>
              </div>
            </div>

            {/* Stage Selector Pills */}
            <div>
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
                Select Lifecycle Alert Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {stages.map((st) => {
                  const Icon = st.icon;
                  const isSelected = selectedStage === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => handleStageChange(st.key)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-100/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-700' : 'text-stone-500'}`} />
                      <span className="text-xs font-bold truncate max-w-full">{st.label.replace(/^\d+\.\s*/, '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                Live WhatsApp Message Preview (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="bg-[#EFEAE2] p-4 rounded-xl border border-stone-300/80">
              <div className="bg-white rounded-lg p-3.5 shadow-sm border border-emerald-900/10 max-w-full">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={9}
                  className="w-full text-xs font-sans text-stone-800 leading-relaxed outline-none resize-y bg-transparent"
                  placeholder="WhatsApp message content..."
                />
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Includes customer tracking token & support hotline
                  </span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Copy className="w-4 h-4 text-stone-500" />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via WhatsApp Web/App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

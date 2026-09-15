import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  Package, 
  Eye, 
  Send, 
  AlertCircle,
  Calendar,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { sendStatusUpdateEmail, getStatusEmailDetails } from '../services/emailService';

interface OrderStatusTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  initialTargetStatus?: OrderStatus;
  onClose: () => void;
  onSuccess: (updatedOrder: Order, emailSent: boolean) => void;
}

const COURIER_PARTNERS = [
  { name: 'Blue Dart Express', trackingPrefix: 'BD', urlTemplate: 'https://www.bluedart.com/tracking?track=' },
  { name: 'Delhivery Express', trackingPrefix: 'DL', urlTemplate: 'https://www.delhivery.com/track/package/' },
  { name: 'India Post Speed Post', trackingPrefix: 'ED', urlTemplate: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?consNo=' },
  { name: 'DTDC Express', trackingPrefix: 'DT', urlTemplate: 'https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCNNo=' },
  { name: 'The Professional Couriers', trackingPrefix: 'TP', urlTemplate: 'https://www.tpcindia.com/tracking.aspx?cno=' },
  { name: 'Shadowfax', trackingPrefix: 'SF', urlTemplate: 'https://tracker.shadowfax.in/#/track/' },
  { name: 'Local Kerala Courier / Dispatch Desk', trackingPrefix: 'KL', urlTemplate: '' }
];

export const OrderStatusTrackingModal: React.FC<OrderStatusTrackingModalProps> = ({
  order,
  isOpen,
  initialTargetStatus,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !order) return null;

  const [targetStatus, setTargetStatus] = useState<OrderStatus>(
    initialTargetStatus || (order.orderStatus === 'Processing' ? 'Shipped' : order.orderStatus === 'Shipped' ? 'Delivered' : order.orderStatus)
  );
  const [courierPartner, setCourierPartner] = useState(order.courierPartner || 'Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery || '2 to 4 business days');
  const [dispatchNotes, setDispatchNotes] = useState(order.notes || '');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [autoMarkCodPaid, setAutoMarkCodPaid] = useState(true);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    if (initialTargetStatus) {
      setTargetStatus(initialTargetStatus);
    } else if (order.orderStatus === 'Processing') {
      setTargetStatus('Shipped');
    } else if (order.orderStatus === 'Shipped') {
      setTargetStatus('Delivered');
    }
  }, [initialTargetStatus, order.orderStatus]);

  // Generate suggested AWB if empty and transitioning to Shipped
  const handleGenerateAWB = () => {
    const selectedCourier = COURIER_PARTNERS.find(c => c.name === courierPartner);
    const prefix = selectedCourier ? selectedCourier.trackingPrefix : 'AWB';
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const generated = `${prefix}${randomDigits}IN`;
    setTrackingNumber(generated);

    if (selectedCourier && selectedCourier.urlTemplate) {
      setTrackingUrl(`${selectedCourier.urlTemplate}${generated}`);
    } else {
      setTrackingUrl(`https://www.niraoils.com/track?orderId=${order.orderId}`);
    }
  };

  const handleCourierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourierName = e.target.value;
    setCourierPartner(newCourierName);
    const match = COURIER_PARTNERS.find(c => c.name === newCourierName);
    if (match && trackingNumber && match.urlTemplate) {
      setTrackingUrl(`${match.urlTemplate}${trackingNumber}`);
    }
  };

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const emailDetails = getStatusEmailDetails(order.orderId, targetStatus, courierPartner, trackingNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalPaymentStatus = order.paymentStatus;
      if (targetStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery (COD)' && autoMarkCodPaid) {
        finalPaymentStatus = 'Paid';
      }

      // 1. Call Backend API to update status, tracking details, and register notification log
      const res = await api.updateOrderStatus(order.orderId, {
        orderStatus: targetStatus,
        paymentStatus: finalPaymentStatus,
        courierPartner: targetStatus === 'Shipped' || order.courierPartner ? courierPartner : undefined,
        trackingNumber: targetStatus === 'Shipped' || order.trackingNumber ? trackingNumber : undefined,
        trackingUrl: targetStatus === 'Shipped' || order.trackingUrl ? trackingUrl : undefined,
        estimatedDelivery,
        notes: dispatchNotes,
        notifyCustomer,
        emailCustomMessage: customEmailMessage
      });

      // 2. Client-side email trigger attempt via EmailJS (if credentials configured)
      if (notifyCustomer) {
        await sendStatusUpdateEmail({
          order: { ...order, orderStatus: targetStatus },
          newStatus: targetStatus,
          courierPartner,
          trackingNumber,
          trackingUrl,
          estimatedDelivery,
          customMessage: customEmailMessage
        });
      }

      const updated = res.order || { ...order, orderStatus: targetStatus, paymentStatus: finalPaymentStatus };
      onSuccess(updated, notifyCustomer);
      onClose();
    } catch (err: any) {
      console.error('Failed to update status & trigger email:', err);
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerEmail = order.email || order.shippingAddress?.email || 'customer@example.com';

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200">
                ORDER #{order.orderId}
              </span>
              <span className="text-xs text-stone-400">
                Current: <strong className="text-stone-700">{order.orderStatus}</strong>
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1 flex items-center gap-2">
              <Truck className="w-6 h-6 text-emerald-800" />
              Status Tracking & Customer Email
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Update delivery status and dispatch automated status email notification to{' '}
              <strong className="text-stone-900">{customerEmail}</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Status Step Progression */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Select Target Order Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                {
                  status: 'Processing' as OrderStatus,
                  label: 'Processing',
                  desc: 'Quality check & bottling',
                  icon: Clock,
                  badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
                },
                {
                  status: 'Shipped' as OrderStatus,
                  label: 'Shipped',
                  desc: 'Handed over to courier',
                  icon: Truck,
                  badgeColor: 'bg-blue-50 text-blue-900 border-blue-200'
                },
                {
                  status: 'Delivered' as OrderStatus,
                  label: 'Delivered',
                  desc: 'Received by customer',
                  icon: CheckCircle2,
                  badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = targetStatus === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => setTargetStatus(item.status)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/60 ring-2 ring-emerald-800/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-800' : 'text-stone-400'}`} />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-xs ${isSelected ? 'text-emerald-950' : 'text-stone-800'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Additional Secondary Status Options */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-stone-400">Other lifecycle statuses:</span>
              {(['Confirmed', 'Out for Delivery', 'Cancelled'] as OrderStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTargetStatus(st)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                    targetStatus === st
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Tracking & Dispatch Section: SHIPPED */}
          {targetStatus === 'Shipped' && (
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-700" />
                  Courier & Dispatch Tracking Details
                </h4>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-full">
                  Included in Email
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courierPartner}
                    onChange={handleCourierChange}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-emerald-700"
                  >
                    {COURIER_PARTNERS.map(cp => (
                      <option key={cp.name} value={cp.name}>
                        {cp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-stone-700">
                      AWB / Tracking Number
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAWB}
                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fill AWB
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. BD849201934IN"
                      value={trackingNumber}
                      onChange={e => {
                        setTrackingNumber(e.target.value);
                        const match = COURIER_PARTNERS.find(c => c.name === courierPartner);
                        if (match?.urlTemplate) {
                          setTrackingUrl(`${match.urlTemplate}${e.target.value}`);
                        }
                      }}
                      className="w-full text-xs font-mono font-bold p-2.5 pr-8 rounded-xl border border-stone-300 bg-white uppercase focus:ring-1 focus:ring-emerald-700"
                    />
                    {trackingNumber && (
                      <button
                        type="button"
                        onClick={handleCopyTracking}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        title="Copy tracking code"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Live Tracking URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={trackingUrl}
                    onChange={e => setTrackingUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:ring-1 focus:ring-emerald-700 text-stone-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Estimated Delivery Timeframe
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 to 3 business days"
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:ring-1 focus:ring-emerald-700 text-stone-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Dispatch & Quality Control Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy-duty bubble cushioned; Dispatched from Kozhikode Malabar Hub"
                  value={dispatchNotes}
                  onChange={e => setDispatchNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Conditional Delivery Confirmation: DELIVERED */}
          {targetStatus === 'Delivered' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                Delivery Confirmation & Reconciliation
              </h4>
              <p className="text-xs text-stone-600">
                Marking as Delivered completes the order lifecycle and notifies{' '}
                <strong>{order.customerName}</strong> that their package has arrived.
              </p>

              {order.paymentMethod === 'Cash on Delivery (COD)' && order.paymentStatus === 'Pending' && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoMarkCodPaid}
                    onChange={e => setAutoMarkCodPaid(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-stone-300 focus:ring-emerald-700"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 block">
                      Auto-reconcile COD Payment as 'Paid'
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Cash of ₹{order.totalAmount} collected upon doorstep handover.
                    </span>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Automated Customer Email Notification Section */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCustomer}
                  onChange={e => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded border-stone-300 focus:ring-emerald-700"
                />
                <div>
                  <span className="font-bold text-xs text-stone-900 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-800" />
                    Trigger Automatic Status Email to Customer
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Recipient: <strong className="text-stone-800">{customerEmail}</strong>
                  </span>
                </div>
              </label>

              {notifyCustomer && (
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showEmailPreview ? 'Hide Email Preview' : 'Preview Email'}
                </button>
              )}
            </div>

            {notifyCustomer && (
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Optional Custom Note in Email:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please refrigerate or keep at room temperature; congratulations on choosing cold-pressed purity!"
                  value={customEmailMessage}
                  onChange={e => setCustomEmailMessage(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>
            )}

            {/* LIVE EMAIL PREVIEW */}
            {notifyCustomer && showEmailPreview && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-stone-300 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                      Subject Line Preview
                    </span>
                    <p className="font-bold text-stone-900 text-xs mt-0.5">{emailDetails.subject}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                    HTML Preview
                  </span>
                </div>

                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-serif text-base font-bold tracking-tight">NIRA</h5>
                      <p className="text-[10px] text-emerald-200 uppercase tracking-widest">
                        Pure Cold-Pressed Coconut Oil • Kerala
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                      #{order.orderId}
                    </span>
                  </div>

                  {/* Email Body */}
                  <div className="p-4 space-y-3 bg-stone-50/50">
                    <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                      <p className="font-bold text-stone-900 text-sm">{emailDetails.headline}</p>
                      <p className="text-stone-600 text-xs leading-relaxed">
                        {customEmailMessage || emailDetails.message}
                      </p>
                    </div>

                    {targetStatus === 'Shipped' && (
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                        <p className="text-[11px] font-bold text-blue-950">Shipment Details:</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-900">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Courier:</span>
                            <strong>{courierPartner}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">AWB Tracking:</span>
                            <strong className="font-mono">{trackingNumber || 'Pending Assignment'}</strong>
                          </div>
                        </div>
                        {trackingUrl && (
                          <div className="pt-1">
                            <span className="inline-block px-3 py-1 bg-blue-700 text-white text-[11px] font-bold rounded-lg">
                              Track Package Online →
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items brief */}
                    <div className="text-[11px] text-stone-600 space-y-1">
                      <p className="font-bold text-stone-800">Items in this Package:</p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {order.items.map((i, idx) => (
                          <li key={idx}>
                            {i.name} ({i.size}) × {i.quantity} — ₹{i.totalPrice || i.unitPrice * i.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 text-[10px] text-stone-400 text-center border-t border-stone-200">
                      NIRA Kerala Artisanal Oils • Kozhikode, Kerala • Customer Desk: +91 98460 12345
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Past Notification Log if any */}
          {order.statusNotifications && order.statusNotifications.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-[11px] text-stone-700 uppercase tracking-wider">
                Notification History for this Order ({order.statusNotifications.length})
              </h4>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {order.statusNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className="p-2 rounded-lg bg-white border border-stone-200 text-[11px] flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{notif.status}</span>
                      <span className="text-stone-400 text-[10px] ml-2">
                        {new Date(notif.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <p className="text-stone-500 text-[10px] truncate max-w-[320px]">
                        {notif.subject}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      Dispatched ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating & Sending Email...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Update to '{targetStatus}' {notifyCustomer ? '& Trigger Email' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  Clock,
  TrendingUp,
  AlertTriangle,
  Send,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Tag,
  DollarSign,
  Package,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AbandonedCheckout } from '../types';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';
import {
  generateAbandonedRecoveryMessage,
  openWhatsAppDirect,
  formatPhoneNumberForWhatsApp
} from '../utils/whatsappNotifications';

export const AbandonedCheckoutsHub: React.FC = () => {
  const { addToast } = useStore();
  const [abandonedList, setAbandonedList] = useState<AbandonedCheckout[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    recoveredCount: 0,
    contactedCount: 0,
    totalAbandonedValue: 0,
    recoveredValue: 0,
    recoveryRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal for fine-tuning WhatsApp recovery message
  const [activeModalItem, setActiveModalItem] = useState<AbandonedCheckout | null>(null);
  const [editableMessage, setEditableMessage] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAbandonedCheckouts({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchQuery || undefined
      });
      setAbandonedList(res.abandonedCheckouts);
      setStats(res.stats);
    } catch (err: any) {
      addToast(err.message || 'Failed to load abandoned checkouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCopyRecoveryLink = (abandoned: AbandonedCheckout) => {
    const recoveryUrl = `${window.location.origin}/checkout?recover=${encodeURIComponent(abandoned.recoveryToken)}`;
    navigator.clipboard.writeText(recoveryUrl);
    setCopiedId(abandoned.id);
    addToast('1-Click Recovery link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openRecoveryModal = (abandoned: AbandonedCheckout) => {
    setActiveModalItem(abandoned);
    setEditableMessage(generateAbandonedRecoveryMessage(abandoned));
  };

  const handleSendRecoveryWhatsApp = async () => {
    if (!activeModalItem) return;
    const phone = activeModalItem.phone || activeModalItem.shippingAddress?.phone || '';
    if (!phone) {
      addToast('No phone number recorded for this customer.', 'error');
      return;
    }

    openWhatsAppDirect(phone, editableMessage);
    try {
      await api.markAbandonedContacted(activeModalItem.id, 'WhatsApp');
      addToast(`Recovery message sent to ${activeModalItem.customerName}!`, 'success');
      setActiveModalItem(null);
      loadData();
    } catch (e: any) {
      addToast(e.message || 'Error updating status', 'error');
    }
  };

  const handleMarkRecovered = async (id: string) => {
    try {
      await api.markAbandonedRecovered(id);
      addToast('Marked checkout as Recovered!', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this abandoned checkout record?')) return;
    try {
      await api.deleteAbandonedCheckout(id);
      addToast('Abandoned checkout removed', 'info');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6" id="abandoned-checkouts-hub">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center">
            <RotateCcw className="w-6 h-6 text-amber-700 mr-2" />
            Abandoned Checkout Recovery Hub
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Re-engage shoppers who left items in their cart with automated WhatsApp reminders & 10% recovery incentives.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Incomplete Carts</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-stone-900 font-serif">{stats.totalCount}</span>
              <span className="text-xs text-amber-700 font-semibold">{stats.activeCount} active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-200">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Unclaimed Cart Value</span>
            <span className="text-2xl font-bold text-stone-900 font-serif">₹{stats.totalAbandonedValue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Recovered Revenue</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-emerald-700 font-serif">₹{stats.recoveredValue.toLocaleString('en-IN')}</span>
              <span className="text-xs font-semibold text-emerald-600">({stats.recoveredCount} orders)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Recovery Conversion</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-teal-800 font-serif">{stats.recoveryRate}%</span>
              <span className="text-xs text-stone-500 font-medium">{stats.contactedCount} contacted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Abandoned', 'Contacted', 'Recovered'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {st}
              {st === 'All' && ` (${stats.totalCount})`}
              {st === 'Abandoned' && ` (${stats.activeCount})`}
              {st === 'Contacted' && ` (${stats.contactedCount})`}
              {st === 'Recovered' && ` (${stats.recoveredCount})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or token..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 transition-all"
          />
        </form>
      </div>

      {/* Abandoned Checkouts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
            <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-600 font-medium">Scanning abandoned carts database...</p>
          </div>
        ) : abandonedList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-900">No Incomplete Checkouts Found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              All customers who entered the checkout flow have completed their purchases or no records match your filter criteria.
            </p>
          </div>
        ) : (
          abandonedList.map((item) => {
            const isContacted = item.status === 'Contacted';
            const isRecovered = item.status === 'Recovered';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                  isRecovered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isContacted
                    ? 'border-teal-200 bg-teal-50/10'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Customer & Time metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-stone-900 text-base">{item.customerName}</span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isRecovered
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isContacted
                            ? 'bg-teal-100 text-teal-800 border-teal-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-600">
                      {item.phone && (
                        <span>
                          📞 <strong className="font-mono text-stone-800">+{formatPhoneNumberForWhatsApp(item.phone)}</strong>
                        </span>
                      )}
                      {item.email && <span>✉️ {item.email}</span>}
                      {item.shippingAddress?.city && (
                        <span>
                          📍 {item.shippingAddress.city}, {item.shippingAddress.state} ({item.shippingAddress.pinCode})
                        </span>
                      )}
                      {item.lastContactedAt && (
                        <span className="text-teal-700 font-medium">
                          Last contacted {formatRelativeTime(item.lastContactedAt)} via {item.contactMethod || 'WhatsApp'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Cart Value Summary */}
                  <div className="flex items-center lg:text-right space-x-4">
                    <div>
                      <span className="text-xs text-stone-500 block font-medium">Saved Basket Subtotal</span>
                      <span className="text-xl font-bold text-stone-900 font-serif">₹{item.totalAmount || item.subtotal}</span>
                    </div>
                  </div>
                </div>

                {/* Items in cart preview */}
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Left In Cart ({item.items.length} {item.items.length === 1 ? 'item' : 'items'}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.items.map((prod, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-7 h-7 rounded-lg object-cover border border-stone-200"
                          />
                          <span className="font-semibold truncate max-w-[140px]">{prod.name}</span>
                          <span className="text-stone-500 font-mono">({prod.size}) × {prod.quantity}</span>
                          <span className="font-bold text-amber-900">₹{prod.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Hub */}
                  <div className="flex flex-wrap items-center md:justify-end gap-2 self-end">
                    {/* Copy recovery link */}
                    <button
                      type="button"
                      onClick={() => handleCopyRecoveryLink(item)}
                      className="px-3 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Copy 1-Click Link</span>
                        </>
                      )}
                    </button>

                    {/* WhatsApp Recovery button */}
                    {!isRecovered && (
                      <button
                        type="button"
                        onClick={() => openRecoveryModal(item)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Recovery</span>
                      </button>
                    )}

                    {/* Mark as recovered manual toggle */}
                    {!isRecovered ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRecovered(item.id)}
                        className="px-3 py-2 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 text-stone-700 text-xs font-bold rounded-xl transition-all"
                        title="Mark as successfully recovered manually"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center px-3 py-2 bg-emerald-100/60 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Recovered
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Recovery Customization & Dispatch Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200">
                  <MessageSquare className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">1-Click WhatsApp Cart Recovery</h3>
                  <p className="text-xs text-emerald-200">
                    Customer: {activeModalItem.customerName} • {activeModalItem.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>
                    Auto-includes <strong>RECOVER10</strong> (10% OFF discount) & instant 1-click cart recovery link.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  WhatsApp Message Draft (Review or customize before sending):
                </label>
                <div className="bg-[#EFEAE2] p-4 rounded-xl border border-stone-300">
                  <textarea
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    rows={10}
                    className="w-full bg-white rounded-lg p-3 text-xs font-sans text-stone-800 leading-relaxed outline-none resize-y border border-stone-200"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendRecoveryWhatsApp}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch WhatsApp & Mark Contacted</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

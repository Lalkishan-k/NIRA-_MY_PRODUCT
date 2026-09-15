import React, { useState, useEffect } from 'react';
import {
  Building2,
  Package,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Tag,
  ChevronDown,
  Trash2,
  Send,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { BulkEnquiry } from '../types';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';
import { openWhatsAppDirect } from '../utils/whatsappNotifications';

export const B2BBulkEnquiriesHub: React.FC = () => {
  const { addToast } = useStore();
  const [enquiries, setEnquiries] = useState<BulkEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<any>({});

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('Pending');
  const [editQuotedAmount, setEditQuotedAmount] = useState<string>('');
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBulkEnquiries({
        status: statusFilter,
        search: searchQuery
      });
      setEnquiries(res.enquiries || []);
      setStats(res.stats || {});
    } catch (err: any) {
      addToast(err.message || 'Failed to load B2B bulk enquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEnquiries();
  };

  const handleStatusChange = async (enquiry: BulkEnquiry, newStatus: any) => {
    try {
      const updated = await api.updateAdminBulkEnquiry(enquiry.id, { status: newStatus });
      setEnquiries(enquiries.map((b) => (b.id === enquiry.id ? updated : b)));
      addToast(`Updated status for ${enquiry.referenceNumber} to ${newStatus}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveDetails = async (id: string) => {
    try {
      const updated = await api.updateAdminBulkEnquiry(id, {
        status: editStatus as any,
        quotedAmount: editQuotedAmount ? Number(editQuotedAmount) : undefined,
        adminNotes: editAdminNotes
      });
      setEnquiries(enquiries.map((b) => (b.id === id ? updated : b)));
      setEditingId(null);
      addToast(`Saved quotation details for ${updated.referenceNumber}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save details', 'error');
    }
  };

  const handleDelete = async (id: string, refNum: string) => {
    if (!confirm(`Are you sure you want to delete enquiry ${refNum}?`)) return;
    try {
      await api.deleteAdminBulkEnquiry(id);
      setEnquiries(enquiries.filter((b) => b.id !== id));
      addToast(`Deleted enquiry ${refNum}`, 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete enquiry', 'error');
    }
  };

  const handleDispatchWhatsAppQuote = (enquiry: BulkEnquiry) => {
    const quoteText = enquiry.quotedAmount
      ? `*Quoted Amount:* ₹${enquiry.quotedAmount.toLocaleString('en-IN')}`
      : `*Status:* Under Processing for Special Bulk Tier Discount`;

    const msg = `*NIRA Pure Kerala Coconut Oil — Official Wholesale Quotation*\n\n` +
      `Dear ${enquiry.contactPerson},\n` +
      `Thank you for your bulk enquiry [Ref: *${enquiry.referenceNumber}*] for *${enquiry.businessName}*.\n\n` +
      `*Order Details:*\n` +
      `• Business Type: ${enquiry.businessType}\n` +
      `• Delivery Location: ${enquiry.city}, ${enquiry.state}\n` +
      `• Requested Volume: ${enquiry.totalEstimatedLitres} Litres\n` +
      `• 15L Bulk Cans: ${enquiry.preferredPackaging?.can15L || 0} units\n` +
      `• 5L Jerrycans: ${enquiry.preferredPackaging?.can5L || 0} units\n` +
      `• 1L Glass/PET: ${enquiry.preferredPackaging?.bottle1L || 0} units\n\n` +
      `${quoteText}\n\n` +
      `✔ Grade-A Unfiltered Kozhikode Copra Oil\n` +
      `✔ Certificate of Analysis (CoA) & FSSAI Compliant\n` +
      `✔ GST Tax Credit Invoice Included\n\n` +
      `Please let us know if you would like us to issue the official proforma invoice and dispatch terms.`;

    openWhatsAppDirect(enquiry.phone, msg);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>B2B Commercial Desk</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Wholesale & Bulk Quotations Portal
          </h2>
          <p className="text-xs text-stone-500">
            Manage bulk quotes for Ayurvedic hospitals, organic retail chains, restaurants, and exporters.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEnquiries}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total B2B Enquiries</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900">{stats.totalCount || 0}</span>
            <Building2 className="w-5 h-5 text-stone-400" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-amber-700">{stats.pendingCount || 0}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Quotations Sent</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-emerald-700">{stats.quotedCount || 0}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Total Bulk Volume</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-teal-800">{stats.totalBulkLitres || 0} L</span>
            <Package className="w-5 h-5 text-teal-600" />
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Pending', 'In Progress', 'Quotation Sent', 'Closed', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search business, ref, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-700 focus:bg-white"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* ENQUIRIES TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-700" />
            <p className="text-xs font-semibold">Loading wholesale enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-serif font-bold text-base text-stone-800">No B2B Enquiries Found</p>
            <p className="text-xs text-stone-500">
              {statusFilter !== 'All' ? `No enquiries matching status "${statusFilter}".` : 'No wholesale quotation requests submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Ref & Date</th>
                  <th className="px-5 py-3.5">Business & Contact</th>
                  <th className="px-5 py-3.5">Category & Location</th>
                  <th className="px-5 py-3.5">Requested Packaging</th>
                  <th className="px-5 py-3.5">Status & Quote</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {enquiries.map((b) => {
                  const isEditing = editingId === b.id;

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Ref & Date */}
                      <td className="px-5 py-4 align-top space-y-1">
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 block w-max text-[11px]">
                          {b.referenceNumber}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Business & Contact */}
                      <td className="px-5 py-4 align-top space-y-1">
                        <div className="font-bold text-stone-900">{b.businessName}</div>
                        <div className="text-stone-600 font-semibold">{b.contactPerson}</div>
                        <div className="flex items-center space-x-2 text-[11px] text-stone-500">
                          <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-stone-400" />{b.email}</span>
                          <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-stone-400" />{b.phone}</span>
                        </div>
                        {b.gstNumber && (
                          <div className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-max">
                            GSTIN: {b.gstNumber}
                          </div>
                        )}
                      </td>

                      {/* Category & Location */}
                      <td className="px-5 py-4 align-top space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[10px] border border-stone-200">
                          {b.businessType}
                        </span>
                        <div className="text-stone-600 font-medium flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-stone-400" />
                          {b.city}, {b.state}
                        </div>
                        <div className="text-[10px] text-stone-400 italic">
                          Freq: {b.orderFrequency}
                        </div>
                      </td>

                      {/* Packaging Breakdown */}
                      <td className="px-5 py-4 align-top space-y-1">
                        <div className="font-serif font-bold text-stone-900 text-sm">
                          {b.totalEstimatedLitres} Litres Total
                        </div>
                        <div className="text-[11px] text-stone-600 space-y-0.5">
                          {b.preferredPackaging?.can15L > 0 && <div>• {b.preferredPackaging.can15L}x 15L Commercial Tin</div>}
                          {b.preferredPackaging?.can5L > 0 && <div>• {b.preferredPackaging.can5L}x 5L Jerrycan</div>}
                          {b.preferredPackaging?.bottle1L > 0 && <div>• {b.preferredPackaging.bottle1L}x 1L Retail Bottle</div>}
                          {b.preferredPackaging?.bottle500ml > 0 && <div>• {b.preferredPackaging.bottle500ml}x 500ml Bottle</div>}
                        </div>
                        {b.additionalNotes && (
                          <p className="text-[10px] text-stone-500 italic bg-amber-50/50 p-1.5 rounded border border-amber-100 mt-1 max-w-xs">
                            "{b.additionalNotes}"
                          </p>
                        )}
                      </td>

                      {/* Status & Quoted Value */}
                      <td className="px-5 py-4 align-top space-y-2">
                        {isEditing ? (
                          <div className="space-y-2 bg-amber-50 p-2 rounded-xl border border-amber-200 w-48">
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block">Status</label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full text-xs p-1 bg-white border border-stone-300 rounded"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Quotation Sent">Quotation Sent</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block">Quoted Amount (₹)</label>
                              <input
                                type="number"
                                value={editQuotedAmount}
                                onChange={(e) => setEditQuotedAmount(e.target.value)}
                                placeholder="48500"
                                className="w-full text-xs p-1 bg-white border border-stone-300 rounded font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-stone-600 block">Admin Notes</label>
                              <input
                                type="text"
                                value={editAdminNotes}
                                onChange={(e) => setEditAdminNotes(e.target.value)}
                                placeholder="Shared 18% tier quote"
                                className="w-full text-xs p-1 bg-white border border-stone-300 rounded"
                              />
                            </div>
                            <div className="flex space-x-1 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSaveDetails(b.id)}
                                className="flex-1 py-1 bg-emerald-600 text-white rounded font-bold text-[10px] flex items-center justify-center"
                              >
                                <Save className="w-3 h-3 mr-1" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-stone-200 text-stone-700 rounded font-bold text-[10px]"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                b.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : b.status === 'Quotation Sent'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : b.status === 'Closed'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : b.status === 'In Progress'
                                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                                  : 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Quotation Sent">Quotation Sent</option>
                              <option value="Closed">Closed</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            {b.quotedAmount ? (
                              <div className="font-mono text-emerald-800 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                Quoted: ₹{b.quotedAmount.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div className="text-[10px] text-stone-400 italic">No quote amount logged</div>
                            )}

                            {b.adminNotes && (
                              <p className="text-[10px] text-stone-500 bg-stone-100 p-1 rounded">
                                {b.adminNotes}
                              </p>
                            )}
                          </>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top text-right space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleDispatchWhatsAppQuote(b)}
                          className="inline-flex items-center justify-center space-x-1.5 w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors"
                          title="Dispatch official WhatsApp quotation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Quote</span>
                        </button>

                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(b.id);
                              setEditStatus(b.status);
                              setEditQuotedAmount(b.quotedAmount ? String(b.quotedAmount) : '');
                              setEditAdminNotes(b.adminNotes || '');
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs"
                            title="Edit quotation amount and notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(b.id, b.referenceNumber)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs"
                            title="Delete enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

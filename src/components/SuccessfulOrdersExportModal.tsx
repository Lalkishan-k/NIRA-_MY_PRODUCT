import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Package,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  X,
  Search,
  Filter,
  Layers,
  ArrowDownToLine,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import {
  ReportTimeframe,
  filterOrdersByTimeframe,
  downloadSuccessfulOrdersCsv,
  downloadItemizedSuccessfulOrdersCsv,
  downloadSuccessfulOrdersExcel
} from '../utils/orderReports';

interface SuccessfulOrdersExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  initialTimeframe?: ReportTimeframe;
}

export const SuccessfulOrdersExportModal: React.FC<SuccessfulOrdersExportModalProps> = ({
  isOpen,
  onClose,
  orders,
  onToast,
  initialTimeframe = 'weekly'
}) => {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>(initialTimeframe);
  const [paidOnly, setPaidOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const stats = useMemo(() => {
    const start = customStartDate ? new Date(customStartDate) : undefined;
    const end = customEndDate ? new Date(customEndDate) : undefined;
    return filterOrdersByTimeframe(orders, timeframe, start, end, paidOnly);
  }, [orders, timeframe, customStartDate, customEndDate, paidOnly]);

  const previewOrders = useMemo(() => {
    if (!searchQuery.trim()) return stats.orders;
    const q = searchQuery.toLowerCase();
    return stats.orders.filter(o => {
      const matchId = o.orderId.toLowerCase().includes(q);
      const matchName = (o.customerName || '').toLowerCase().includes(q);
      const matchPhone = (o.phone || '').includes(q);
      const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
      const matchProducts = (o.items || []).some(item => (item.name || '').toLowerCase().includes(q));
      return matchId || matchName || matchPhone || matchCity || matchProducts;
    });
  }, [stats.orders, searchQuery]);

  if (!isOpen) return null;

  const handleDownloadExcel = () => {
    try {
      downloadSuccessfulOrdersExcel(
        stats.orders,
        `${stats.timeframe}-successful-orders`,
        stats.label
      );
      onToast(`Downloaded ${stats.orders.length} orders as formatted Excel (.xls)!`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Error exporting orders', 'error');
    }
  };

  const handleDownloadCsv = () => {
    try {
      downloadSuccessfulOrdersCsv(stats.orders, `${stats.timeframe}-orders-ledger`);
      onToast(`Downloaded ${stats.orders.length} orders as CSV!`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Error exporting orders', 'error');
    }
  };

  const handleDownloadItemizedCsv = () => {
    try {
      downloadItemizedSuccessfulOrdersCsv(stats.orders, `${stats.timeframe}-itemized-products`);
      onToast(`Downloaded itemized product breakdown CSV!`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Error exporting orders', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Successful Orders Export Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wide">
                  Official Ledger
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Download weekly, monthly, and yearly successful customer and product breakdown reports with full address details, quantities, and pricing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeframe Selector Bar */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              Period:
            </span>
            <button
              type="button"
              onClick={() => setTimeframe('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'weekly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Weekly (7 Days)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'monthly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Monthly (30 Days)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('yearly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'yearly'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Yearly (365 Days)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === 'custom'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200">
            <input
              type="checkbox"
              checked={paidOnly}
              onChange={e => setPaidOnly(e.target.checked)}
              className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
            />
            <span>Paid Status Only</span>
          </label>
        </div>

        {/* Custom Date Range Pickers (if timeframe === 'custom') */}
        {timeframe === 'custom' && (
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-wrap items-center gap-3 text-xs shrink-0">
            <span className="font-bold text-amber-900">Custom Date Span:</span>
            <div className="flex items-center gap-2">
              <label className="text-stone-600">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-semibold"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-stone-600">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-semibold"
              />
            </div>
          </div>
        )}

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Successful Orders</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <p className="font-serif text-2xl font-bold text-stone-900">{stats.totalOrders}</p>
            <p className="text-[10px] text-stone-400">Total processed in period</p>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              <span>Sales Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <p className="font-serif text-2xl font-bold text-emerald-950">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-emerald-700/80">Avg Order: ₹{stats.averageOrderValue}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Total Units Sold</span>
              <Package className="w-3.5 h-3.5 text-stone-600" />
            </div>
            <p className="font-serif text-2xl font-bold text-stone-900">{stats.totalUnitsSold}</p>
            <p className="text-[10px] text-stone-500">
              200ml: {stats.unitsBySize['200 ml'] || 0} • 500ml: {stats.unitsBySize['500 ml'] || 0} • 1L: {stats.unitsBySize['1 Litre'] || 0}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              <span>Packaging Volume</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl font-bold text-amber-950">
                {((stats.unitsBySize['200 ml'] || 0) * 0.2 + (stats.unitsBySize['500 ml'] || 0) * 0.5 + (stats.unitsBySize['1 Litre'] || 0) * 1.0).toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-amber-900">Litres Dispatched</span>
            </div>
            <p className="text-[10px] text-amber-800/80">100% Unfiltered pure oil</p>
          </div>
        </div>

        {/* Download Action Cards */}
        <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3 shrink-0 shadow-sm border border-stone-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-sm text-amber-300 block flex items-center gap-1.5">
                <ArrowDownToLine className="w-4 h-4 text-amber-400" />
                Download Reports for {stats.label}
              </span>
              <span className="text-xs text-stone-400">
                Exports include complete customer contact details, delivery address, itemized products, quantities, and financials.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={stats.totalOrders === 0}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Download Formatted Excel (.xls)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={stats.totalOrders === 0}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-stone-700 shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Orders Ledger (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadItemizedCsv}
              disabled={stats.totalOrders === 0}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Layers className="w-4 h-4 text-stone-900" />
              <span>Download Itemized Sales (CSV)</span>
            </button>
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="flex-1 min-h-0 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">
              Orders Included in Export ({previewOrders.length} records):
            </span>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search preview..."
                className="w-full text-xs pl-8 pr-3 py-1 rounded-lg border border-stone-300 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 sticky top-0 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold z-10">
                <tr>
                  <th className="p-3">Order ID & Date</th>
                  <th className="p-3">Customer & Contact</th>
                  <th className="p-3">City & PIN</th>
                  <th className="p-3">Products & Quantities</th>
                  <th className="p-3">Total (₹)</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {previewOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-400">
                      No successful orders found matching the timeframe and criteria.
                    </td>
                  </tr>
                ) : (
                  previewOrders.map(o => (
                    <tr key={o.orderId} className="hover:bg-stone-50/60">
                      <td className="p-3 align-top whitespace-nowrap">
                        <span className="font-mono font-bold text-stone-900">{o.orderId}</span>
                        <span className="block text-[10px] text-stone-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <p className="font-bold text-stone-900">{o.customerName || 'Customer'}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{o.phone || o.email || 'N/A'}</p>
                      </td>
                      <td className="p-3 align-top">
                        <p className="text-stone-800">{o.shippingAddress?.city || 'Kerala'}</p>
                        <p className="text-[10px] text-stone-400">{o.shippingAddress?.pinCode || ''}</p>
                      </td>
                      <td className="p-3 align-top min-w-[220px]">
                        <div className="space-y-1">
                          {(o.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                              <span className="font-semibold text-stone-800 truncate mr-2">{item.name}</span>
                              <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded font-bold">
                                {item.size} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 align-top font-bold text-stone-900">₹{o.totalAmount}</td>
                      <td className="p-3 align-top">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {o.paymentStatus}
                        </span>
                        <span className="block text-[10px] text-stone-400 mt-0.5">{o.paymentMethod}</span>
                      </td>
                      <td className="p-3 align-top">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 shrink-0">
          <span className="text-[11px] text-stone-500">
            📊 Export includes detailed metadata, product quantities, customer contacts, and transaction timestamps.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};

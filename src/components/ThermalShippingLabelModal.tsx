import React, { useState } from 'react';
import {
  Printer,
  X,
  Package,
  Truck,
  CheckSquare,
  ShieldCheck,
  MapPin,
  Phone,
  QrCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy
} from 'lucide-react';
import { Order } from '../types';

interface ThermalShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onMarkPacked?: (orderId: string) => void;
}

// Simple & crisp SVG Barcode generator for Order IDs & AWBs
const OrderIdBarcode: React.FC<{ value: string; height?: number }> = ({ value, height = 48 }) => {
  // Generate a deterministic pattern of bars from the string
  const patterns: string[] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
  }

  // Convert characters to binary bar sequences (start guard, bars, stop guard)
  const binaryBars: number[] = [1, 0, 1, 0]; // Start
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const pattern = [(code >> 3) & 1, 1, (code >> 2) & 1, 0, (code >> 1) & 1, 1, code & 1, 0];
    binaryBars.push(...pattern);
  }
  binaryBars.push(1, 1, 0, 1, 0, 1); // Stop

  const barWidth = 2.5;
  const totalWidth = binaryBars.length * barWidth;

  return (
    <div className="flex flex-col items-center justify-center space-y-0.5">
      <svg
        width={Math.max(180, totalWidth)}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="max-w-full"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        {binaryBars.map((bar, idx) =>
          bar === 1 ? (
            <rect
              key={idx}
              x={idx * barWidth}
              y={0}
              width={barWidth}
              height={height}
              fill="#000000"
            />
          ) : null
        )}
      </svg>
      <span className="font-mono text-[11px] font-bold tracking-widest text-black uppercase">
        *{value}*
      </span>
    </div>
  );
};

export const ThermalShippingLabelModal: React.FC<ThermalShippingLabelModalProps> = ({
  isOpen,
  onClose,
  orders,
  onMarkPacked
}) => {
  const [printMode, setPrintMode] = useState<'thermal' | 'packingSlip'>('thermal');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  if (!isOpen || !orders || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      {/* PRINT-ONLY CSS RULES FOR EXACT 4x6 INCH THERMAL PRINTERS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible !important;
          }
          #thermal-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          @page {
            size: ${printMode === 'thermal' ? '4in 6in' : 'A4 portrait'};
            margin: 0mm;
          }
          .no-print {
            display: none !important;
          }
          .thermal-sticker-page {
            page-break-after: always !important;
            break-after: page !important;
            width: ${printMode === 'thermal' ? '4in' : '100%'} !important;
            min-height: ${printMode === 'thermal' ? '6in' : 'auto'} !important;
            padding: 0.15in !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      {/* MODAL DIALOG CONTAINER */}
      <div className="bg-stone-900 text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col max-h-[92vh] no-print">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Warehouse Thermal Label & Packing Slip Generator
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold rounded-full border border-amber-400/30">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders Selected'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Optimized for standard 4×6 inch (100×150mm) thermal sticker printers (Zebra, TSC, Xprinter, Rollo).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Mode Switcher */}
            <div className="bg-stone-800 p-1 rounded-xl flex items-center text-xs font-bold border border-stone-700">
              <button
                type="button"
                onClick={() => setPrintMode('thermal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printMode === 'thermal'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                4x6 Thermal Sticker
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('packingSlip')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printMode === 'packingSlip'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                A4 Packing Slip
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL ACTION BAR */}
        <div className="p-4 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-3 text-stone-300">
            <span className="flex items-center text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 mr-1" /> FSSAI Lic #11322007000123
            </span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="hidden sm:inline text-stone-400">Origin: Kozhikode Extraction Mill, Kerala</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center space-x-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printMode === 'thermal' ? '4x6 Sticker Labels' : 'Packing Slips'} (Ctrl+P)</span>
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-950/60 space-y-8 flex flex-col items-center">
          <div id="thermal-print-area" className="w-full flex flex-col items-center space-y-8">
            {orders.map((order) => {
              const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
              const isCOD = order.paymentMethod === 'COD' || order.paymentStatus === 'Pending';

              if (printMode === 'thermal') {
                return (
                  /* 4x6 INCH THERMAL LABEL STICKER TEMPLATE */
                  <div
                    key={order.id}
                    className="thermal-sticker-page bg-white text-black font-sans w-[4in] min-h-[6in] p-4 rounded-xl shadow-2xl border-2 border-black flex flex-col justify-between select-none text-left"
                    style={{ boxSizing: 'border-box' }}
                  >
                    {/* SECTION 1: HEADER & COURIER BADGE */}
                    <div className="border-b-2 border-black pb-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="font-serif font-extrabold text-base tracking-tight uppercase">
                            NIRA PURE COCONUT OIL
                          </span>
                        </div>
                        <span className="border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-black text-white">
                          {isCOD ? 'C.O.D.' : 'PREPAID'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-black border-t border-black/30 pt-1">
                        <span>ORIGIN: KOZHIKODE MILL, KERALA</span>
                        <span>FSSAI #11322007000123</span>
                      </div>
                    </div>

                    {/* SECTION 2: BARCODE & AWB / ORDER ID */}
                    <div className="py-2 border-b-2 border-black text-center space-y-1">
                      <OrderIdBarcode value={order.orderId} height={42} />
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold px-1 text-black">
                        <span>DATE: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        <span>SHIPPER: BLUEDART / DELHIVERY</span>
                      </div>
                    </div>

                    {/* SECTION 3: RECIPIENT SHIPPING ADDRESS */}
                    <div className="py-2 border-b-2 border-black space-y-1 bg-stone-50/50 p-2 rounded-sm">
                      <span className="text-[9px] font-black uppercase tracking-wider block text-black/70">
                        SHIP TO (CUSTOMER ADDRESS):
                      </span>
                      <div className="font-bold text-sm leading-tight text-black">
                        {order.shippingAddress.fullName}
                      </div>
                      <div className="text-xs font-semibold text-black leading-tight">
                        {order.shippingAddress.house}, {order.shippingAddress.street}
                      </div>
                      <div className="text-xs font-bold text-black uppercase">
                        {order.shippingAddress.city}, {order.shippingAddress.district || ''} -{' '}
                        <span className="font-black underline text-sm bg-black text-white px-1 py-0.5 rounded-2xs">
                          {order.shippingAddress.pinCode}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-black flex items-center pt-0.5">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>TEL: {order.shippingAddress.phone || order.phone}</span>
                      </div>
                    </div>

                    {/* SECTION 4: WAREHOUSE PACKING CHECKLIST */}
                    <div className="py-2 border-b-2 border-black space-y-1 flex-1">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black border-b border-black/40 pb-0.5">
                        <span>PACKING CHECKLIST ({totalItemsCount} ITEMS)</span>
                        <span>QTY / CHECK</span>
                      </div>

                      <div className="space-y-1 pt-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs font-bold border-b border-dashed border-black/20 pb-1"
                          >
                            <div className="flex items-center space-x-1.5 max-w-[2.6in]">
                              <span className="w-3.5 h-3.5 border-2 border-black rounded-xs inline-block shrink-0" />
                              <span className="truncate leading-tight text-[11px]">{item.name}</span>
                            </div>
                            <span className="font-mono text-xs font-black">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 5: FOOTER PAYMENT & SENDER RETURN ADDRESS */}
                    <div className="pt-2 text-[10px] space-y-1">
                      <div className="flex justify-between items-center bg-black text-white font-bold p-1 px-2 text-xs">
                        <span>AMOUNT TO COLLECT:</span>
                        <span className="font-mono text-sm font-black">
                          {isCOD ? `₹${order.totalAmount}` : '₹0 (PAID ONLINE)'}
                        </span>
                      </div>

                      <div className="text-[9px] text-black font-semibold pt-1 leading-tight border-t border-black/20">
                        <strong>RETURN SENDER:</strong> NIRA Pure Coconut Oil Works, Calicut Mill Road, Kozhikode, Kerala - 673001. Support: +91 95625 13642
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  /* FULL A4 PACKING SLIP & PICK LIST TEMPLATE */
                  <div
                    key={order.id}
                    className="thermal-sticker-page bg-white text-black font-sans w-full max-w-2xl p-8 rounded-xl shadow-2xl border-2 border-black space-y-6 text-left"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-black pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-black text-black">NIRA PURE COCONUT OIL</h2>
                        <p className="text-xs font-bold text-stone-600">Kozhikode Extraction Mill • Kerala, India</p>
                        <p className="text-xs text-stone-500">FSSAI Licence No: 11322007000123</p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="px-3 py-1 bg-black text-white font-mono text-xs font-black uppercase rounded">
                          PACKING SLIP & INVOICE
                        </span>
                        <div className="font-mono font-bold text-sm text-black pt-1">
                          ORDER: #{order.orderId}
                        </div>
                        <div className="text-xs text-stone-600">
                          Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Address Grid */}
                    <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-lg border border-stone-300">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-black block border-b border-stone-300 pb-1 mb-1">
                          SHIP TO (CUSTOMER):
                        </span>
                        <div className="font-bold text-sm text-black">{order.shippingAddress.fullName}</div>
                        <div>{order.shippingAddress.house}, {order.shippingAddress.street}</div>
                        <div>{order.shippingAddress.city}, {order.shippingAddress.district || ''} - <strong>{order.shippingAddress.pinCode}</strong></div>
                        <div>State: {order.shippingAddress.state}</div>
                        <div className="pt-1 font-bold">Phone: {order.shippingAddress.phone || order.phone}</div>
                        <div>Email: {order.email}</div>
                      </div>

                      <div>
                        <span className="font-bold uppercase tracking-wider text-black block border-b border-stone-300 pb-1 mb-1">
                          FULFILLMENT ORIGIN:
                        </span>
                        <div className="font-bold text-sm text-black">NIRA Extraction Mill Warehouse</div>
                        <div>Main Mill Road, Beach Area</div>
                        <div>Kozhikode, Kerala - 673001</div>
                        <div className="pt-1 font-bold">Courier: BlueDart / Express Air</div>
                        <div>Payment Method: <strong>{order.paymentMethod} ({order.paymentStatus})</strong></div>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider border-b-2 border-black pb-1">
                        ORDER ITEM PICK & PACK LIST
                      </h4>
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-200 border-b border-stone-400 font-bold text-black">
                            <th className="p-2 w-10">CHECK</th>
                            <th className="p-2">PRODUCT NAME & SIZE</th>
                            <th className="p-2 text-center">QTY</th>
                            <th className="p-2 text-right">UNIT PRICE</th>
                            <th className="p-2 text-right">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-300 font-medium">
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50">
                              <td className="p-2 text-center">
                                <span className="w-4 h-4 border-2 border-black inline-block rounded-2xs" />
                              </td>
                              <td className="p-2 font-bold text-black">
                                {item.name} ({item.size})
                              </td>
                              <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                              <td className="p-2 text-right font-mono">₹{item.unitPrice}</td>
                              <td className="p-2 text-right font-mono font-bold">₹{item.totalPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-between items-end border-t-2 border-black pt-4 text-xs">
                      <div className="space-y-1 text-stone-600 max-w-xs">
                        <p><strong>Packing Instructions:</strong> Use tamper-evident seal tape. Include 1x Product Catalog flyer & thank you card.</p>
                        <p className="text-[10px] italic">Thank you for supporting authentic Kerala wood cold-pressed coconut oil!</p>
                      </div>

                      <div className="space-y-1 text-right font-mono font-bold text-sm">
                        <div className="text-stone-600 text-xs">Subtotal: ₹{order.subtotal}</div>
                        {order.discount > 0 && <div className="text-emerald-700 text-xs">Discount: -₹{order.discount}</div>}
                        <div className="text-stone-600 text-xs">Shipping: {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</div>
                        <div className="text-base font-black text-black pt-1 border-t border-black">
                          Total Amount: ₹{order.totalAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

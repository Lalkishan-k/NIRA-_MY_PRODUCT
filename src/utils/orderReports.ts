import { Order, ProductSize } from '../types';

export type ReportTimeframe = 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all';

export interface TimeframeFilterResult {
  timeframe: ReportTimeframe;
  label: string;
  startDate: Date;
  endDate: Date;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  totalUnitsSold: number;
  unitsBySize: Record<string, number>;
  averageOrderValue: number;
  paymentMethodCounts: Record<string, number>;
}

/**
 * Checks if an order is considered "successful"
 * (Paid or in confirmed transit/delivery pipeline, and not cancelled or failed)
 */
export function isSuccessfulOrder(order: Order, paidOnly: boolean = false): boolean {
  if (order.orderStatus === 'Cancelled') return false;
  if (order.paymentStatus === 'Failed') return false;
  
  if (paidOnly) {
    return order.paymentStatus === 'Paid';
  }

  // Active / successful order statuses
  const successfulStatuses = ['Paid', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  return order.paymentStatus === 'Paid' || successfulStatuses.includes(order.orderStatus);
}

/**
 * Filter orders by selected timeframe
 */
export function filterOrdersByTimeframe(
  orders: Order[],
  timeframe: ReportTimeframe,
  customStart?: Date,
  customEnd?: Date,
  paidOnly: boolean = false
): TimeframeFilterResult {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date(now);
  let label = '';

  if (timeframe === 'weekly') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    label = 'Weekly Report (Past 7 Days)';
  } else if (timeframe === 'monthly') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    label = 'Monthly Report (Past 30 Days)';
  } else if (timeframe === 'yearly') {
    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    label = 'Yearly Report (Past 365 Days)';
  } else if (timeframe === 'custom' && customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
    label = `Custom Period (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
  } else {
    // All time
    startDate = new Date(0);
    label = 'All-Time Successful Orders Report';
  }

  const filteredOrders = orders.filter(order => {
    if (!isSuccessfulOrder(order, paidOnly)) return false;
    const orderDate = new Date(order.createdAt);
    if (timeframe === 'all') return true;
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Sort descending by creation date
  filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  let totalUnitsSold = 0;
  const unitsBySize: Record<string, number> = {
    '200 ml': 0,
    '500 ml': 0,
    '1 Litre': 0,
    'Other': 0
  };

  const paymentMethodCounts: Record<string, number> = {};

  filteredOrders.forEach(order => {
    const method = order.paymentMethod || 'Razorpay';
    paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;

    (order.items || []).forEach(item => {
      const qty = item.quantity || 1;
      totalUnitsSold += qty;
      const sizeKey = item.size || 'Other';
      if (unitsBySize[sizeKey] !== undefined) {
        unitsBySize[sizeKey] += qty;
      } else {
        unitsBySize['Other'] += qty;
      }
    });
  });

  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return {
    timeframe,
    label,
    startDate,
    endDate,
    orders: filteredOrders,
    totalOrders,
    totalRevenue,
    totalUnitsSold,
    unitsBySize,
    averageOrderValue,
    paymentMethodCounts
  };
}

/**
 * Format CSV cell to escape quotes and commas
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Successful Orders to Detailed Order-Level CSV
 */
export function downloadSuccessfulOrdersCsv(
  ordersToExport: Order[],
  reportTitle: string = 'Weekly-Successful-Orders'
) {
  if (!ordersToExport || ordersToExport.length === 0) {
    throw new Error('No successful orders found in the selected timeframe to export.');
  }

  const headers = [
    'Order ID',
    'Order Date & Time',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Delivery House / Flat',
    'Delivery Street Address',
    'Delivery Locality / Area',
    'City',
    'District',
    'State',
    'PIN Code',
    'Landmark',
    'Product Breakdown (Name | Size | Qty | Unit Price | Total)',
    'Total Units Sold',
    'Order Subtotal (INR)',
    'Discount (INR)',
    'Coupon Code',
    'Shipping Charges (INR)',
    'Grand Total Amount (INR)',
    'Payment Method',
    'Payment Status',
    'Transaction Reference ID',
    'Order Status',
    'Courier Partner',
    'Tracking AWB'
  ];

  const rows = ordersToExport.map(o => {
    const totalUnits = (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
    const productSummary = (o.items || [])
      .map(
        i =>
          `${i.name} [Size: ${i.size || 'Standard'}, Qty: ${i.quantity}, Price: ₹${i.unitPrice}, Subtotal: ₹${
            i.totalPrice || i.unitPrice * i.quantity
          }]`
      )
      .join('; ');

    return [
      escapeCsv(o.orderId),
      escapeCsv(new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      escapeCsv(o.customerName || o.shippingAddress?.fullName || 'Customer'),
      escapeCsv(o.phone || o.shippingAddress?.phone || ''),
      escapeCsv(o.email || o.shippingAddress?.email || ''),
      escapeCsv(o.shippingAddress?.house || ''),
      escapeCsv(o.shippingAddress?.street || ''),
      escapeCsv(o.shippingAddress?.locality || ''),
      escapeCsv(o.shippingAddress?.city || 'Kerala'),
      escapeCsv(o.shippingAddress?.district || ''),
      escapeCsv(o.shippingAddress?.state || 'Kerala'),
      escapeCsv(o.shippingAddress?.pinCode || ''),
      escapeCsv(o.shippingAddress?.landmark || ''),
      escapeCsv(productSummary),
      totalUnits,
      o.subtotal || o.totalAmount,
      o.discount || 0,
      escapeCsv(o.couponCode || 'None'),
      o.shippingCost || 0,
      o.totalAmount,
      escapeCsv(o.paymentMethod || 'Razorpay'),
      escapeCsv(o.paymentStatus || 'Paid'),
      escapeCsv(o.razorpayPaymentId || o.razorpayOrderId || 'N/A'),
      escapeCsv(o.orderStatus),
      escapeCsv(o.courierPartner || 'Express Logistics'),
      escapeCsv(o.trackingNumber || 'N/A')
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `NIRA-${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Itemized Line-by-Line CSV (Every single item purchased has its own row with customer info)
 */
export function downloadItemizedSuccessfulOrdersCsv(
  ordersToExport: Order[],
  reportTitle: string = 'Itemized-Product-Sales'
) {
  if (!ordersToExport || ordersToExport.length === 0) {
    throw new Error('No successful orders found in the selected timeframe.');
  }

  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Phone',
    'Email',
    'Delivery City',
    'Delivery State',
    'PIN Code',
    'Full Address',
    'Product Name',
    'Packaging Size',
    'Quantity Ordered',
    'Unit Price (INR)',
    'Item Total (INR)',
    'Order Total Amount (INR)',
    'Payment Method',
    'Payment Status',
    'Order Status'
  ];

  const rows: string[][] = [];

  ordersToExport.forEach(o => {
    const fullAddr = [
      o.shippingAddress?.house,
      o.shippingAddress?.street,
      o.shippingAddress?.locality,
      o.shippingAddress?.city,
      o.shippingAddress?.state,
      o.shippingAddress?.pinCode
    ]
      .filter(Boolean)
      .join(', ');

    (o.items || []).forEach(item => {
      rows.push([
        escapeCsv(o.orderId),
        escapeCsv(new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
        escapeCsv(o.customerName || o.shippingAddress?.fullName || 'Customer'),
        escapeCsv(o.phone || o.shippingAddress?.phone || ''),
        escapeCsv(o.email || o.shippingAddress?.email || ''),
        escapeCsv(o.shippingAddress?.city || 'Kerala'),
        escapeCsv(o.shippingAddress?.state || 'Kerala'),
        escapeCsv(o.shippingAddress?.pinCode || ''),
        escapeCsv(fullAddr),
        escapeCsv(item.name),
        escapeCsv(item.size || 'Standard'),
        String(item.quantity || 1),
        String(item.unitPrice || 0),
        String(item.totalPrice || item.unitPrice * (item.quantity || 1)),
        String(o.totalAmount),
        escapeCsv(o.paymentMethod || 'Razorpay'),
        escapeCsv(o.paymentStatus || 'Paid'),
        escapeCsv(o.orderStatus)
      ]);
    });
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `NIRA-${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-itemized-${new Date().toISOString().slice(0, 10)}.csv`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Rich Formatted Excel (.xls XML document) with KPI Header & Detailed Order Tables
 */
export function downloadSuccessfulOrdersExcel(
  ordersToExport: Order[],
  reportTitle: string = 'Successful Orders Sales Ledger',
  timeframeLabel: string = 'Weekly Report'
) {
  if (!ordersToExport || ordersToExport.length === 0) {
    throw new Error('No successful orders found in the selected timeframe to export.');
  }

  const totalRevenue = ordersToExport.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalUnits = ordersToExport.reduce(
    (sum, o) => sum + (o.items || []).reduce((isum, item) => isum + (item.quantity || 1), 0),
    0
  );

  const units200ml = ordersToExport.reduce(
    (sum, o) =>
      sum +
      (o.items || [])
        .filter(i => (i.size || '').includes('200'))
        .reduce((isum, item) => isum + (item.quantity || 1), 0),
    0
  );

  const units500ml = ordersToExport.reduce(
    (sum, o) =>
      sum +
      (o.items || [])
        .filter(i => (i.size || '').includes('500'))
        .reduce((isum, item) => isum + (item.quantity || 1), 0),
    0
  );

  const units1L = ordersToExport.reduce(
    (sum, o) =>
      sum +
      (o.items || [])
        .filter(i => (i.size || '').includes('1 Litre') || (i.size || '').includes('1L'))
        .reduce((isum, item) => isum + (item.quantity || 1), 0),
    0
  );

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <title>${reportTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; color: #1c1917; }
        .header-title { font-size: 16pt; font-weight: bold; color: #064e3b; }
        .header-sub { font-size: 11pt; color: #78716c; margin-bottom: 12px; }
        .kpi-table { border-collapse: collapse; margin-bottom: 18px; }
        .kpi-table td { border: 1px solid #d6d3d1; padding: 8px 14px; }
        .kpi-label { background-color: #f5f5f4; font-size: 9pt; color: #57534e; text-transform: uppercase; font-weight: bold; }
        .kpi-val { font-size: 13pt; font-weight: bold; color: #064e3b; }
        .orders-table { border-collapse: collapse; width: 100%; }
        .orders-table th { background-color: #064e3b; color: #ffffff; border: 1px solid #047857; padding: 9px 8px; text-align: left; font-size: 9.5pt; font-weight: bold; }
        .orders-table td { border: 1px solid #e7e5e4; padding: 7px 8px; font-size: 9pt; vertical-align: top; }
        .orders-table tr:nth-child(even) { background-color: #fafaf9; }
        .tag-paid { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .tag-status { background-color: #fef3c7; color: #92400e; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
        .bold { font-weight: bold; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="header-title">🌴 NIRA UNFILTERED PURE COCONUT OIL — SALES & ORDER LEDGER</div>
      <div class="header-sub">
        <b>Report:</b> ${timeframeLabel} | <b>Export Date:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | <b>Filter:</b> Successful & Paid Orders
      </div>

      <!-- Executive KPI Summary Table -->
      <table class="kpi-table">
        <tr>
          <td class="kpi-label">Total Successful Orders</td>
          <td class="kpi-label">Total Sales Revenue</td>
          <td class="kpi-label">Total Units Sold</td>
          <td class="kpi-label">200 ml Bottles</td>
          <td class="kpi-label">500 ml Bottles</td>
          <td class="kpi-label">1 Litre Bottles</td>
          <td class="kpi-label">Avg Order Value</td>
        </tr>
        <tr>
          <td class="kpi-val">${ordersToExport.length}</td>
          <td class="kpi-val">₹${totalRevenue.toLocaleString('en-IN')}</td>
          <td class="kpi-val">${totalUnits} units</td>
          <td class="kpi-val">${units200ml}</td>
          <td class="kpi-val">${units500ml}</td>
          <td class="kpi-val">${units1L}</td>
          <td class="kpi-val">₹${Math.round(totalRevenue / ordersToExport.length).toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <!-- Detailed Orders Table -->
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Delivery Address</th>
            <th>City</th>
            <th>State</th>
            <th>PIN</th>
            <th>Products & Quantities (Detail)</th>
            <th class="text-right">Total Units</th>
            <th class="text-right">Subtotal (₹)</th>
            <th class="text-right">Discount (₹)</th>
            <th class="text-right">Net Total (₹)</th>
            <th>Payment Mode</th>
            <th>Payment Status</th>
            <th>Order Status</th>
            <th>Tracking No / Partner</th>
          </tr>
        </thead>
        <tbody>
          ${ordersToExport
            .map(o => {
              const fullAddress = [
                o.shippingAddress?.house,
                o.shippingAddress?.street,
                o.shippingAddress?.locality
              ]
                .filter(Boolean)
                .join(', ');

              const itemDetails = (o.items || [])
                .map(
                  item =>
                    `• <b>${item.name}</b> (${item.size || 'Standard'}) — <b>${item.quantity} qty</b> × ₹${
                      item.unitPrice
                    } = ₹${item.totalPrice || item.unitPrice * item.quantity}`
                )
                .join('<br/>');

              const totalOrderUnits = (o.items || []).reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );

              return `
                <tr>
                  <td class="bold">${o.orderId}</td>
                  <td>${new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  <td class="bold">${o.customerName || o.shippingAddress?.fullName || 'Customer'}</td>
                  <td>${o.phone || o.shippingAddress?.phone || 'N/A'}</td>
                  <td>${o.email || o.shippingAddress?.email || 'N/A'}</td>
                  <td>${fullAddress || 'N/A'}</td>
                  <td>${o.shippingAddress?.city || 'Kerala'}</td>
                  <td>${o.shippingAddress?.state || 'Kerala'}</td>
                  <td>${o.shippingAddress?.pinCode || ''}</td>
                  <td>${itemDetails}</td>
                  <td class="text-right bold">${totalOrderUnits}</td>
                  <td class="text-right">₹${o.subtotal || o.totalAmount}</td>
                  <td class="text-right">₹${o.discount || 0}</td>
                  <td class="text-right bold" style="color: #064e3b;">₹${o.totalAmount}</td>
                  <td>${o.paymentMethod || 'Razorpay'}</td>
                  <td><span class="tag-paid">${o.paymentStatus}</span></td>
                  <td><span class="tag-status">${o.orderStatus}</span></td>
                  <td>${o.trackingNumber ? `${o.courierPartner || 'Courier'}: ${o.trackingNumber}` : 'Standard Delivery'}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const filename = `NIRA-${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xls`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

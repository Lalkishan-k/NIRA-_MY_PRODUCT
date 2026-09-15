import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Save,
  RefreshCw,
  Eye,
  DollarSign,
  Truck,
  Printer,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Lock,
  KeyRound,
  ShieldAlert,
  Key,
  LogOut,
  XCircle,
  Info,
  Check,
  Download,
  FileSpreadsheet,
  Clock,
  Mail,
  History,
  Bell,
  MessageSquare,
  Inbox,
  MessageCircle,
  CheckCheck,
  Phone,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Product, Order, Coupon, StoreSettings, ProductSize, OrderStatus, SecurityAuditResponse, AdminActivityLog, CustomerInquiry } from '../types';
import { RazorpayModal } from '../components/RazorpayModal';
import { OrderStatusTrackingModal } from '../components/OrderStatusTrackingModal';
import { SuccessfulOrdersExportModal } from '../components/SuccessfulOrdersExportModal';
import { AbandonedCheckoutsHub } from '../components/AbandonedCheckoutsHub';
import { B2BBulkEnquiriesHub } from '../components/B2BBulkEnquiriesHub';
import { WhatsAppNotificationModal } from '../components/WhatsAppNotificationModal';
import { ThermalShippingLabelModal } from '../components/ThermalShippingLabelModal';
import {
  ReportTimeframe,
  filterOrdersByTimeframe,
  downloadSuccessfulOrdersExcel,
  downloadSuccessfulOrdersCsv,
  downloadItemizedSuccessfulOrdersCsv
} from '../utils/orderReports';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, customerProfile, setAdminAuthenticated } = useAuth();
  const { addToast, razorpayKeyId, isTestMode } = useStore();
  const navigate = useNavigate();

  // Admin Auth Gate State
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  const [adminPin, setAdminPin] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Security PIN & Password update state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinUpdateMsg, setPinUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master Store Password update state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passUpdateMsg, setPassUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Audit & Sessions state
  const [securityData, setSecurityData] = useState<SecurityAuditResponse | null>(null);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);

  // Demo Razorpay Modal state for admin testing
  const [showDemoRazorpayModal, setShowDemoRazorpayModal] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'customers' | 'inquiries' | 'coupons' | 'settings' | 'security' | 'activity' | 'abandoned' | 'bulk'
  >('overview');

  // WhatsApp Order Notification Modal State
  const [selectedWhatsAppOrder, setSelectedWhatsAppOrder] = useState<Order | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Thermal Shipping Label & Packing Slip State
  const [thermalOrders, setThermalOrders] = useState<Order[]>([]);
  const [isThermalModalOpen, setIsThermalModalOpen] = useState(false);
  const [selectedOrderIdsForThermal, setSelectedOrderIdsForThermal] = useState<string[]>([]);

  // Customer Inquiries State
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);

  // Notification Counter & Header Popover State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'orders' | 'inquiries'>('all');
  const [lastLoginTime, setLastLoginTime] = useState<string>(() => {
    return localStorage.getItem('nira_admin_last_login_time') || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  });
  const notificationRef = React.useRef<HTMLDivElement>(null);

  // Activity Log State
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Status Tracking & Automated Email Modal States
  const [statusTrackingOrder, setStatusTrackingOrder] = useState<Order | null>(null);
  const [statusTrackingTarget, setStatusTrackingTarget] = useState<OrderStatus | undefined>(undefined);
  const [isStatusTrackingModalOpen, setIsStatusTrackingModalOpen] = useState(false);

  const handleOpenStatusModal = (order: Order, preferredTarget?: OrderStatus) => {
    setStatusTrackingOrder(order);
    setStatusTrackingTarget(preferredTarget);
    setIsStatusTrackingModalOpen(true);
  };

  const handleStatusUpdateSuccess = (updatedOrder: Order, emailSent: boolean) => {
    addToast(
      `Order #${updatedOrder.orderId} updated to ${updatedOrder.orderStatus}${
        emailSent ? ` & automated customer email dispatched!` : '!'
      }`,
      'success'
    );
    loadAdminData();
    if (selectedOrderDetails && selectedOrderDetails.orderId === updatedOrder.orderId) {
      setSelectedOrderDetails(updatedOrder);
    }
  };

  // Master Orders & Export Hub States
  const [isMasterExportModalOpen, setIsMasterExportModalOpen] = useState(false);
  const [isSuccessfulOrdersModalOpen, setIsSuccessfulOrdersModalOpen] = useState(false);
  const [successfulOrdersInitialTimeframe, setSuccessfulOrdersInitialTimeframe] = useState<ReportTimeframe>('weekly');

  const handleOpenSuccessfulOrdersModal = (timeframe: ReportTimeframe = 'weekly') => {
    setSuccessfulOrdersInitialTimeframe(timeframe);
    setIsSuccessfulOrdersModalOpen(true);
  };

  const handleQuickDownloadSuccessful = (timeframe: ReportTimeframe) => {
    try {
      const stats = filterOrdersByTimeframe(orders, timeframe);
      if (stats.orders.length === 0) {
        addToast(`No successful orders found in the ${timeframe} period.`, 'info');
        return;
      }
      downloadSuccessfulOrdersExcel(stats.orders, `${timeframe}-successful-orders`, stats.label);
      addToast(
        `Successfully downloaded ${stats.orders.length} successful orders for ${stats.label} (₹${stats.totalRevenue.toLocaleString('en-IN')})!`,
        'success'
      );
    } catch (err: any) {
      addToast(err.message || 'Error exporting orders', 'error');
    }
  };

  const weeklyStats = useMemo(() => filterOrdersByTimeframe(orders, 'weekly'), [orders]);
  const monthlyStats = useMemo(() => filterOrdersByTimeframe(orders, 'monthly'), [orders]);
  const yearlyStats = useMemo(() => filterOrdersByTimeframe(orders, 'yearly'), [orders]);

  const [masterSelectedOrderIds, setMasterSelectedOrderIds] = useState<string[]>([]);
  const [statusFilterCheckboxes, setStatusFilterCheckboxes] = useState({
    Confirmed: true,
    Processing: true,
    Packed: true,
    Shipped: true,
    'Out for Delivery': true,
    Delivered: true,
    Cancelled: false,
    'Pending Payment': true
  });
  const [masterSearch, setMasterSearch] = useState('');

  const exportOrdersToCsv = (ordersToExport: Order[], filename = 'nira-customer-orders.csv') => {
    if (!ordersToExport || ordersToExport.length === 0) {
      addToast('No orders found to export', 'info');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Shipping Address', 'City', 'PinCode', 'Items', 'Total Amount (INR)', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = ordersToExport.map(o => [
      o.orderId,
      new Date(o.createdAt).toLocaleString('en-IN'),
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${(o.email || '').replace(/"/g, '""')}"`,
      `"${((o.shippingAddress?.house || '') + ' ' + (o.shippingAddress?.street || '')).replace(/"/g, '""')}"`,
      `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
      `"${(o.shippingAddress?.pinCode || '').replace(/"/g, '""')}"`,
      `"${o.items.map(i => `${i.name} (${i.size} x${i.quantity})`).join('; ')}"`.replace(/"/g, '""'),
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Successfully downloaded ${ordersToExport.length} orders as CSV!`, 'success');
  };

  const exportOrdersToExcel = (ordersToExport: Order[], filename = 'nira-orders-report.xls') => {
    if (!ordersToExport || ordersToExport.length === 0) {
      addToast('No orders found to export', 'info');
      return;
    }
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>NIRA Orders Excel Report</title>
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11pt; }
          th { background-color: #064e3b; color: #ffffff; border: 1px solid #047857; padding: 10px; text-align: left; font-weight: bold; }
          td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .title { font-size: 16pt; font-weight: bold; color: #064e3b; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="title">NIRA Pure Coconut Oil - Master Orders Management Ledger</div>
        <p>Exported On: ${new Date().toLocaleString('en-IN')} | Total Orders: ${ordersToExport.length}</p>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Street Address</th>
              <th>City</th>
              <th>PIN Code</th>
              <th>Items Ordered</th>
              <th>Total Amount (INR)</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToExport.map(o => `
              <tr>
                <td><b>${o.orderId}</b></td>
                <td>${new Date(o.createdAt).toLocaleString('en-IN')}</td>
                <td>${o.customerName || 'Guest'}</td>
                <td>${o.phone || 'N/A'}</td>
                <td>${o.email || 'N/A'}</td>
                <td>${((o.shippingAddress?.house || '') + ' ' + (o.shippingAddress?.street || '')).trim()}</td>
                <td>${o.shippingAddress?.city || 'Kerala'}</td>
                <td>${o.shippingAddress?.pinCode || ''}</td>
                <td>${o.items.map(i => `${i.name} (${i.size} x${i.quantity})`).join('; ')}</td>
                <td>${o.totalAmount}</td>
                <td>${o.paymentMethod}</td>
                <td>${o.paymentStatus}</td>
                <td><b>${o.orderStatus}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Successfully downloaded ${ordersToExport.length} orders as Excel (.xls)!`, 'success');
  };

  const exportOrdersToPdf = (ordersToExport: Order[], title = 'NIRA Order Management Report') => {
    if (!ordersToExport || ordersToExport.length === 0) {
      addToast('No orders found to generate PDF report', 'info');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to download PDF reports.', 'error');
      return;
    }
    const totalRevenue = ordersToExport.reduce((acc, o) => acc + o.totalAmount, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917; padding: 30px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: bold; color: #064e3b; }
          .meta { font-size: 11px; color: #57534e; text-align: right; line-height: 1.4; }
          .summary-card { background: #f4f5f6; border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; display: flex; gap: 25px; }
          .summary-item h4 { margin: 0 0 3px 0; font-size: 11px; color: #78716c; text-transform: uppercase; }
          .summary-item p { margin: 0; font-size: 16px; font-weight: bold; color: #064e3b; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
          th { background-color: #064e3b; color: white; padding: 8px 6px; text-align: left; font-weight: 600; }
          td { padding: 8px 6px; border-bottom: 1px solid #e7e5e4; vertical-align: top; }
          tr:nth-child(even) { background-color: #fafaf9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 10px; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🌴 NIRA PURE COCONUT OIL</div>
            <div style="font-size: 11px; color: #57534e; margin-top: 2px;">Official Business Orders Ledger & Sales Report</div>
          </div>
          <div class="meta">
            <b>Generated:</b> ${new Date().toLocaleString('en-IN')}<br/>
            <b>Total Records:</b> ${ordersToExport.length}
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-item">
            <h4>Total Orders</h4>
            <p>${ordersToExport.length}</p>
          </div>
          <div class="summary-item">
            <h4>Total Revenue</h4>
            <p>₹${totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div class="summary-item">
            <h4>Export Source</h4>
            <p>NIRA Admin Control Hub</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID & Date</th>
              <th>Customer & Phone</th>
              <th>Destination</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToExport.map(o => `
              <tr>
                <td>
                  <b>${o.orderId}</b><br/>
                  <span style="font-size: 8.5pt; color: #78716c;">${new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                </td>
                <td>
                  <b>${o.customerName || 'Guest'}</b><br/>
                  <span style="font-size: 8.5pt; color: #78716c;">${o.phone || 'N/A'}</span>
                </td>
                <td>
                  ${o.shippingAddress?.city || 'Kerala'}<br/>
                  <span style="font-size: 8.5pt; color: #78716c;">${o.shippingAddress?.pinCode || ''}</span>
                </td>
                <td style="font-size: 8.5pt;">
                  ${o.items.map(i => `${i.name} (${i.size} x${i.quantity})`).join(', ')}
                </td>
                <td><b>₹${o.totalAmount}</b></td>
                <td>
                  <span style="padding: 2px 6px; border-radius: 4px; font-size: 8.5pt; font-weight: bold; background: #ecfdf5; color: #065f46;">
                    ${o.orderStatus}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          NIRA Pure Coconut Oil &bull; Kozhikode, Kerala &bull; Business Management PDF Report
        </div>

        <div class="no-print" style="margin-top: 25px; text-align: center;">
          <button onclick="window.print();" style="background: #064e3b; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Save as PDF / Print Report
          </button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    addToast(`Generated professional PDF report for ${ordersToExport.length} orders!`, 'success');
  };

  const handleExportByStatus = (statusName: string) => {
    const matching = orders.filter(o => o.orderStatus === statusName);
    if (matching.length === 0) {
      addToast(`No orders found with status "${statusName}"`, 'info');
      return;
    }
    exportOrdersToCsv(matching, `nira-orders-${statusName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`);
  };

  const handleExportSeparatedByCheckedStatuses = () => {
    const activeStatuses = Object.entries(statusFilterCheckboxes)
      .filter(([_, isChecked]) => isChecked)
      .map(([status]) => status);

    if (activeStatuses.length === 0) {
      addToast('Please check at least one status category', 'error');
      return;
    }

    let count = 0;
    activeStatuses.forEach(st => {
      const matching = orders.filter(o => o.orderStatus === st);
      if (matching.length > 0) {
        exportOrdersToCsv(matching, `nira-orders-${st.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`);
        count += matching.length;
      }
    });

    if (count === 0) {
      addToast('No orders match the checked status categories', 'info');
    } else {
      addToast(`Successfully generated separate Excel exports for ${activeStatuses.length} status categories!`, 'success');
    }
  };

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(499);
  const [newCouponMax, setNewCouponMax] = useState(200);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Customer Inquiries Loading
  const loadInquiries = async () => {
    try {
      setIsLoadingInquiries(true);
      const inqData = await api.getAdminInquiries();
      setInquiries(inqData);
    } catch (err) {
      console.warn('Error loading customer inquiries:', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const [sData, pData, oData, cData, cpData, stData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getAdminCoupons(),
        api.getAdminSettings()
      ]);
      setStats(sData);
      setProducts(pData);
      setOrders(oData);
      setCustomers(cData);
      setCoupons(cpData);
      setStoreSettings(stData);
      // Asynchronously refresh activity logs & inquiries in parallel
      loadActivityLogs();
      loadInquiries();
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Handle Mark Inquiry / Order Read
  const handleMarkInquiryRead = async (id: string) => {
    try {
      await api.markInquiryRead(id);
      setInquiries(prev => prev.map(i => (i.id === id ? { ...i, isRead: true } : i)));
    } catch (err) {
      console.warn('Failed to mark inquiry read:', err);
    }
  };

  const handleMarkAllInquiriesRead = async () => {
    try {
      await api.markAllInquiriesRead();
      setInquiries(prev => prev.map(i => ({ ...i, isRead: true })));
      addToast('All customer inquiries marked as read', 'success');
    } catch (err) {
      console.warn('Failed to mark all inquiries read:', err);
    }
  };

  const handleMarkOrderRead = async (id: string) => {
    try {
      await api.markOrderRead(id);
      setOrders(prev => prev.map(o => (o.id === id || o.orderId === id ? { ...o, isRead: true } : o)));
    } catch (err) {
      console.warn('Failed to mark order read:', err);
    }
  };

  const handleMarkAllOrdersRead = async () => {
    try {
      await api.markAllOrdersRead();
      setOrders(prev => prev.map(o => ({ ...o, isRead: true })));
      addToast('All orders marked as read', 'success');
    } catch (err) {
      console.warn('Failed to mark all orders read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    await Promise.all([
      api.markAllInquiriesRead().catch(() => {}),
      api.markAllOrdersRead().catch(() => {})
    ]);
    setInquiries(prev => prev.map(i => ({ ...i, isRead: true })));
    setOrders(prev => prev.map(o => ({ ...o, isRead: true })));
    const nowIso = new Date().toISOString();
    setLastLoginTime(nowIso);
    localStorage.setItem('nira_admin_last_login_time', nowIso);
    addToast('All new orders & inquiries marked as read', 'success');
  };

  const handleOpenOrderFromNotification = (order: Order) => {
    handleMarkOrderRead(order.id || order.orderId);
    setSelectedOrderDetails(order);
    setIsNotificationsOpen(false);
  };

  const handleOpenInquiryDetails = (inquiry: CustomerInquiry) => {
    if (!inquiry.isRead) {
      handleMarkInquiryRead(inquiry.id);
    }
    setSelectedInquiry(inquiry);
    setIsNotificationsOpen(false);
  };

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      if (authMode === 'pin') {
        if (!adminPin.trim()) {
          setLoginError('Please enter the 6-digit Store Owner PIN');
          setIsLoggingIn(false);
          return;
        }
        await api.loginAdmin({ pin: adminPin.trim(), rememberDevice });
      } else {
        if (!adminEmail.trim() || !adminPassword) {
          setLoginError('Please enter admin email and password');
          setIsLoggingIn(false);
          return;
        }
        await api.loginAdmin({ email: adminEmail.trim(), password: adminPassword, rememberDevice });
      }

      // Record & track previous login reference
      const prevStored = localStorage.getItem('nira_admin_last_login_time');
      if (prevStored) {
        setLastLoginTime(prevStored);
      } else {
        const fallbackTime = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        setLastLoginTime(fallbackTime);
        localStorage.setItem('nira_admin_last_login_time', fallbackTime);
      }
      localStorage.setItem('nira_admin_current_session_start', new Date().toISOString());

      setAdminAuthenticated(true);
      addToast('Admin authenticated successfully. Welcome!', 'success');
      setAdminPin('');
      setAdminPassword('');
      loadAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await api.logoutAdmin();
    setAdminAuthenticated(false);
    addToast('Admin portal locked and signed out', 'info');
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPinInput || !newPinInput || !confirmPinInput) {
      setPinUpdateMsg({ type: 'error', text: 'All PIN fields are required' });
      return;
    }
    if (newPinInput.length !== 6 || !/^\d{6}$/.test(newPinInput)) {
      setPinUpdateMsg({ type: 'error', text: 'New PIN must be exactly 6 numeric digits' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinUpdateMsg({ type: 'error', text: 'New PIN and Confirmation PIN do not match' });
      return;
    }
    setIsUpdatingPin(true);
    setPinUpdateMsg(null);
    try {
      await api.changeAdminPin(currentPinInput, newPinInput);
      setPinUpdateMsg({ type: 'success', text: 'Admin security PIN updated successfully!' });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      addToast('Admin security PIN changed', 'success');
      loadSecurityAudit();
    } catch (err: any) {
      setPinUpdateMsg({ type: 'error', text: err.message || 'Failed to update PIN' });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassInput || !newPassInput || !confirmPassInput) {
      setPassUpdateMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (newPassInput.length < 8) {
      setPassUpdateMsg({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassUpdateMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    setIsUpdatingPass(true);
    setPassUpdateMsg(null);
    try {
      await api.changeAdminPassword(currentPassInput, newPassInput);
      setPassUpdateMsg({ type: 'success', text: 'Master password updated securely!' });
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      addToast('Master store password updated successfully', 'success');
      loadSecurityAudit();
    } catch (err: any) {
      setPassUpdateMsg({ type: 'error', text: err.message || 'Failed to update master password' });
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    if (!window.confirm('Terminate all other active admin sessions across devices? You will remain logged in on this browser.')) return;
    setIsRevokingSessions(true);
    try {
      const result = await api.revokeAllOtherAdminSessions();
      addToast(result.message || 'Other sessions revoked successfully', 'success');
      loadSecurityAudit();
    } catch (err: any) {
      addToast(err.message || 'Failed to revoke sessions', 'error');
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const loadSecurityAudit = async () => {
    setIsLoadingSecurity(true);
    try {
      const data = await api.getAdminSecurityAudit();
      setSecurityData(data);
    } catch (err: any) {
      console.warn('Failed to load security audit data:', err);
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const loadActivityLogs = async () => {
    setIsLoadingActivity(true);
    try {
      const logs = await api.getAdminActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      console.warn('Failed to load admin activity logs:', err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleClearActivityLogs = async () => {
    if (!window.confirm('Are you sure you want to clear the admin activity log history?')) return;
    try {
      await api.clearAdminActivityLogs();
      addToast('Activity logs cleared successfully', 'info');
      await loadActivityLogs();
    } catch (err: any) {
      addToast(err.message || 'Failed to clear activity logs', 'error');
    }
  };

  // Auto-lock admin portal on 20-minute idle inactivity
  useEffect(() => {
    if (!isAdmin) return;
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        handleAdminLogout();
        addToast('Admin portal locked automatically due to 20 minutes of inactivity for security.', 'info');
      }, 20 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
    };
  }, [isAdmin]);

  // Load tab-specific dynamic audit data
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'security') {
      loadSecurityAudit();
    } else if (activeTab === 'activity') {
      loadActivityLogs();
    }
  }, [isAdmin, activeTab]);

  // If user is not admin, show real secure authentication gate
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-stone-950 text-stone-100">
        <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white tracking-tight">NIRA Staff & Admin Portal</h2>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
              Restricted management portal for NIRA Pure Coconut Oil operations. Authenticate to manage inventory, orders, and pricing.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-2xl border border-stone-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setLoginError(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'pin' ? 'bg-amber-500 text-stone-950 font-bold shadow-md' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Owner PIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setLoginError(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password' ? 'bg-amber-500 text-stone-950 font-bold shadow-md' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Credentials</span>
            </button>
          </div>

          {/* Error notice */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{loginError}</div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authMode === 'pin' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-300">
                  Store Owner Security PIN (6 Digits)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="current-password"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] text-lg font-mono py-3 px-4 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>Authorized Staff & Store Owner Only</span>
                  <span className="text-stone-600">Encrypted 256-bit session</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Store Owner Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="Enter owner email"
                    required
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full text-xs py-2.5 px-3 rounded-xl bg-stone-950 border border-stone-800 text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Remember device checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={e => setRememberDevice(e.target.checked)}
                className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500/40"
              />
              <span className="text-xs text-stone-400">Remember this admin workstation (30 days)</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-stone-800/80 text-center">
            <Link
              to="/"
              className="text-xs text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>← Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const isEdit = Boolean(products.find(p => p.id === editingProduct.id));
      await api.saveAdminProduct(editingProduct, isEdit);
      addToast(isEdit ? 'Product updated successfully' : 'New product created', 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await api.deleteAdminProduct(id);
      addToast('Product deleted', 'info');
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Handle Quick Stock Adjust
  const handleQuickStock = async (productId: string, delta: number) => {
    try {
      await api.adjustStock(productId, delta);
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      await api.updateOrderStatus(orderId, orderStatus, paymentStatus);
      addToast(`Order ${orderId} updated to ${orderStatus}`, 'success');
      loadAdminData();
      if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
        const updated = await api.getOrder(orderId);
        setSelectedOrderDetails(updated);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update order', 'error');
    }
  };

  // Handle Coupon CRUD
  const handleOpenCreateCoupon = () => {
    setEditingCouponCode(null);
    setNewCouponCode('');
    setNewCouponType('percentage');
    setNewCouponValue(10);
    setNewCouponMin(499);
    setNewCouponMax(200);
    setNewCouponDesc('');
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: Coupon) => {
    setEditingCouponCode(c.code);
    setNewCouponCode(c.code);
    setNewCouponType(c.discountType);
    setNewCouponValue(c.discountValue);
    setNewCouponMin(c.minimumOrderAmount);
    setNewCouponMax(c.maximumDiscount || 200);
    setNewCouponDesc(c.description || '');
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      const payload = {
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: Number(newCouponValue),
        minimumOrderAmount: Number(newCouponMin),
        maximumDiscount: newCouponType === 'percentage' ? Number(newCouponMax) : undefined,
        description: newCouponDesc || `${newCouponValue}${newCouponType === 'percentage' ? '%' : '₹'} discount`,
      };

      if (editingCouponCode) {
        await api.updateAdminCoupon(editingCouponCode, payload);
        addToast(`Coupon ${newCouponCode} updated successfully!`, 'success');
      } else {
        await api.createAdminCoupon({
          ...payload,
          active: true
        });
        addToast(`Coupon ${newCouponCode} created successfully!`, 'success');
      }
      setIsCouponModalOpen(false);
      setEditingCouponCode(null);
      setNewCouponCode('');
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to save coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await api.deleteAdminCoupon(code);
      addToast(`Coupon ${code} deleted successfully`, 'success');
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSettings) return;
    setIsSavingSettings(true);
    try {
      await api.saveAdminSettings(storeSettings);
      addToast('Store settings updated!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered Orders list
  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'All' && o.orderStatus !== orderFilter) return false;
    if (paymentFilter !== 'All' && o.paymentStatus !== paymentFilter) return false;
    return true;
  });

  // Filtered Customer Inquiries list
  const filteredInquiries = inquiries.filter(i => {
    if (inquiryFilter === 'UNREAD' && i.isRead) return false;
    if (inquiryFilter === 'READ' && !i.isRead) return false;
    if (inquirySearch.trim()) {
      const q = inquirySearch.toLowerCase();
      const matchName = i.name.toLowerCase().includes(q);
      const matchEmail = i.email.toLowerCase().includes(q);
      const matchPhone = i.phone?.toLowerCase().includes(q);
      const matchSubject = i.subject?.toLowerCase().includes(q);
      const matchMessage = i.message.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchSubject && !matchMessage) return false;
    }
    return true;
  });

  // Notification calculations for unread items since last login
  const unreadOrders = orders.filter(
    o => o.isRead === false || (o.isRead === undefined && (o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing' || o.paymentStatus === 'Pending'))
  );
  const unreadInquiries = inquiries.filter(i => !i.isRead);
  const unreadOrdersCount = unreadOrders.length;
  const unreadInquiriesCount = unreadInquiries.length;
  const totalUnreadCount = unreadOrdersCount + unreadInquiriesCount;

  return (
    <div className="min-h-screen bg-stone-100/60 pb-16">
      {/* Admin Top Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-bold tracking-tight text-white flex items-center gap-2">
              🥥 NIRA <span className="text-amber-400 font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700">STORE ADMIN</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <span>Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-px bg-stone-700 hidden md:block" />

            {/* Notification Counter & Alerts Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                id="admin-notification-bell-btn"
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  totalUnreadCount > 0
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 hover:bg-amber-900/80 hover:border-amber-400 shadow-sm shadow-amber-950'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-750 hover:text-white'
                }`}
                title="Notifications: Unread orders & customer inquiries since last login"
              >
                <div className="relative">
                  <Bell className={`w-4 h-4 ${totalUnreadCount > 0 ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-stone-900 animate-ping" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="hidden sm:inline">Alerts</span>
                  {totalUnreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold bg-amber-400 text-stone-950 rounded-full leading-none shadow-xs">
                      {totalUnreadCount} New
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] text-stone-400 bg-stone-700/50 rounded-full leading-none">
                      0
                    </span>
                  )}
                </div>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-4 space-y-3.5 z-50 text-stone-200">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">New Activity Alerts</h4>
                        <p className="text-[10px] text-stone-400">
                          Since last login ({new Date(lastLoginTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })})
                        </p>
                      </div>
                    </div>
                    {totalUnreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Sub-Tab Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-stone-800 rounded-xl text-[11px] font-semibold">
                    <button
                      onClick={() => setNotificationTab('all')}
                      className={`flex-1 py-1 rounded-lg text-center transition-colors ${
                        notificationTab === 'all' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      All ({totalUnreadCount})
                    </button>
                    <button
                      onClick={() => setNotificationTab('orders')}
                      className={`flex-1 py-1 rounded-lg text-center transition-colors ${
                        notificationTab === 'orders' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Orders ({unreadOrdersCount})
                    </button>
                    <button
                      onClick={() => setNotificationTab('inquiries')}
                      className={`flex-1 py-1 rounded-lg text-center transition-colors ${
                        notificationTab === 'inquiries' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Inquiries ({unreadInquiriesCount})
                    </button>
                  </div>

                  {/* List Content */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {totalUnreadCount === 0 ? (
                      <div className="py-6 text-center text-stone-400 space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs font-semibold text-stone-300">You're all caught up!</p>
                        <p className="text-[10px] text-stone-500">No unread orders or customer inquiries pending.</p>
                      </div>
                    ) : (
                      <>
                        {/* Orders List */}
                        {(notificationTab === 'all' || notificationTab === 'orders') &&
                          unreadOrders.map(order => (
                            <div
                              key={order.id || order.orderId}
                              onClick={() => handleOpenOrderFromNotification(order)}
                              className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-800 border border-stone-700/60 hover:border-amber-500/50 cursor-pointer transition-all space-y-1 group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5 group-hover:text-amber-200">
                                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                                  Order #{order.orderId}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold font-mono">
                                  ₹{order.totalAmount}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-300 truncate">
                                {order.customerName} • {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'} ({order.orderStatus})
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                                <span>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-amber-400 group-hover:underline font-medium">View & mark read &rarr;</span>
                              </div>
                            </div>
                          ))}

                        {/* Customer Inquiries List */}
                        {(notificationTab === 'all' || notificationTab === 'inquiries') &&
                          unreadInquiries.map(inq => (
                            <div
                              key={inq.id}
                              onClick={() => handleOpenInquiryDetails(inq)}
                              className="p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-800 border border-stone-700/60 hover:border-blue-500/50 cursor-pointer transition-all space-y-1 group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5 group-hover:text-blue-200">
                                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                  {inq.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider">
                                  Inquiry
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-300 font-medium truncate">
                                {inq.subject || 'Customer Question'}
                              </p>
                              <p className="text-[10px] text-stone-400 line-clamp-1">
                                {inq.message}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                                <span>{new Date(inq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-blue-400 group-hover:underline font-medium">Read message &rarr;</span>
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      All Orders ({orders.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('inquiries');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      All Inquiries ({inquiries.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={loadAdminData}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Refresh store data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 transition-colors font-semibold"
              title="Lock portal and terminate session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto text-xs font-bold uppercase tracking-wider text-stone-400 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
            {
              id: 'orders',
              label: `Orders ${unreadOrdersCount > 0 ? `(${unreadOrdersCount} New)` : `(${orders.length})`}`,
              icon: ShoppingBag,
              highlight: unreadOrdersCount > 0
            },
            {
              id: 'inquiries',
              label: `Inquiries ${unreadInquiriesCount > 0 ? `(${unreadInquiriesCount} New)` : `(${inquiries.length})`}`,
              icon: MessageSquare,
              highlight: unreadInquiriesCount > 0
            },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'abandoned', label: 'Abandoned Carts', icon: RefreshCw },
            { id: 'bulk', label: 'B2B Wholesale', icon: Building2 },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'settings', label: 'Store Settings', icon: Settings },
            { id: 'activity', label: 'Activity Log', icon: History },
            { id: 'security', label: 'Security & Access', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors relative ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold'
                    : 'border-transparent hover:text-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${(tab as any).highlight ? 'text-amber-400' : ''}`} />
                <span>{tab.label}</span>
                {(tab as any).highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW METRICS                              */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Sales Revenue</span>
                <p className="font-serif text-3xl font-bold text-stone-900">
                  ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : 0}
                </p>
                <span className="text-[11px] text-emerald-800 font-medium block">
                  Verified payments via Razorpay & COD
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Orders</span>
                <p className="font-serif text-3xl font-bold text-stone-900">{orders.length}</p>
                <span className="text-[11px] text-stone-500 block">
                  {stats?.pendingOrders || 0} awaiting packaging & dispatch
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Active Customers</span>
                <p className="font-serif text-3xl font-bold text-stone-900">{stats?.totalCustomers || customers.length}</p>
                <span className="text-[11px] text-stone-500 block">Across 18 Indian states</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Stock Alert</span>
                <p className="font-serif text-3xl font-bold text-amber-600">
                  {products.filter(p => p.stock <= 25).length}
                </p>
                <span className="text-[11px] text-stone-500 block">Products below 25 units</span>
              </div>
            </div>

            {/* Quick Links & Recent Orders Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-stone-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.orderId} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-stone-900">{o.orderId}</span>
                        <p className="text-stone-500">{o.customerName} • {o.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900">₹{o.totalAmount}</span>
                        <span className="block text-[11px] text-emerald-800">{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Warning List */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Low Stock Products
                </h3>

                <div className="divide-y divide-stone-100">
                  {products
                    .filter(p => p.stock <= 30)
                    .map(p => (
                      <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[170px]">
                          <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                          <p className="text-stone-400">{p.size}</p>
                        </div>
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          {p.stock} units
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PRODUCTS MANAGEMENT                           */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Store Product Catalog</h2>
                <p className="text-xs text-stone-500">Manage descriptions, stock, pricing, and active status.</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    id: '',
                    name: '',
                    slug: '',
                    category: 'Pure Coconut Oil',
                    shortDescription: '',
                    description: '',
                    price: 250,
                    compareAtPrice: 300,
                    discount: 16,
                    stock: 50,
                    sku: `CP-NEW-${Date.now().toString().slice(-4)}`,
                    size: '500 ml',
                    unit: 'Bottle',
                    images: [products[0]?.images[0] || ''],
                    ingredients: ['100% Pure Kerala Coconut Oil'],
                    benefits: ['Natural MCTs', 'Cold Pressed', 'Sulphur-Free'],
                    usage: ['Cooking', 'Hair Care'],
                    storage: 'Store in dry place.',
                    featured: false,
                    active: true,
                    rating: 5.0,
                    reviewCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (₹)</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-50 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-stone-900">{p.name}</p>
                              <p className="text-stone-400 text-[11px] font-mono">{p.sku} • {p.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4 font-bold text-stone-900">
                          ₹{p.price}{' '}
                          {p.compareAtPrice && (
                            <span className="text-stone-400 line-through text-[11px] font-normal">
                              ₹{p.compareAtPrice}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                              p.stock <= 20
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              p.active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {p.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 rounded-lg hover:bg-stone-100"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: INVENTORY QUICK ADJUST                        */}
        {/* ==================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Real-Time Inventory Control</h2>
              <p className="text-xs text-stone-500">
                Quickly adjust stock units as batches are pressed and bottled in the Kozhikode mill.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-stone-900 truncate">{p.name}</h4>
                      <p className="text-xs text-stone-500">{p.size} • SKU: {p.sku}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-600 font-medium">Available Units:</span>
                    <span className="font-mono text-2xl font-bold text-stone-900">{p.stock}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickStock(p.id, -10)}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleQuickStock(p.id, -1)}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickStock(p.id, 1)}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickStock(p.id, 10)}
                      className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl"
                    >
                      +10
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ORDERS MANAGEMENT                             */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Orders</h2>
                <p className="text-xs text-stone-500">Track shipments, verify payments, and export successful sales ledgers.</p>
              </div>

              {/* Action Buttons: Successful Orders Download & Master Hub */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleOpenSuccessfulOrdersModal('weekly')}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all border border-emerald-700"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download Successful Orders</span>
                </button>

                <button
                  onClick={() => setIsMasterExportModalOpen(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all border border-stone-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>All Orders Hub ({orders.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Export Banner for Weekly, Monthly & Yearly Successful Orders */}
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 text-white p-4 sm:p-5 rounded-3xl border border-emerald-800/40 shadow-sm space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 tracking-wider uppercase">
                      Sales Reports
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                      Download Successful Order Details
                    </h3>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Export customer details, shipping address, phone, email, and bottle quantities (200ml, 500ml, 1L) for Weekly, Monthly, or Yearly timeframes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenSuccessfulOrdersModal('weekly')}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-stone-900" />
                  <span>Open Export Studio</span>
                </button>
              </div>

              {/* Quick Action Download Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* Weekly Card */}
                <div className="bg-stone-800/90 hover:bg-stone-800 p-3.5 rounded-2xl border border-stone-700/80 flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">Weekly (Past 7 Days)</span>
                      <span className="text-[11px] text-stone-300">
                        {weeklyStats.totalOrders} orders • ₹{weeklyStats.totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-md font-mono font-bold">
                      {weeklyStats.totalUnitsSold} units
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-700/60">
                    <button
                      type="button"
                      onClick={() => handleQuickDownloadSuccessful('weekly')}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          downloadSuccessfulOrdersCsv(weeklyStats.orders, 'weekly-successful-orders');
                          addToast(`Downloaded ${weeklyStats.orders.length} weekly orders as CSV!`, 'success');
                        } catch (err: any) {
                          addToast(err.message, 'error');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-[11px] font-semibold transition-all"
                      title="Download as CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Monthly Card */}
                <div className="bg-stone-800/90 hover:bg-stone-800 p-3.5 rounded-2xl border border-stone-700/80 flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">Monthly (Past 30 Days)</span>
                      <span className="text-[11px] text-stone-300">
                        {monthlyStats.totalOrders} orders • ₹{monthlyStats.totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-md font-mono font-bold">
                      {monthlyStats.totalUnitsSold} units
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-700/60">
                    <button
                      type="button"
                      onClick={() => handleQuickDownloadSuccessful('monthly')}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          downloadSuccessfulOrdersCsv(monthlyStats.orders, 'monthly-successful-orders');
                          addToast(`Downloaded ${monthlyStats.orders.length} monthly orders as CSV!`, 'success');
                        } catch (err: any) {
                          addToast(err.message, 'error');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-[11px] font-semibold transition-all"
                      title="Download as CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* Yearly Card */}
                <div className="bg-stone-800/90 hover:bg-stone-800 p-3.5 rounded-2xl border border-stone-700/80 flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">Yearly (Past 365 Days)</span>
                      <span className="text-[11px] text-stone-300">
                        {yearlyStats.totalOrders} orders • ₹{yearlyStats.totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded-md font-mono font-bold">
                      {yearlyStats.totalUnitsSold} units
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-700/60">
                    <button
                      type="button"
                      onClick={() => handleQuickDownloadSuccessful('yearly')}
                      className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          downloadSuccessfulOrdersCsv(yearlyStats.orders, 'yearly-successful-orders');
                          addToast(`Downloaded ${yearlyStats.orders.length} yearly orders as CSV!`, 'success');
                        } catch (err: any) {
                          addToast(err.message, 'error');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-[11px] font-semibold transition-all"
                      title="Download as CSV"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-4 rounded-2xl border border-stone-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Status:</span>
                  <select
                    value={orderFilter}
                    onChange={e => setOrderFilter(e.target.value)}
                    className="font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Payment">Pending Payment</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500">Payment:</span>
                  <select
                    value={paymentFilter}
                    onChange={e => setPaymentFilter(e.target.value)}
                    className="font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (filteredOrders.length === 0) return;
                    setThermalOrders(filteredOrders);
                    setIsThermalModalOpen(true);
                  }}
                  disabled={filteredOrders.length === 0}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
                  title="Print thermal shipping labels for all filtered orders in batch"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Batch Thermal Labels ({filteredOrders.length})</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4 whitespace-nowrap">Order ID & Date</th>
                      <th className="p-4 whitespace-nowrap">Customer & City</th>
                      <th className="p-4 min-w-[280px]">Items Ordered</th>
                      <th className="p-4 whitespace-nowrap">Amount</th>
                      <th className="p-4 whitespace-nowrap">Payment</th>
                      <th className="p-4 whitespace-nowrap">Order Status</th>
                      <th className="p-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400">
                          No orders match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o.orderId} className="hover:bg-stone-50/50">
                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-stone-900">{o.orderId}</span>
                            <span className="block text-[11px] text-stone-400 mt-0.5">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <p className="font-bold text-stone-900">{o.customerName}</p>
                            <p className="text-stone-400 text-[11px]">{o.shippingAddress?.city || 'Kerala'}, {o.shippingAddress?.pinCode}</p>
                          </td>
                          <td className="p-4 align-top min-w-[280px]">
                            <div className="space-y-2">
                              {/* Total summary pill */}
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                                  <Package className="w-3 h-3 text-stone-500" />
                                  {o.items.reduce((sum, item) => sum + (item.quantity || 1), 0)} {o.items.reduce((sum, item) => sum + (item.quantity || 1), 0) === 1 ? 'unit' : 'units'}
                                </span>
                                {o.items.length > 1 && (
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    ({o.items.length} distinct products)
                                  </span>
                                )}
                              </div>

                              {/* Visible items detail cards */}
                              <div className="space-y-1.5">
                                {o.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50/90 border border-stone-200/90 hover:bg-stone-100/70 transition-colors"
                                  >
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 bg-white shrink-0 shadow-xs"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                                        <Package className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-stone-900 text-xs leading-snug break-words">
                                        {item.name}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        {item.size && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                            {item.size}
                                          </span>
                                        )}
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                                          Qty: {item.quantity}
                                        </span>
                                        <span className="text-[11px] font-bold text-stone-900 ml-auto">
                                          ₹{item.totalPrice || item.unitPrice * item.quantity}
                                        </span>
                                      </div>
                                      {item.quantity > 1 && (
                                        <p className="text-[10px] text-stone-400 mt-0.5 text-right">
                                          (₹{item.unitPrice} each)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-top font-bold text-stone-900">₹{o.totalAmount}</td>
                          <td className="p-4 align-top whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {o.paymentStatus}
                            </span>
                            <span className="block text-[10px] text-stone-400 mt-0.5">{o.paymentMethod}</span>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-1.5 min-w-[170px]">
                              {/* Current status selector / badge */}
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={o.orderStatus}
                                  onChange={e => handleOpenStatusModal(o, e.target.value as OrderStatus)}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer text-stone-800"
                                >
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>

                              {/* Quick Action Progression Buttons */}
                              <div className="flex flex-wrap gap-1">
                                {o.orderStatus === 'Processing' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenStatusModal(o, 'Shipped')}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                                      title="Update to Shipped & trigger dispatch email"
                                    >
                                      <Truck className="w-3 h-3" />
                                      Ship Order
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenStatusModal(o, 'Delivered')}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                                      title="Mark Delivered & send confirmation email"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Deliver
                                    </button>
                                  </>
                                )}
                                {o.orderStatus === 'Confirmed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStatusModal(o, 'Processing')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-colors"
                                  >
                                    <Clock className="w-3 h-3" />
                                    Process
                                  </button>
                                )}
                                {o.orderStatus === 'Shipped' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenStatusModal(o, 'Delivered')}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                                    title="Mark Delivered & trigger delivery email"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Mark Delivered
                                  </button>
                                )}
                              </div>

                              {/* Courier details tag if available */}
                              {(o.courierPartner || o.trackingNumber) && (
                                <div className="text-[10px] bg-stone-50 p-1.5 rounded-md border border-stone-200 text-stone-600 leading-tight">
                                  <span className="font-semibold text-stone-800 block truncate">
                                    {o.courierPartner || 'Express Courier'}
                                  </span>
                                  {o.trackingNumber && (
                                    <span className="font-mono text-stone-600 block mt-0.5">
                                      AWB: <strong className="text-stone-900">{o.trackingNumber}</strong>
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Automated email log tag */}
                              {o.statusNotifications && o.statusNotifications.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 w-fit">
                                  <Mail className="w-3 h-3 text-emerald-700" />
                                  <span>Email sent ({o.statusNotifications.length})</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top text-right space-y-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="w-full px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg text-xs transition-colors block text-center"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleOpenStatusModal(o)}
                              className="inline-flex items-center justify-center gap-1 w-full px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors"
                              title="Update status, tracking courier details & send email"
                            >
                              <Truck className="w-3 h-3" />
                              Track & Email
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setThermalOrders([o]);
                                setIsThermalModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center gap-1 w-full px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors"
                              title="Print 4x6 thermal shipping label & packing slip"
                            >
                              <Printer className="w-3 h-3" />
                              Thermal Label
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWhatsAppOrder(o);
                                setIsWhatsAppModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center gap-1 w-full px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors"
                              title="Send automated WhatsApp order status alert"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WhatsApp Alert
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: CUSTOMER DIRECTORY                            */}
        {/* ==================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Directory</h2>
              <p className="text-xs text-stone-500">Registered customers and recurring buyers across India.</p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Orders Placed</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {customers.map((c, i) => (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-900">{c.name}</td>
                      <td className="p-4">
                        <p>{c.email}</p>
                        <p className="text-stone-400 text-[11px]">{c.phone}</p>
                      </td>
                      <td className="p-4">{c.city}, {c.state}</td>
                      <td className="p-4 font-semibold">{c.ordersCount} orders</td>
                      <td className="p-4 font-bold text-stone-900">₹{c.totalSpent}</td>
                      <td className="p-4 text-stone-500 text-[11px]">
                        {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: COUPONS & DISCOUNTS                           */}
        {/* ==================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Promotions & Coupons</h2>
                <p className="text-xs text-stone-500">Create, edit, remove, and manage promotional discount codes.</p>
              </div>

              <button
                onClick={handleOpenCreateCoupon}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map(c => (
                <div key={c.code} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold text-emerald-950 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        {c.code}
                      </span>
                      <button
                        onClick={async () => {
                          await api.toggleAdminCoupon(c.code, !c.active);
                          loadAdminData();
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                          c.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {c.active ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">{c.description}</p>

                    <div className="divide-y divide-stone-100 text-[11px] text-stone-500 pt-2">
                      <div className="py-1.5 flex justify-between">
                        <span>Discount:</span>
                        <span className="font-bold text-stone-900">
                          {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span>Min Order:</span>
                        <span className="font-semibold text-stone-900">₹{c.minimumOrderAmount}</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span>Redeemed:</span>
                        <span className="font-semibold text-stone-900">{c.usedCount} times</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit & Remove Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenEditCoupon(c)}
                      className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: STORE SETTINGS                                */}
        {/* ==================================================== */}
        {activeTab === 'settings' && storeSettings && (
          <div className="space-y-8 max-w-3xl">
            <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Store Configuration & Delivery Rules</h2>
              <p className="text-xs text-stone-500">Update shipping threshold, contact details, and announcement banner.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={storeSettings.brandName}
                  onChange={e => setStoreSettings({ ...storeSettings, brandName: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={storeSettings.tagline}
                  onChange={e => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={storeSettings.freeShippingThreshold}
                  onChange={e => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Standard Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={storeSettings.shippingCharge}
                  onChange={e => setStoreSettings({ ...storeSettings, shippingCharge: Number(e.target.value) })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Top Announcement Banner Text</label>
              <input
                type="text"
                value={storeSettings.announcementText}
                onChange={e => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={storeSettings.supportPhone}
                  onChange={e => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Secondary / WhatsApp Phone</label>
                <input
                  type="text"
                  value={storeSettings.whatsappNumber}
                  onChange={e => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value, secondaryPhone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
                  placeholder="+919562513642"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={storeSettings.supportEmail}
                  onChange={e => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">FSSAI Central Lic #</label>
                <input
                  type="text"
                  value={storeSettings.fssaiNumber}
                  onChange={e => setStoreSettings({ ...storeSettings, fssaiNumber: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Saving Settings...' : 'Save All Settings'}</span>
            </button>
          </form>

          {/* Master Store Security & PIN Management Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <span>Admin Security & Master PIN</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Change the 6-digit PIN used to unlock this operations portal. Protects against unauthorized real-world visitors.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 self-start px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Protected Credentials</span>
              </span>
            </div>

            {pinUpdateMsg && (
              <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                pinUpdateMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {pinUpdateMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{pinUpdateMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Current PIN *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={currentPinInput}
                  onChange={e => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">New 6-Digit PIN *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm New PIN *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUpdatingPin ? 'Updating PIN...' : 'Save New Security PIN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Razorpay Payment Gateway Status & Testing Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0c2340] text-white flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Razorpay Payment Gateway Setup
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Online payments via UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Wallets.
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start ${
                !isTestMode
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <ShieldCheck className={`w-3.5 h-3.5 ${!isTestMode ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{!isTestMode ? 'Live Credentials Connected' : 'Interactive Sandbox Active'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Configured Key ID
                </div>
                <div className="font-mono text-xs font-semibold text-stone-900 break-all">
                  {razorpayKeyId || 'rzp_test_SANDBOX_READY'}
                </div>
                <p className="text-[11px] text-stone-500">
                  Passed to client for initiating payment orders securely.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Signature Verification (HMAC-SHA256)
                </div>
                <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Server-Side Endpoint Active: /api/payment/verify</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Cryptographically validates authentic Razorpay order IDs and transaction tokens.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>How to connect your Live or Test Razorpay Account:</span>
              </div>
              <ol className="text-xs text-stone-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Log in to your <b>Razorpay Dashboard</b> at <a href="https://dashboard.razorpay.com/#/access/api-keys" target="_blank" rel="noreferrer" className="text-emerald-800 underline font-semibold inline-flex items-center gap-0.5">dashboard.razorpay.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Go to <b>Account & Settings</b> &rarr; <b>API Keys</b> &rarr; Click <b>Generate Key</b>.</li>
                <li>Set your <b>Key Id</b> as <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono">RAZORPAY_KEY_ID</code> and <b>Key Secret</b> as <code className="bg-white px-1.5 py-0.5 rounded border text-[11px] font-mono">RAZORPAY_KEY_SECRET</code> in the project environment variables.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-stone-500">
                You can test the checkout payment window right now:
              </p>
              <button
                type="button"
                onClick={() => setShowDemoRazorpayModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open Test Payment Window</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: HARDENED SECURITY & ZERO-TRUST ACCESS         */}
      {/* ==================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Security Posture Top Banner */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Zero-Trust Security Perimeter Active</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Admin Access Control & Protection Engine
                </h3>
                <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                  Your store's administrative gateway is isolated and protected against credential brute-forcing, timing attacks, and unauthorized access attempts.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadSecurityAudit}
                  disabled={isLoadingSecurity}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-stone-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSecurity ? 'animate-spin' : ''}`} />
                  <span>Refresh Audit Trail</span>
                </button>
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  disabled={isRevokingSessions}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isRevokingSessions ? 'Revoking...' : 'Terminate Other Sessions'}</span>
                </button>
              </div>
            </div>

            {/* Defense Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-800 text-xs">
              <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Active Admin Sessions</span>
                <span className="font-serif text-xl font-bold text-amber-400">
                  {securityData ? securityData.activeSessionsCount : 1}
                </span>
                <span className="text-[10px] text-stone-500 block">Cryptographic Bearer Tokens</span>
              </div>
              <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Brute-Force Firewall</span>
                <span className="font-serif text-xl font-bold text-emerald-400">Locked at 5</span>
                <span className="text-[10px] text-stone-500 block">15-minute IP lockdown</span>
              </div>
              <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Side-Channel Defense</span>
                <span className="font-serif text-xl font-bold text-blue-400">Constant-Time</span>
                <span className="text-[10px] text-stone-500 block">SHA-256 timingSafeEqual</span>
              </div>
              <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Inactivity Auto-Lock</span>
                <span className="font-serif text-xl font-bold text-purple-400">20 Minutes</span>
                <span className="text-[10px] text-stone-500 block">Automatic session wipe</span>
              </div>
            </div>
          </div>

          {/* Credentials Management: PIN and Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Update Master Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">Change Store Master Password</h4>
                  <p className="text-xs text-stone-500">
                    Primary password for email login (Owner: <code className="font-mono text-stone-700">lalkishankkichu@gmail.com</code>).
                  </p>
                </div>
              </div>

              {passUpdateMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passUpdateMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passUpdateMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{passUpdateMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassInput}
                    onChange={e => setCurrentPassInput(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">New Password (Min 8 Chars) *</label>
                    <input
                      type="password"
                      value={newPassInput}
                      onChange={e => setNewPassInput(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      value={confirmPassInput}
                      onChange={e => setConfirmPassInput(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPass}
                  className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingPass ? 'Updating Password...' : 'Save New Master Password'}</span>
                </button>
              </form>
            </div>

            {/* Update Master 6-Digit PIN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">Change 6-Digit Security PIN</h4>
                  <p className="text-xs text-stone-500">
                    Quick-access PIN used on authenticated manager workstations and mobile tablets.
                  </p>
                </div>
              </div>

              {pinUpdateMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pinUpdateMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {pinUpdateMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{pinUpdateMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Current PIN *</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">New 6-Digit PIN *</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={newPinInput}
                      onChange={e => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm PIN *</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPinInput}
                      onChange={e => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 font-mono tracking-widest bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUpdatingPin ? 'Updating PIN...' : 'Save New Security PIN'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Security Audit Trail Ledger */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Real-Time Security Audit Trail</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Immutable in-memory access log tracking logins, brute-force alarms, password changes, and IP locks.
                </p>
              </div>
              <span className="text-[11px] text-stone-500">
                Log entries: {securityData?.auditLogs?.length || 0}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Client IP & Gateway</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {securityData?.auditLogs && securityData.auditLogs.length > 0 ? (
                    securityData.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="p-3 font-semibold text-stone-900">
                          {log.event.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 font-mono text-[10px] text-stone-700">
                            {log.method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'DENIED'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-600">
                          {log.ip}
                        </td>
                        <td className="p-3 text-stone-600 text-xs">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                        No security alerts or audit entries recorded yet. System is active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: OPERATIONAL ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold shadow-xs">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    Staff Activity Log & Operations History
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {activityLogs.length} events
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time chronological ledger of administrative operations: tracking order fulfillment transitions, inventory restocks, catalog pricing modifications, and promotional codes.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={loadActivityLogs}
                disabled={isLoadingActivity}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-stone-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActivity ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
              <button
                type="button"
                onClick={handleClearActivityLogs}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
                title="Clear operational activity log ledger"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Logged Actions
              </span>
              <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {activityLogs.length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Active administrative ledger</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Order Status Updates
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-900 mt-1">
                {activityLogs.filter(l => l.actionType === 'ORDER_STATUS_CHANGED').length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Fulfillments & dispatches</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Inventory Adjustments
              </span>
              <p className="text-2xl font-serif font-bold text-amber-900 mt-1">
                {activityLogs.filter(l => l.actionType === 'INVENTORY_UPDATED').length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Stock level calibrations</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Catalog & Coupons
              </span>
              <p className="text-2xl font-serif font-bold text-blue-900 mt-1">
                {activityLogs.filter(l => ['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'COUPON_CREATED', 'COUPON_UPDATED', 'COUPON_DELETED'].includes(l.actionType)).length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Products & promos edited</span>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All Activities' },
                  { id: 'ORDERS', label: 'Orders & Shipping' },
                  { id: 'INVENTORY', label: 'Inventory & Stock' },
                  { id: 'PRODUCTS', label: 'Products Catalog' },
                  { id: 'COUPONS', label: 'Discount Coupons' },
                  { id: 'SETTINGS', label: 'Settings & Security' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActivityFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activityFilter === chip.id
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px] sm:w-72">
                <input
                  type="text"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  placeholder="Search order ID, product, notes..."
                  className="w-full text-xs py-2 px-3 pl-8 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {activitySearch && (
                  <button
                    onClick={() => setActivitySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Logs Table / Feed */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Activity Audit Ledger</span>
                  <span className="text-xs font-sans font-normal text-stone-500">
                    (Showing {activityLogs.filter(log => {
                      if (activityFilter === 'ORDERS' && !['ORDER_STATUS_CHANGED', 'EMAIL_SENT'].includes(log.actionType)) return false;
                      if (activityFilter === 'INVENTORY' && log.actionType !== 'INVENTORY_UPDATED') return false;
                      if (activityFilter === 'PRODUCTS' && !['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'].includes(log.actionType)) return false;
                      if (activityFilter === 'COUPONS' && !['COUPON_CREATED', 'COUPON_UPDATED', 'COUPON_DELETED'].includes(log.actionType)) return false;
                      if (activityFilter === 'SETTINGS' && !['SETTINGS_UPDATED', 'PIN_CHANGED', 'PASSWORD_CHANGED'].includes(log.actionType)) return false;
                      if (activitySearch.trim()) {
                        const q = activitySearch.toLowerCase().trim();
                        return (
                          (log.target || '').toLowerCase().includes(q) ||
                          (log.description || '').toLowerCase().includes(q) ||
                          (log.adminName || '').toLowerCase().includes(q) ||
                          (log.actionType || '').toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).length} matching entries)
                  </span>
                </h3>
              </div>

              <div className="text-xs text-stone-400 font-mono">
                Auto-synced with store operations
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 sm:p-4">Timestamp</th>
                    <th className="p-3.5 sm:p-4">Action Type</th>
                    <th className="p-3.5 sm:p-4">Target / Entity</th>
                    <th className="p-3.5 sm:p-4 min-w-[280px]">Operational Details</th>
                    <th className="p-3.5 sm:p-4">Admin Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {activityLogs
                    .filter(log => {
                      if (activityFilter === 'ORDERS' && !['ORDER_STATUS_CHANGED', 'EMAIL_SENT'].includes(log.actionType)) return false;
                      if (activityFilter === 'INVENTORY' && log.actionType !== 'INVENTORY_UPDATED') return false;
                      if (activityFilter === 'PRODUCTS' && !['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'].includes(log.actionType)) return false;
                      if (activityFilter === 'COUPONS' && !['COUPON_CREATED', 'COUPON_UPDATED', 'COUPON_DELETED'].includes(log.actionType)) return false;
                      if (activityFilter === 'SETTINGS' && !['SETTINGS_UPDATED', 'PIN_CHANGED', 'PASSWORD_CHANGED'].includes(log.actionType)) return false;
                      if (activitySearch.trim()) {
                        const q = activitySearch.toLowerCase().trim();
                        return (
                          (log.target || '').toLowerCase().includes(q) ||
                          (log.description || '').toLowerCase().includes(q) ||
                          (log.adminName || '').toLowerCase().includes(q) ||
                          (log.actionType || '').toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(log => {
                      // Style configuration per action type
                      const getStyle = (type: string) => {
                        switch (type) {
                          case 'ORDER_STATUS_CHANGED':
                            return {
                              badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                              iconBg: 'bg-emerald-100 text-emerald-800',
                              label: 'Order Status',
                              Icon: Truck
                            };
                          case 'INVENTORY_UPDATED':
                            return {
                              badge: 'bg-amber-50 text-amber-900 border-amber-200',
                              iconBg: 'bg-amber-100 text-amber-900',
                              label: 'Inventory',
                              Icon: Boxes
                            };
                          case 'PRODUCT_CREATED':
                            return {
                              badge: 'bg-blue-50 text-blue-800 border-blue-200',
                              iconBg: 'bg-blue-100 text-blue-800',
                              label: 'Product Added',
                              Icon: Plus
                            };
                          case 'PRODUCT_UPDATED':
                            return {
                              badge: 'bg-sky-50 text-sky-800 border-sky-200',
                              iconBg: 'bg-sky-100 text-sky-800',
                              label: 'Product Edited',
                              Icon: Edit2
                            };
                          case 'PRODUCT_DELETED':
                            return {
                              badge: 'bg-rose-50 text-rose-800 border-rose-200',
                              iconBg: 'bg-rose-100 text-rose-800',
                              label: 'Product Deleted',
                              Icon: Trash2
                            };
                          case 'COUPON_CREATED':
                          case 'COUPON_UPDATED':
                          case 'COUPON_DELETED':
                            return {
                              badge: 'bg-purple-50 text-purple-800 border-purple-200',
                              iconBg: 'bg-purple-100 text-purple-800',
                              label: 'Coupon Promo',
                              Icon: Tag
                            };
                          case 'EMAIL_SENT':
                            return {
                              badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                              iconBg: 'bg-indigo-100 text-indigo-800',
                              label: 'Email Dispatched',
                              Icon: Mail
                            };
                          case 'PIN_CHANGED':
                          case 'PASSWORD_CHANGED':
                            return {
                              badge: 'bg-rose-50 text-rose-800 border-rose-200',
                              iconBg: 'bg-rose-100 text-rose-800',
                              label: 'Security Auth',
                              Icon: KeyRound
                            };
                          case 'SETTINGS_UPDATED':
                          default:
                            return {
                              badge: 'bg-stone-100 text-stone-800 border-stone-200',
                              iconBg: 'bg-stone-200 text-stone-800',
                              label: 'Store Config',
                              Icon: Settings
                            };
                        }
                      };

                      const style = getStyle(log.actionType);
                      const ActionIcon = style.Icon;

                      return (
                        <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3.5 sm:p-4 text-stone-500 whitespace-nowrap align-top font-mono text-[11px]">
                            <div>{new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="text-stone-400 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
                                <ActionIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${style.badge}`}>
                                {style.label}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 align-top">
                            <span className="font-bold text-stone-900 block leading-snug">
                              {log.target}
                            </span>
                          </td>

                          <td className="p-3.5 sm:p-4 align-top text-stone-600 text-xs leading-relaxed">
                            <div className="max-w-xl">
                              <p>{log.description}</p>
                              {log.details && (
                                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-stone-500">
                                  {log.details.courierPartner && (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">
                                      Courier: <strong>{log.details.courierPartner}</strong>
                                    </span>
                                  )}
                                  {log.details.trackingNumber && (
                                    <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 font-mono">
                                      AWB: <strong>{log.details.trackingNumber}</strong>
                                    </span>
                                  )}
                                  {log.details.newStatus && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                                      New Status: <strong>{log.details.newStatus}</strong>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-900 border border-amber-300/60 font-bold text-[10px] flex items-center justify-center">
                                {log.adminName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-stone-900 block text-xs leading-tight">
                                  {log.adminName}
                                </span>
                                <span className="text-stone-400 text-[10px] block leading-tight">
                                  {log.adminEmail}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {activityLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-stone-400 space-y-2">
                        <History className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                        <p className="font-medium text-stone-600">No activity recorded yet in this session.</p>
                        <p className="text-xs text-stone-400">
                          Admin operations such as updating order status, changing inventory, or modifying products will automatically be logged here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB: CUSTOMER INQUIRIES & MESSAGES HUB              */}
      {/* ==================================================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    Customer Inquiries & Contact Messages
                    {unreadInquiriesCount > 0 ? (
                      <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        {unreadInquiriesCount} New Unread
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
                        {inquiries.length} Total
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Messages, bulk order requests, purity queries, and feedback submitted by customers via the storefront contact portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={loadInquiries}
                disabled={isLoadingInquiries}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors border border-stone-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {unreadInquiriesCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllInquiriesRead}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Inquiries
              </span>
              <p className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {inquiries.length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Customer messages recorded</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Unread Messages
              </span>
              <p className="text-2xl font-serif font-bold text-amber-900 mt-1">
                {unreadInquiriesCount}
              </p>
              <span className="text-[11px] text-amber-600 mt-1 block">Pending administrator review</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Processed & Read
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-900 mt-1">
                {inquiries.filter(i => i.isRead).length}
              </p>
              <span className="text-[11px] text-stone-400 mt-1 block">Resolved inquiries</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Quick Response
              </span>
              <p className="text-xs font-bold text-blue-900 mt-2 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                1-Click Email & WhatsApp
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">Direct customer outreach</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                Filter:
              </span>
              {(['ALL', 'UNREAD', 'READ'] as const).map(filterKey => {
                const count =
                  filterKey === 'ALL'
                    ? inquiries.length
                    : filterKey === 'UNREAD'
                    ? unreadInquiriesCount
                    : inquiries.filter(i => i.isRead).length;
                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setInquiryFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      inquiryFilter === filterKey
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {filterKey === 'ALL' ? 'All' : filterKey === 'UNREAD' ? 'Unread' : 'Read'} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sender, email, subject..."
                value={inquirySearch}
                onChange={e => setInquirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>
          </div>

          {/* Inquiries List Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 sm:p-4">Status & Received</th>
                    <th className="p-3.5 sm:p-4">Customer Details</th>
                    <th className="p-3.5 sm:p-4">Subject & Message</th>
                    <th className="p-3.5 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInquiries.map(inq => (
                    <tr
                      key={inq.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        !inq.isRead ? 'bg-amber-50/30 font-medium' : ''
                      }`}
                    >
                      {/* Status & Timestamp */}
                      <td className="p-3.5 sm:p-4 align-top whitespace-nowrap">
                        <div className="space-y-1.5">
                          {!inq.isRead ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              NEW UNREAD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Read
                            </span>
                          )}
                          <div className="text-[11px] text-stone-500 font-mono">
                            {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {new Date(inq.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3.5 sm:p-4 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                              {inq.name.charAt(0)}
                            </div>
                            {inq.name}
                          </div>
                          <div className="text-stone-600 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <a
                              href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Inquiry regarding NIRA Coconut Oil')}`}
                              className="hover:text-emerald-800 hover:underline"
                            >
                              {inq.email}
                            </a>
                          </div>
                          {inq.phone && (
                            <div className="text-stone-500 text-[11px] flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <a
                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-emerald-800 hover:underline"
                              >
                                {inq.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subject & Message Preview */}
                      <td className="p-3.5 sm:p-4 align-top">
                        <div className="max-w-xl space-y-1">
                          <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                            {inq.subject || 'Store Inquiry'}
                          </div>
                          <p className="text-stone-600 text-xs leading-relaxed line-clamp-2">
                            {inq.message}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 sm:p-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenInquiryDetails(inq)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="View complete inquiry message"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <a
                            href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || 'Inquiry regarding NIRA Coconut Oil')}&body=${encodeURIComponent(`\n\n--- On ${new Date(inq.createdAt).toLocaleString('en-IN')}, ${inq.name} wrote:\n> ${inq.message}`)}`}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                            title="Reply by Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>

                          {inq.phone && (
                            <a
                              href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${inq.name}, regarding your inquiry with NIRA Pure Coconut Oil...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleMarkInquiryRead(inq.id)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              inq.isRead
                                ? 'bg-stone-50 text-stone-400 hover:text-stone-700'
                                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                            title={inq.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-stone-400 space-y-2">
                        <Inbox className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                        <p className="font-medium text-stone-600">No customer inquiries found.</p>
                        <p className="text-xs text-stone-400">
                          {inquirySearch
                            ? `No messages matched the search term "${inquirySearch}".`
                            : 'All incoming customer messages will appear here.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ==================================================== */}
      {/* TAB: ABANDONED CHECKOUTS & RECOVERY HUB            */}
      {/* ==================================================== */}
      {activeTab === 'abandoned' && <AbandonedCheckoutsHub />}

      {/* ==================================================== */}
      {/* TAB: B2B BULK & WHOLESALE QUOTATION HUB            */}
      {/* ==================================================== */}
      {activeTab === 'bulk' && <B2BBulkEnquiriesHub />}
      </main>

      {/* MODAL: PRODUCT CREATE / EDIT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {editingProduct.id ? `Edit ${editingProduct.name}` : 'Create New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="Pure Coconut Oil">Pure Coconut Oil</option>
                    <option value="Extra Virgin Coconut Oil">Extra Virgin Coconut Oil</option>
                    <option value="Family Packs">Family Packs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={editingProduct.size}
                    onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value as ProductSize })}
                    required
                    placeholder="e.g. 500 ml"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">MRP Strike-through (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.compareAtPrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription}
                  onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Image URL / Path</label>
                <input
                  type="text"
                  value={editingProduct.images[0] || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.active}
                    onChange={e => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                  />
                  <span>Product Active on Store</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={e => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE OR EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {editingCouponCode ? `Edit Coupon (${editingCouponCode})` : 'Create Promotional Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                  required
                  disabled={Boolean(editingCouponCode)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono uppercase disabled:bg-stone-100 disabled:text-stone-500"
                />
                {editingCouponCode && <p className="text-[10px] text-stone-400 mt-1">Coupon code identifier cannot be changed once created.</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Type</label>
                  <select
                    value={newCouponType}
                    onChange={e => setNewCouponType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    value={newCouponValue}
                    onChange={e => setNewCouponValue(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={e => setNewCouponMin(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={newCouponMax}
                    onChange={e => setNewCouponMax(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% OFF for orders above ₹799"
                  value={newCouponDesc}
                  onChange={e => setNewCouponDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS INVOICE & TRACKING */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Order #{selectedOrderDetails.orderId}
                </h3>
                <p className="text-stone-400 text-xs mt-0.5">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <h4 className="font-bold text-stone-900">Customer & Destination:</h4>
                <p className="font-semibold text-stone-800">{selectedOrderDetails.customerName}</p>
                <p>{selectedOrderDetails.shippingAddress?.house}, {selectedOrderDetails.shippingAddress?.street}</p>
                <p>{selectedOrderDetails.shippingAddress?.city}, {selectedOrderDetails.shippingAddress?.state} — {selectedOrderDetails.shippingAddress?.pinCode}</p>
                <p className="text-stone-500 pt-1">Phone: {selectedOrderDetails.phone}</p>
                <p className="text-stone-500">Email: {selectedOrderDetails.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900">Payment & Transit Status:</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrderDetails.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrderDetails.orderStatus === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedOrderDetails.orderStatus === 'Processing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}>
                    {selectedOrderDetails.orderStatus}
                  </span>
                </div>
                <p>Payment Mode: <b>{selectedOrderDetails.paymentMethod}</b></p>
                <p>Payment Status: <b>{selectedOrderDetails.paymentStatus}</b></p>
                {selectedOrderDetails.razorpayPaymentId && (
                  <p className="font-mono text-[10px]">Txn ID: {selectedOrderDetails.razorpayPaymentId}</p>
                )}
                <p>Estimated Delivery: <b>{selectedOrderDetails.estimatedDelivery}</b></p>

                {(selectedOrderDetails.courierPartner || selectedOrderDetails.trackingNumber) && (
                  <div className="mt-2 pt-2 border-t border-stone-200 space-y-1 bg-white p-2.5 rounded-xl border">
                    <p className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-800" />
                      Logistics Partner: {selectedOrderDetails.courierPartner || 'Express Courier'}
                    </p>
                    {selectedOrderDetails.trackingNumber && (
                      <p className="font-mono text-[11px] text-stone-700">
                        AWB: <strong className="text-stone-900">{selectedOrderDetails.trackingNumber}</strong>
                      </p>
                    )}
                    {selectedOrderDetails.trackingUrl && (
                      <a
                        href={selectedOrderDetails.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        Live Tracking Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Progression Controls */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-emerald-950 block flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-800" />
                  Order Status & Customer Email Workflow
                </span>
                <span className="text-[11px] text-stone-600">
                  Current: <strong>{selectedOrderDetails.orderStatus}</strong> • Recipient: <strong>{selectedOrderDetails.email}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedOrderDetails.orderStatus === 'Processing' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(selectedOrderDetails, 'Shipped')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1 text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Ship Order
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(selectedOrderDetails, 'Delivered')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Deliver
                    </button>
                  </>
                )}
                {selectedOrderDetails.orderStatus === 'Shipped' && (
                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(selectedOrderDetails, 'Delivered')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Delivered
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(selectedOrderDetails)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Update & Send Email
                </button>
              </div>
            </div>

            {/* Notification History Log if any */}
            {selectedOrderDetails.statusNotifications && selectedOrderDetails.statusNotifications.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-800" />
                    Automated Emails Sent to Customer ({selectedOrderDetails.statusNotifications.length}):
                  </h4>
                  <span className="text-[10px] text-stone-400">Transaction log</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedOrderDetails.statusNotifications.map(notif => (
                    <div key={notif.id} className="p-2 bg-white rounded-xl border border-stone-200 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{notif.subject}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(notif.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 truncate">{notif.contentPreview}</p>
                      <div className="text-[10px] text-stone-400 flex items-center gap-2">
                        <span>To: {notif.recipientEmail}</span>
                        {notif.trackingNumber && <span>• AWB: {notif.trackingNumber}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-stone-900">Ordered Items Breakdown:</h4>
                <span className="text-[11px] font-bold text-stone-500">
                  {selectedOrderDetails.items.reduce((s, i) => s + (i.quantity || 1), 0)} total {selectedOrderDetails.items.reduce((s, i) => s + (i.quantity || 1), 0) === 1 ? 'unit' : 'units'}
                </span>
              </div>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-4 text-xs bg-stone-50/40 space-y-2.5">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover border border-stone-200 bg-white shrink-0 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 text-xs block leading-snug">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {item.size && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                              {item.size}
                            </span>
                          )}
                          <span className="text-stone-600 text-[11px] font-medium">
                            Qty: <strong className="text-stone-900 font-bold">{item.quantity}</strong> × ₹{item.unitPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm whitespace-nowrap">
                      ₹{item.totalPrice || item.unitPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-sm font-bold text-stone-900 border-t border-stone-100">
              <span>Total Amount:</span>
              <span className="font-serif text-xl">₹{selectedOrderDetails.totalAmount}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MASTER ORDERS & EXCEL EXPORT HUB */}
      {isMasterExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-800" />
                  Master Orders & Excel Export Hub
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Single comprehensive window to view all customer orders, select orders via checkboxes, sort/filter by status, and download separate Excel (CSV) reports.
                </p>
              </div>
              <button
                onClick={() => setIsMasterExportModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-xl bg-stone-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Top Action Bar & Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">Search Master Orders</label>
                <div className="relative">
                  <input
                    type="text"
                    value={masterSearch}
                    onChange={e => setMasterSearch(e.target.value)}
                    placeholder="Search name, phone, order ID, city..."
                    className="w-full text-xs py-2 px-3 pl-8 rounded-xl bg-white border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">Excel & PDF Data Hub</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportOrdersToExcel(orders, `nira-all-orders-${Date.now()}.xls`)}
                    className="py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    title="Download all orders as formatted Excel spreadsheet"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel ({orders.length})</span>
                  </button>
                  <button
                    onClick={() => exportOrdersToPdf(orders, `NIRA-Master-Orders-Report-${Date.now()}`)}
                    className="py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    title="Generate and download printable PDF order report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Report</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">Selected & Status Export</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const selected = orders.filter(o => masterSelectedOrderIds.includes(o.orderId));
                      if (selected.length === 0) {
                        addToast('Please select orders using checkboxes first', 'error');
                        return;
                      }
                      exportOrdersToExcel(selected, `nira-selected-orders-${Date.now()}.xls`);
                    }}
                    disabled={masterSelectedOrderIds.length === 0}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <span>Excel Selected ({masterSelectedOrderIds.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      const selected = orders.filter(o => masterSelectedOrderIds.includes(o.orderId));
                      if (selected.length === 0) {
                        addToast('Please select orders using checkboxes first', 'error');
                        return;
                      }
                      exportOrdersToPdf(selected, `NIRA-Selected-Orders-Report-${Date.now()}`);
                    }}
                    disabled={masterSelectedOrderIds.length === 0}
                    className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50 border border-amber-400/30"
                  >
                    <span>PDF Selected</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Category Checkboxes for Separation */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-stone-800">
                Filter & Separate by Delivery Status Checkboxes:
              </span>
              <div className="flex flex-wrap items-center gap-2.5 bg-stone-100 p-3 rounded-2xl text-xs">
                {Object.keys(statusFilterCheckboxes).map(statusKey => {
                  const isChecked = (statusFilterCheckboxes as any)[statusKey];
                  const count = orders.filter(o => o.orderStatus === statusKey).length;
                  return (
                    <label
                      key={statusKey}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-white border-emerald-700 text-stone-900 shadow-xs font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e =>
                          setStatusFilterCheckboxes({
                            ...statusFilterCheckboxes,
                            [statusKey]: e.target.checked
                          })
                        }
                        className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>{statusKey}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Master Orders Table with Row Checkboxes */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (masterSelectedOrderIds.length === orders.length) {
                        setMasterSelectedOrderIds([]);
                      } else {
                        setMasterSelectedOrderIds(orders.map(o => o.orderId));
                      }
                    }}
                    className="font-bold text-emerald-800 hover:underline"
                  >
                    {masterSelectedOrderIds.length === orders.length ? 'Deselect All' : 'Select All Orders'}
                  </button>
                  <span>•</span>
                  <span>{masterSelectedOrderIds.length} of {orders.length} selected</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  Showing all customer orders in a unified master ledger
                </div>
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50/80 sticky top-0 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold z-10">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer Name & Contact</th>
                      <th className="p-3.5">Destination (City, PIN)</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total (₹)</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Order Status</th>
                      <th className="p-3.5 text-right">Separate Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {orders
                      .filter(o => {
                        if (masterSearch.trim()) {
                          const q = masterSearch.toLowerCase();
                          const matchesId = o.orderId.toLowerCase().includes(q);
                          const matchesName = (o.customerName || '').toLowerCase().includes(q);
                          const matchesPhone = (o.phone || '').includes(q);
                          const matchesCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
                          if (!matchesId && !matchesName && !matchesPhone && !matchesCity) return false;
                        }
                        if (!(statusFilterCheckboxes as any)[o.orderStatus]) {
                          return false;
                        }
                        return true;
                      })
                      .map(o => {
                        const isSelected = masterSelectedOrderIds.includes(o.orderId);
                        return (
                          <tr key={o.orderId} className={`hover:bg-stone-50/80 ${isSelected ? 'bg-amber-50/60' : ''}`}>
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setMasterSelectedOrderIds([...masterSelectedOrderIds, o.orderId]);
                                  } else {
                                    setMasterSelectedOrderIds(masterSelectedOrderIds.filter(id => id !== o.orderId));
                                  }
                                }}
                                className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                              />
                            </td>
                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-stone-900">{o.orderId}</span>
                              <span className="block text-[10px] text-stone-400">
                                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-stone-900">{o.customerName}</p>
                              <p className="text-[10px] text-stone-400 font-mono">{o.phone || 'N/A'}</p>
                            </td>
                            <td className="p-3.5">
                              <p className="text-stone-800 font-medium">{o.shippingAddress?.city || 'Kerala'}</p>
                              <p className="text-[10px] text-stone-400">{o.shippingAddress?.pinCode || ''}</p>
                            </td>
                            <td className="p-3.5 align-top min-w-[260px]">
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                                  {o.items.reduce((sum, i) => sum + (i.quantity || 1), 0)} {o.items.reduce((sum, i) => sum + (i.quantity || 1), 0) === 1 ? 'unit' : 'units'} • {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                                </div>
                                {o.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 p-1.5 rounded-lg bg-stone-50 border border-stone-200/80 hover:bg-stone-100/70 transition-colors"
                                  >
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-8 h-8 rounded-md object-cover border border-stone-200 shrink-0 bg-white"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                                        <Package className="w-3.5 h-3.5" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-stone-900 text-xs leading-snug break-words">
                                        {item.name}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                                        {item.size && (
                                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                                            {item.size}
                                          </span>
                                        )}
                                        <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70">
                                          Qty: {item.quantity}
                                        </span>
                                        <span className="font-bold text-stone-900 ml-auto">
                                          ₹{item.totalPrice || item.unitPrice * item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-3.5 font-bold text-stone-900">₹{o.totalAmount}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                              }`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleExportByStatus(o.orderStatus)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold rounded-lg"
                                title="Download all orders matching this status"
                              >
                                Export {o.orderStatus}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                💡 Tip: Check delivery statuses above and click <b>"Download Checked Statuses Separately"</b> to get categorized Excel files instantly.
              </span>
              <button
                onClick={() => setIsMasterExportModalOpen(false)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
              >
                Close Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER INQUIRY DETAILS & REPLY */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {selectedInquiry.subject || 'Customer Inquiry'}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Received on {new Date(selectedInquiry.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-xl bg-stone-100 text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Contact Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">{selectedInquiry.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Inquirer
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-blue-700 hover:underline font-mono"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-mono text-stone-800">{selectedInquiry.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Full Message Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Message Content
              </label>
              <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Reply & Dispatch Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Direct Contact Actions
              </span>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Your inquiry at NIRA Pure Coconut Oil')}&body=${encodeURIComponent(`Dear ${selectedInquiry.name},\n\nThank you for reaching out to NIRA Pure Coconut Oil.\n\n\n\nKind regards,\nNIRA Store Team\nhttps://niracoconutoil.com`)}`}
                  className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedInquiry.name}, thank you for contacting NIRA Pure Coconut Oil regarding "${selectedInquiry.subject || 'your inquiry'}". How can we assist you today?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Customer</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleMarkInquiryRead(selectedInquiry.id);
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl ml-auto transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Razorpay Payment Window Modal for Admin Testing */}
      <RazorpayModal
        isOpen={showDemoRazorpayModal}
        onClose={() => setShowDemoRazorpayModal(false)}
        orderId="TEST-DEMO-PAYMENT"
        razorpayOrderId={`order_admin_demo_${Date.now()}`}
        amount={100}
        customer={{
          name: customerProfile?.name || 'Store Administrator',
          email: customerProfile?.email || 'admin@niracoconutoil.com',
          phone: '+91 98470 12345'
        }}
        onSuccess={(data) => {
          setShowDemoRazorpayModal(false);
          addToast(`Test payment approved! Ref: ${data.razorpayPaymentId}`, 'success');
        }}
        onFailure={(msg) => {
          setShowDemoRazorpayModal(false);
          addToast(`Test payment simulation error: ${msg}`, 'error');
        }}
        brandName="NIRA Pure Coconut Oil"
        isTestMode={isTestMode}
      />

      {/* Order Status Tracking & Customer Email Dispatch Modal */}
      <OrderStatusTrackingModal
        order={statusTrackingOrder}
        isOpen={isStatusTrackingModalOpen}
        initialTargetStatus={statusTrackingTarget}
        onClose={() => {
          setIsStatusTrackingModalOpen(false);
          setStatusTrackingOrder(null);
          setStatusTrackingTarget(undefined);
        }}
        onSuccess={handleStatusUpdateSuccess}
      />

      {/* Successful Orders Export Hub Modal (Weekly, Monthly, Yearly, Custom) */}
      <SuccessfulOrdersExportModal
        isOpen={isSuccessfulOrdersModalOpen}
        onClose={() => setIsSuccessfulOrdersModalOpen(false)}
        orders={orders}
        onToast={addToast}
        initialTimeframe={successfulOrdersInitialTimeframe}
      />

      {/* WhatsApp Order Alert Modal */}
      <WhatsAppNotificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setSelectedWhatsAppOrder(null);
        }}
        order={selectedWhatsAppOrder}
      />

      {/* Thermal Shipping Label & Packing Slip Modal */}
      <ThermalShippingLabelModal
        isOpen={isThermalModalOpen}
        onClose={() => setIsThermalModalOpen(false)}
        orders={thermalOrders}
      />
    </div>
  );
};

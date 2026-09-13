import React, { useState, useEffect } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Product, Order, Coupon, StoreSettings, ProductSize } from '../types';
import { RazorpayModal } from '../components/RazorpayModal';

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

  // Security PIN update state in Settings tab
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [pinUpdateMsg, setPinUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Demo Razorpay Modal state for admin testing
  const [showDemoRazorpayModal, setShowDemoRazorpayModal] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'inventory' | 'orders' | 'customers' | 'coupons' | 'settings'
  >('overview');

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

  // Master Orders & Export Hub States
  const [isMasterExportModalOpen, setIsMasterExportModalOpen] = useState(false);
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
    addToast(`Successfully downloaded ${ordersToExport.length} orders as Excel/CSV!`, 'success');
  };

  const handleExportSelectedOrders = () => {
    const selected = orders.filter(o => masterSelectedOrderIds.includes(o.orderId));
    if (selected.length === 0) {
      addToast('Please select at least one order using the checkboxes', 'error');
      return;
    }
    exportOrdersToCsv(selected, `nira-selected-orders-${Date.now()}.csv`);
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
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

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
    } catch (err: any) {
      setPinUpdateMsg({ type: 'error', text: err.message || 'Failed to update PIN' });
    } finally {
      setIsUpdatingPin(false);
    }
  };

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

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
            >
              <span>Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-stone-700 hidden md:block" />
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
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'settings', label: 'Store Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-300 font-bold'
                    : 'border-transparent hover:text-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
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
                <p className="text-xs text-stone-500">Track shipments, verify payments, and update transit status.</p>
              </div>

              {/* Master Hub & Excel Export Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsMasterExportModalOpen(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all border border-amber-400/30"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Master Orders & Excel Hub ({orders.length})</span>
                </button>
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
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer & City</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Order Status</th>
                      <th className="p-4 text-right">Actions</th>
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
                          <td className="p-4">
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
                          <td className="p-4">
                            <p className="font-bold text-stone-900">{o.customerName}</p>
                            <p className="text-stone-400 text-[11px]">{o.shippingAddress?.city || 'Kerala'}, {o.shippingAddress?.pinCode}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-stone-800">{o.items.length} items</span>
                            <p className="text-[11px] text-stone-400 truncate max-w-[140px]">
                              {o.items.map(i => i.name).join(', ')}
                            </p>
                          </td>
                          <td className="p-4 font-bold text-stone-900">₹{o.totalAmount}</td>
                          <td className="p-4">
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
                          <td className="p-4">
                            <select
                              value={o.orderStatus}
                              onChange={e => handleUpdateOrderStatus(o.orderId, e.target.value)}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg"
                            >
                              View Details
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

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <h4 className="font-bold text-stone-900">Payment & Transit Status:</h4>
                <p>Payment Mode: <b>{selectedOrderDetails.paymentMethod}</b></p>
                <p>Payment Status: <b>{selectedOrderDetails.paymentStatus}</b></p>
                {selectedOrderDetails.razorpayPaymentId && (
                  <p className="font-mono text-[10px]">Txn ID: {selectedOrderDetails.razorpayPaymentId}</p>
                )}
                <p>Order Status: <b className="text-emerald-800">{selectedOrderDetails.orderStatus}</b></p>
                <p>Estimated Delivery: <b>{selectedOrderDetails.estimatedDelivery}</b></p>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-stone-900">Ordered Items:</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-4 text-xs">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{item.name}</span>
                      <span className="text-stone-400 text-[11px] block">{item.size} • Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.unitPrice * item.quantity}</span>
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">Quick Excel Downloads</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportOrdersToCsv(orders, `nira-all-orders-master-${Date.now()}.csv`)}
                    className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All ({orders.length})</span>
                  </button>
                  <button
                    onClick={handleExportSelectedOrders}
                    disabled={masterSelectedOrderIds.length === 0}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Selected ({masterSelectedOrderIds.length})</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">Separated Status Batch Export</label>
                <button
                  onClick={handleExportSeparatedByCheckedStatuses}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all border border-amber-400/30"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Checked Statuses Separately</span>
                </button>
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
                            <td className="p-3.5">
                              <span className="font-medium text-stone-800">{o.items.length} items</span>
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
    </div>
  );
};

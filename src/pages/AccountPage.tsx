import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  Plus,
  Truck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Trash2,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  MessageCircle,
  FileText,
  Boxes,
  CircleDot,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order, OrderItem, OrderStatus, Product, ProductSize, ShippingAddress } from '../types';
import { OrderTimeline } from '../components/OrderTimeline';

export const AccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    customerProfile,
    login,
    register,
    logout,
    isAdmin,
    savedAddresses,
    updateProfileAddress,
    loginAsDemoCustomer
  } = useAuth();
  const { products, settings, addToast } = useStore();
  const { addToCart, setIsCartDrawerOpen } = useCart();

  const [authTab, setAuthTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [activeSection, setActiveSection] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Address form modal
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrFullName, setNewAddrFullName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrHouse, setNewAddrHouse] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Kozhikode');
  const [newAddrState, setNewAddrState] = useState('Kerala');
  const [newAddrPin, setNewAddrPin] = useState('673001');

  // Customer orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Order history filters & UI state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [isReorderingMap, setIsReorderingMap] = useState<{ [key: string]: boolean }>({});

  const loadCustomerOrders = async (email: string) => {
    try {
      setIsLoadingOrders(true);
      const data = await api.getOrders({ email });
      setOrders(data);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (customerProfile) {
      loadCustomerOrders(customerProfile.email);
    }
  }, [customerProfile]);

  // Toggle expanded card
  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // Copy tracking number
  const handleCopyTracking = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedTrackingId(awb);
    setTimeout(() => setCopiedTrackingId(null), 2000);
    addToast('AWB tracking number copied to clipboard', 'info');
  };

  // Helper to construct product or match catalog for reorder
  const getProductForReorder = (item: OrderItem): Product => {
    const matched = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase());
    if (matched) return matched;

    return {
      id: item.productId || `prod-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: 'Pure Coconut Oil',
      shortDescription: '100% Pure Cold-Pressed Virgin Coconut Oil',
      description: '100% Pure Cold-Pressed Virgin Coconut Oil crafted from fresh Malabar coconuts.',
      price: item.unitPrice,
      stock: 100,
      sku: `NIRA-${item.size.replace(/\s+/g, '')}`,
      size: item.size,
      unit: 'bottle',
      images: [item.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600'],
      ingredients: ['100% Pure Cold-Pressed Coconut Oil'],
      benefits: ['Raw & unrefined', 'Rich in lauric acid', 'Zero chemicals or preservatives'],
      usage: ['Cooking & sautéing', 'Hair nourishment', 'Ayurvedic wellness'],
      storage: 'Store in a cool, dry place away from direct sunlight',
      specifications: {
        extractionMethod: 'Cold-Pressed Wooden Ghani (Chekku)',
        shelfLife: '12 Months',
        aroma: 'Fresh Sweet Coconut',
        smokePoint: '177°C / 350°F',
        source: 'Kozhikode, Kerala'
      },
      featured: true,
      active: true,
      rating: 4.9,
      reviewCount: 48,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // 1-Click Reorder ALL items in order
  const handleReorderWholeOrder = (order: Order) => {
    const key = order.orderId;
    setIsReorderingMap(prev => ({ ...prev, [key]: true }));

    let addedCount = 0;
    order.items.forEach(item => {
      const prod = getProductForReorder(item);
      addToCart(prod, item.quantity, item.size);
      addedCount += item.quantity;
    });

    setIsCartDrawerOpen(true);
    addToast(`Added ${addedCount} item${addedCount === 1 ? '' : 's'} from Order #${order.orderId} to your cart!`, 'success');

    setTimeout(() => {
      setIsReorderingMap(prev => ({ ...prev, [key]: false }));
    }, 600);
  };

  // 1-Click Reorder single item from order
  const handleReorderSingleItem = (item: OrderItem) => {
    const key = `${item.productId}-${item.size}`;
    setIsReorderingMap(prev => ({ ...prev, [key]: true }));

    const prod = getProductForReorder(item);
    addToCart(prod, item.quantity, item.size);
    setIsCartDrawerOpen(true);
    addToast(`Added ${item.quantity}× ${item.name} (${item.size}) to your cart!`, 'success');

    setTimeout(() => {
      setIsReorderingMap(prev => ({ ...prev, [key]: false }));
    }, 600);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await login(loginEmail, loginPassword);
      addToast('Welcome back to NIRA!', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      await register(regName, regEmail, regPassword, regPhone);
      addToast('Account created successfully! Welcome to NIRA.', 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFullName || !newAddrHouse || !newAddrStreet || !newAddrCity || !newAddrPin) {
      addToast('Please fill all required address fields', 'error');
      return;
    }
    const newAddress: ShippingAddress = {
      fullName: newAddrFullName,
      phone: newAddrPhone || customerProfile?.phone || '',
      email: customerProfile?.email || '',
      house: newAddrHouse,
      street: newAddrStreet,
      city: newAddrCity,
      district: newAddrCity,
      state: newAddrState,
      pinCode: newAddrPin,
      isDefault: false
    };
    updateProfileAddress(newAddress);
    setIsAddingAddress(false);
    addToast('New delivery address saved!', 'success');
  };

  // Order status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Delivered'
        };
      case 'Shipped':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
          label: 'Shipped (In Transit)'
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500 animate-ping',
          label: 'Out for Delivery'
        };
      case 'Processing':
      case 'Packed':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Processing & Bottling'
        };
      case 'Confirmed':
      case 'Paid':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-200',
          dot: 'bg-teal-500',
          label: 'Order Confirmed'
        };
      case 'Cancelled':
      case 'Refunded':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: status
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          dot: 'bg-stone-400',
          label: status
        };
    }
  };

  // Step progression helper for visual timeline
  const getProgressIndex = (status: OrderStatus) => {
    if (status === 'Cancelled' || status === 'Refunded') return -1;
    if (status === 'Delivered') return 4;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Shipped') return 2;
    if (status === 'Processing' || status === 'Packed') return 1;
    return 0; // Confirmed / Pending Payment / Paid
  };

  const LIFECYCLE_STEPS = [
    { title: 'Confirmed', icon: CheckCheck },
    { title: 'Processing', icon: Clock },
    { title: 'Shipped', icon: Truck },
    { title: 'Out for Delivery', icon: CircleDot },
    { title: 'Delivered', icon: CheckCircle2 }
  ];

  // Filtering calculations
  const filteredOrders = orders.filter(order => {
    // Status Filter
    if (statusFilter === 'ACTIVE') {
      const activeStatuses: OrderStatus[] = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Paid', 'Pending Payment'];
      if (!activeStatuses.includes(order.orderStatus)) return false;
    } else if (statusFilter === 'DELIVERED') {
      if (order.orderStatus !== 'Delivered') return false;
    } else if (statusFilter === 'CANCELLED') {
      if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Refunded') return false;
    }

    // Search Query (Order ID, Product Name, Tracking AWB)
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
      const matchProduct = order.items.some(i => i.name.toLowerCase().includes(q) || i.size.toLowerCase().includes(q));
      if (!matchId && !matchTracking && !matchProduct) return false;
    }

    return true;
  });

  // Summary Metrics
  const totalSpend = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrdersCount = orders.filter(o =>
    ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Paid'].includes(o.orderStatus)
  ).length;

  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;

  // IF NOT LOGGED IN, RENDER AUTH LOGIN / SIGNUP VIEW
  if (!customerProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="font-serif text-2xl font-bold text-stone-900">NIRA Account</span>
            <p className="text-xs text-stone-500">Sign in to view past orders, track shipments, and reorder items in 1 click.</p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authTab === 'login' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authTab === 'register' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Sign In to Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ananya Nair"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Create My Account
              </button>
            </form>
          )}

          {/* Quick Demo Customer Login for Testing */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <button
              type="button"
              onClick={loginAsDemoCustomer}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Quick Test: Sign in as Demo Customer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IF LOGGED IN, RENDER ACCOUNT DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with profile info & Admin quick link */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-serif text-xl font-bold border border-emerald-200 shadow-xs">
            {customerProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">{customerProfile.name}</h1>
              {isAdmin && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Store Admin
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{customerProfile.email} {customerProfile.phone && `• ${customerProfile.phone}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl border border-amber-300 transition-colors"
            >
              Open Admin Dashboard
            </Link>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 border border-stone-200 hover:border-rose-300 text-stone-700 hover:text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setActiveSection('orders')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeSection === 'orders'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({orders.length})</span>
          {activeOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
              {activeOrdersCount} Active
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('addresses')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeSection === 'addresses'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({savedAddresses.length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: ORDER HISTORY & 1-CLICK REORDER           */}
      {/* ==================================================== */}
      {activeSection === 'orders' && (
        <div className="space-y-6">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Orders Placed
              </span>
              <p className="text-2xl font-serif font-bold text-stone-900">{orders.length}</p>
              <span className="text-[10px] text-stone-500">Lifetime purchases</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Active In-Transit
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-900">{activeOrdersCount}</p>
              <span className="text-[10px] text-emerald-600">On the way to your door</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Delivered Orders
              </span>
              <p className="text-2xl font-serif font-bold text-blue-900">{deliveredOrdersCount}</p>
              <span className="text-[10px] text-stone-400">Successfully received</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Spend
              </span>
              <p className="text-2xl font-serif font-bold text-stone-900">₹{totalSpend.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-stone-400">Pure cold-pressed oil</span>
            </div>
          </div>

          {/* Search, Filter Toolbar & Refresh Button */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-stone-400" /> Filter:
              </span>
              {(['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'] as const).map(f => {
                const count =
                  f === 'ALL'
                    ? orders.length
                    : f === 'ACTIVE'
                    ? activeOrdersCount
                    : f === 'DELIVERED'
                    ? deliveredOrdersCount
                    : orders.filter(o => o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded').length;

                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      statusFilter === f
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {f === 'ALL' ? 'All Orders' : f === 'ACTIVE' ? 'Active / In Transit' : f === 'DELIVERED' ? 'Delivered' : 'Cancelled'} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input & Refresh Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Order ID, product, AWB..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-sans"
                />
              </div>

              <button
                type="button"
                onClick={() => customerProfile && loadCustomerOrders(customerProfile.email)}
                disabled={isLoadingOrders}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 shrink-0"
                title="Refresh order history"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Orders List / Empty View */}
          {isLoadingOrders ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-800">Fetching your order history & tracking details...</p>
              <p className="text-[11px] text-stone-400">Connecting to NIRA database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {orderSearchQuery ? 'No Orders Match Your Search' : 'No Orders in this View'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {orderSearchQuery
                  ? `We couldn't find any orders matching "${orderSearchQuery}". Try adjusting your keywords.`
                  : 'You do not have any orders under this filter category yet.'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {orderSearchQuery && (
                  <button
                    onClick={() => {
                      setOrderSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Clear Filter & Search
                  </button>
                )}
                <Link
                  to="/shop"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Pure Coconut Oils</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map(order => {
                const badge = getStatusBadge(order.orderStatus);
                const progressIdx = getProgressIndex(order.orderStatus);
                const isExpanded = expandedOrderIds.has(order.orderId);
                const isReorderingThisOrder = isReorderingMap[order.orderId];

                return (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden transition-all hover:border-stone-300"
                  >
                    {/* Order Top Banner */}
                    <div className="p-5 sm:p-6 bg-stone-50/60 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Order Identity & Placed Timestamp */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-bold text-stone-900 text-sm sm:text-base">
                            #{order.orderId}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-200/70 text-stone-700">
                            {order.paymentMethod || 'Prepaid'} • {order.paymentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            Placed on{' '}
                            <strong>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </strong>{' '}
                            at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </div>

                      {/* Top Right: Total Amount & 1-Click Reorder Action */}
                      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-stone-200">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                            Order Total
                          </span>
                          <span className="font-bold text-stone-900 text-lg font-serif">
                            ₹{order.totalAmount}
                          </span>
                        </div>

                        {/* 1-Click Reorder All Button */}
                        <button
                          type="button"
                          onClick={() => handleReorderWholeOrder(order)}
                          disabled={isReorderingThisOrder}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:shadow disabled:opacity-50 group"
                          title="Reorder all items in this order with 1 click"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isReorderingThisOrder ? 'animate-spin' : 'group-hover:-rotate-45 transition-transform'}`} />
                          <span>{isReorderingThisOrder ? 'Reordering...' : 'Reorder All'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Visual Lifecycle Stepper */}
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Refunded' && (
                      <div className="px-5 sm:px-6 py-4 bg-white border-b border-stone-100">
                        <div className="max-w-3xl mx-auto">
                          <div className="relative flex items-center justify-between">
                            {/* Connector Line Background */}
                            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
                            {/* Completed Connector Line Fill */}
                            <div
                              className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-700 transition-all duration-500 -z-0"
                              style={{
                                width: `${(Math.max(0, progressIdx) / (LIFECYCLE_STEPS.length - 1)) * 100}%`
                              }}
                            />

                            {LIFECYCLE_STEPS.map((step, idx) => {
                              const isCompleted = idx <= progressIdx;
                              const isCurrent = idx === progressIdx;
                              const StepIcon = step.icon;

                              return (
                                <div key={step.title} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs'
                                        : 'bg-white border-stone-300 text-stone-400'
                                    } ${isCurrent ? 'ring-4 ring-emerald-100 ring-offset-1 scale-110' : ''}`}
                                  >
                                    <StepIcon className="w-4 h-4" />
                                  </div>
                                  <span
                                    className={`text-[10px] mt-1.5 font-bold text-center hidden sm:block ${
                                      isCurrent
                                        ? 'text-emerald-900 font-extrabold'
                                        : isCompleted
                                        ? 'text-stone-800'
                                        : 'text-stone-400'
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Mobile text description */}
                          <div className="sm:hidden text-center mt-2">
                            <span className="text-xs font-bold text-emerald-900">
                              Current Status: {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items Table / List */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-800" />
                          Items in this Order ({order.items.length})
                        </span>
                        <span className="text-[11px] text-stone-400">1-click reorder individual items</span>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {order.items.map((item, idx) => {
                          const itemReorderKey = `${item.productId}-${item.size}`;
                          const isReorderingThisItem = isReorderingMap[itemReorderKey];

                          return (
                            <div
                              key={idx}
                              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={item.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400'}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover bg-stone-50 border border-stone-200 shrink-0"
                                />
                                <div>
                                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[10px] border border-emerald-100">
                                      {item.size}
                                    </span>
                                    <span>•</span>
                                    <span>Quantity: <strong>{item.quantity}</strong></span>
                                    <span>•</span>
                                    <span>₹{item.unitPrice} each</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 pl-15 sm:pl-0">
                                <span className="font-bold text-stone-900 text-sm font-serif">
                                  ₹{item.totalPrice || item.unitPrice * item.quantity}
                                </span>

                                {/* 1-Click Reorder Single Item */}
                                <button
                                  type="button"
                                  onClick={() => handleReorderSingleItem(item)}
                                  disabled={isReorderingThisItem}
                                  className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                                  title={`Reorder ${item.name} (${item.size})`}
                                >
                                  <RotateCcw className={`w-3 h-3 ${isReorderingThisItem ? 'animate-spin' : ''}`} />
                                  <span>{isReorderingThisItem ? 'Adding...' : 'Reorder Item'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dispatch & Courier Banner if Shipped / Available */}
                    {(order.courierPartner || order.trackingNumber) && (
                      <div className="mx-5 sm:mx-6 mb-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                              Courier Dispatch & Tracking
                            </span>
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                              {order.courierPartner || 'Express Logistics Partner'}
                            </h4>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-stone-600 font-mono">
                                  AWB: <strong className="text-stone-900">{order.trackingNumber}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTracking(order.trackingNumber!)}
                                  className="p-1 text-stone-400 hover:text-blue-700 transition-colors"
                                  title="Copy AWB Tracking Number"
                                >
                                  {copiedTrackingId === order.trackingNumber ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                              <span>Courier Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <Link
                            to={`/track-order?orderId=${order.orderId}`}
                            className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-blue-700" />
                            <span>Live Progress</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Expandable Order Details Drawer */}
                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/40 space-y-6 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                          {/* Shipping Destination */}
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2">
                            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-800" />
                              Delivery Destination
                            </h4>
                            <div className="text-xs text-stone-600 space-y-1">
                              <p className="font-bold text-stone-900">{order.customerName}</p>
                              <p>{order.shippingAddress?.house}, {order.shippingAddress?.street}</p>
                              {order.shippingAddress?.locality && <p>{order.shippingAddress?.locality}</p>}
                              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pinCode}</p>
                              <p className="text-stone-500 pt-1">
                                Contact Phone: <strong className="text-stone-800 font-mono">{order.phone || order.shippingAddress?.phone}</strong>
                              </p>
                              {order.email && (
                                <p className="text-stone-400 text-[11px]">Email: {order.email}</p>
                              )}
                            </div>
                          </div>

                          {/* Payment & Price Breakdown */}
                          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2">
                            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-emerald-800" />
                              Payment & Price Summary
                            </h4>
                            <div className="text-xs space-y-1.5 text-stone-600 pt-1">
                              <div className="flex justify-between">
                                <span>Items Subtotal:</span>
                                <span className="font-mono font-medium text-stone-900">
                                  ₹{order.items.reduce((s, i) => s + (i.totalPrice || i.unitPrice * i.quantity), 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping & Handling:</span>
                                <span className="font-mono font-medium text-emerald-800">
                                  {order.totalAmount >= 499 ? 'FREE (Threshold Met)' : '₹49'}
                                </span>
                              </div>
                              {order.discountAmount && order.discountAmount > 0 ? (
                                <div className="flex justify-between text-emerald-700">
                                  <span>Coupon Discount ({order.appliedCoupon || 'PROMO'}):</span>
                                  <span className="font-mono font-bold">-₹{order.discountAmount}</span>
                                </div>
                              ) : null}
                              <div className="flex justify-between pt-2 border-t border-stone-100 font-bold text-stone-900 text-sm">
                                <span>Grand Total Paid:</span>
                                <span className="font-serif text-base text-emerald-900">₹{order.totalAmount}</span>
                              </div>
                              <div className="pt-1 text-[11px] text-stone-400">
                                Payment Method: <strong className="text-stone-700">{order.paymentMethod}</strong> ({order.paymentStatus})
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Shipment Timeline if tracking logs exist */}
                        {order.trackingTimeline && order.trackingTimeline.length > 0 && (
                          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-emerald-800" />
                              Live Tracking Activity Timeline
                            </h4>
                            <div className="pt-2">
                              <OrderTimeline
                                timeline={order.trackingTimeline}
                                currentStatus={order.orderStatus}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Card Footer Action Bar */}
                    <div className="px-5 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* Left: Expand Details Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleOrderExpanded(order.orderId)}
                        className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 transition-colors py-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Full Details & Breakdown'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* WhatsApp Help */}
                        <a
                          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi NIRA Team, I have a query regarding my order #${order.orderId}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5 transition-colors font-medium"
                          title="Contact WhatsApp support for this order"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Help</span>
                        </a>

                        {/* Invoice Link */}
                        <Link
                          to={`/order-confirmation/${order.orderId}`}
                          className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-500" />
                          <span>Tax Invoice</span>
                        </Link>

                        {/* Track Shipment Link */}
                        <Link
                          to={`/track-order?orderId=${order.orderId}`}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Order</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 2: SAVED ADDRESSES                           */}
      {/* ==================================================== */}
      {activeSection === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-stone-500">Manage your shipping destinations for faster 1-click checkout.</p>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Add address form modal / toggle */}
          {isAddingAddress && (
            <form onSubmit={handleSaveAddress} className="bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
              <h4 className="font-bold text-sm text-stone-900">New Address Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newAddrFullName}
                  onChange={e => setNewAddrFullName(e.target.value)}
                  required
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
                <input
                  type="tel"
                  placeholder="Mobile Phone"
                  value={newAddrPhone}
                  onChange={e => setNewAddrPhone(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="House / Flat No. *"
                  value={newAddrHouse}
                  onChange={e => setNewAddrHouse(e.target.value)}
                  required
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Street / Locality *"
                  value={newAddrStreet}
                  onChange={e => setNewAddrStreet(e.target.value)}
                  required
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City *"
                  value={newAddrCity}
                  onChange={e => setNewAddrCity(e.target.value)}
                  required
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="State *"
                  value={newAddrState}
                  onChange={e => setNewAddrState(e.target.value)}
                  required
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="PIN Code *"
                  value={newAddrPin}
                  onChange={e => setNewAddrPin(e.target.value)}
                  required
                  maxLength={6}
                  className="text-xs p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Saved addresses grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((addr, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{addr.fullName}</span>
                  {idx === 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Primary Address
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {addr.house}, {addr.street}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} — {addr.pinCode}
                </p>
                <p className="text-[11px] text-stone-400 font-mono">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

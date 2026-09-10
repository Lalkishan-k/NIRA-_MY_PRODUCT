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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Product, Order, Coupon, StoreSettings, ProductSize } from '../types';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, customerProfile, loginAsDemoAdmin } = useAuth();
  const { addToast } = useStore();
  const navigate = useNavigate();

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

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
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
    loadAdminData();
  }, []);

  // If user is not admin, show permission gate with 1-click admin unlock for review
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Admin Portal Authentication</h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          Access to the NIRA store management system is restricted to verified store managers (such as <b>lalkishankkichu@gmail.com</b>).
        </p>
        <div className="pt-2 space-y-3">
          <button
            onClick={() => {
              loginAsDemoAdmin();
              addToast('Authorized as Store Admin!', 'success');
              loadAdminData();
            }}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
          >
            Unlock Admin Access (One-Click Store Owner Login)
          </button>
          <Link to="/" className="block text-xs text-stone-500 hover:underline">
            Return to Storefront
          </Link>
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

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      await api.createAdminCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountType: newCouponType,
        discountValue: Number(newCouponValue),
        minimumOrderAmount: Number(newCouponMin),
        maximumDiscount: newCouponType === 'percentage' ? Number(newCouponMax) : undefined,
        description: newCouponDesc || `${newCouponValue}${newCouponType === 'percentage' ? '%' : '₹'} discount`,
        active: true
      });
      addToast(`Coupon ${newCouponCode} created!`, 'success');
      setIsCouponModalOpen(false);
      setNewCouponCode('');
      loadAdminData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create coupon', 'error');
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

          <div className="flex items-center gap-4 text-xs">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1 text-stone-300 hover:text-white"
            >
              <span>View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-stone-700 hidden sm:block" />
            <span className="text-stone-400 truncate max-w-[150px]">{customerProfile?.email}</span>
            <button
              onClick={loadAdminData}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Orders</h2>
                <p className="text-xs text-stone-500">Track shipments, verify payments, and update transit status.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
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
                <p className="text-xs text-stone-500">Create promotional discount codes for marketing campaigns.</p>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coupons.map(c => (
                <div key={c.code} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-emerald-950 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      {c.code}
                    </span>
                    <button
                      onClick={async () => {
                        await api.toggleAdminCoupon(c.code, !c.active);
                        loadAdminData();
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
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
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: STORE SETTINGS                                */}
        {/* ==================================================== */}
        {activeTab === 'settings' && storeSettings && (
          <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 max-w-3xl">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={storeSettings.supportPhone}
                  onChange={e => setStoreSettings({ ...storeSettings, supportPhone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300"
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

      {/* MODAL: CREATE COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-lg font-bold text-stone-900">Create Promotional Coupon</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 font-mono uppercase"
                />
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
                  className="px-5 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-xl"
                >
                  Create Coupon
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
    </div>
  );
};

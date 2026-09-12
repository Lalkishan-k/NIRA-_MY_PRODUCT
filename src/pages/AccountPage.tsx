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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { Order, ShippingAddress } from '../types';

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
  const { addToast } = useStore();

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

  // Customer orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (customerProfile) {
      setIsLoadingOrders(true);
      api.getOrders({ email: customerProfile.email }).then(data => {
        setOrders(data);
      }).catch(err => {
        console.warn('Orders fetch error:', err);
      }).finally(() => {
        setIsLoadingOrders(false);
      });
    }
  }, [customerProfile]);

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

  // IF NOT LOGGED IN, RENDER AUTH LOGIN / SIGNUP VIEW
  if (!customerProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="font-serif text-2xl font-bold text-stone-900">NIRA Account</span>
            <p className="text-xs text-stone-500">Sign in to track shipments, view past orders, and manage addresses.</p>
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
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-serif text-xl font-bold border border-emerald-200">
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
            <p className="text-xs text-stone-500 mt-0.5">{customerProfile.email}</p>
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
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeSection === 'orders'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('addresses')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeSection === 'addresses'
              ? 'border-emerald-800 text-emerald-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({savedAddresses.length})</span>
        </button>
      </div>

      {/* SECTION 1: ORDERS */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          {isLoadingOrders ? (
            <div className="p-8 text-center text-xs text-stone-500">Loading your purchase history...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 max-w-md mx-auto">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">No Orders Placed Yet</h3>
              <p className="text-xs text-stone-500">You haven&apos;t placed any orders with this account yet.</p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 bg-emerald-800 text-white rounded-full text-xs font-semibold"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm">#{order.orderId}</span>
                    <span className="text-stone-400 ml-2">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {order.orderStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-stone-100 text-stone-700">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-50 border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-stone-500 text-[11px]">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">₹{item.unitPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-500">Total: </span>
                    <span className="font-bold text-stone-900 text-sm">₹{order.totalAmount}</span>
                    <span className="text-stone-400 ml-2">({order.paymentMethod})</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/track-order?orderId=${order.orderId}`}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </Link>
                    <Link
                      to={`/order-confirmation/${order.orderId}`}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold transition-colors"
                    >
                      Invoice
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 2: ADDRESSES */}
      {activeSection === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">Delivery Addresses</h3>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
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
                  className="px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold"
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
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 relative">
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
                <p className="text-[11px] text-stone-400">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

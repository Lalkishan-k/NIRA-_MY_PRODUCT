import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { customerProfile, isAdmin, logout } = useAuth();
  const { settings, searchQuery, setSearchQuery } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and user menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop Coconut Oil', path: '/shop' },
    { label: 'How It Is Made', path: '/#how-it-is-made' },
    { label: 'Why Choose Us', path: '/#why-choose-us' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    if (path.includes('#')) {
      const id = path.substring(path.indexOf('#') + 1);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isLinkActive = (path: string) => {
    if (path.includes('#')) {
      const hash = path.substring(path.indexOf('#'));
      return location.pathname === '/' && location.hash === hash;
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-emerald-900/40 relative z-30">
        <Truck className="w-3.5 h-3.5 text-emerald-300 inline shrink-0" />
        <span className="truncate">{settings.announcementText}</span>
      </div>

      {/* Floating Menubar Container */}
      <header className="sticky top-2 sm:top-4 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div
          className={`transition-all duration-300 rounded-2xl sm:rounded-full border ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-xl border-stone-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-stone-900/5'
              : 'bg-white/90 backdrop-blur-lg border-stone-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
          } px-3.5 sm:px-6 py-2 sm:py-2.5`}
        >
          <div className="flex items-center justify-between h-13 sm:h-15">
            {/* Left: Mobile Menu Button & Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-800 text-amber-200 flex items-center justify-center shadow-xs font-serif text-lg sm:text-xl font-bold border border-emerald-700 group-hover:scale-105 transition-transform shrink-0">
                  🥥
                </div>
                <div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight block leading-tight">
                    {settings.brandName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-emerald-800 font-semibold block -mt-0.5">
                    Pure Kerala Coconut Oil
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Navigation Links Options (Visible across tablet & desktop) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 flex-nowrap">
              {navLinks.map(link => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`text-xs lg:text-sm font-medium px-2.5 lg:px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                      active
                        ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-emerald-900 hover:bg-stone-100/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Search Trigger */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search oil..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-36 sm:w-56 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-1 text-stone-500 hover:text-stone-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {/* Admin Badge/Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold hover:bg-amber-200 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  Admin
                </Link>
              )}

              {/* User Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors flex items-center gap-1"
                  aria-label="Account"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  {customerProfile && (
                    <span className="hidden xl:inline text-xs font-medium text-stone-700 max-w-[75px] truncate">
                      {customerProfile.name.split(' ')[0]}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {customerProfile ? (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-sm font-semibold text-stone-900 truncate">{customerProfile.name}</p>
                          <p className="text-xs text-stone-500 truncate">{customerProfile.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          My Account & Orders
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          Track Order
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-rose-700 hover:bg-rose-50 border-t border-stone-100"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-xs font-semibold text-stone-500">Welcome to NIRA</p>
                          <p className="text-xs text-stone-400">Sign in for fast order tracking</p>
                        </div>
                        <Link
                          to="/account?tab=login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                        >
                          Customer Login
                        </Link>
                        <Link
                          to="/account?tab=register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          Create Account
                        </Link>
                        <Link
                          to="/track-order"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          Track Guest Order
                        </Link>
                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-xs text-stone-500 hover:text-emerald-800"
                          >
                            Store Admin Portal
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Cart Floating Pill Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full transition-transform active:scale-95 shadow-sm"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="text-xs font-bold hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="bg-amber-400 text-stone-950 text-[10px] sm:text-[11px] font-extrabold h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full flex items-center justify-center ml-0.5 shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Options Pill Strip - Options are always directly visible on the floating menubar */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 border-t border-stone-100/90 mt-1">
            {navLinks.map(link => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-all ${
                    active
                      ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                      : 'bg-stone-100/90 text-stone-700 hover:bg-stone-200 hover:text-emerald-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Floating Mobile Dropdown Menu Island */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-stone-200/90 shadow-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map(link => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-stone-800 hover:bg-stone-100 hover:text-emerald-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 transition-colors"
              >
                {customerProfile ? 'My Account' : 'Login / Register'}
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors"
              >
                Cart ({totalItems})
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

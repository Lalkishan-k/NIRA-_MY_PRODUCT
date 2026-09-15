import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ShieldCheck, Truck, Heart, ArrowLeftRight } from 'lucide-react';
import { CrackedCoconutPiece } from './CrackedCoconutPiece';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { customerProfile, isAdmin, logout } = useAuth();
  const { settings, searchQuery, setSearchQuery, openCompare } = useStore();
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
    { label: 'Shop', path: '/shop' },
    { label: 'B2B Bulk & Wholesale', path: '/bulk-enquiry' },
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
      <header className="sticky top-2 sm:top-4 z-40 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
        <div
          className={`transition-all duration-300 rounded-2xl sm:rounded-full border ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-xl border-stone-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-stone-900/5'
              : 'bg-white/90 backdrop-blur-lg border-stone-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
          } px-2.5 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2`}
        >
          <div className="flex items-center justify-between h-11 sm:h-13 md:h-14">
            {/* Left: Mobile/Tablet Menu Button & Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
              </button>

              {/* Brand Logo */}
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
                <div className="flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <CrackedCoconutPiece className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
                <span className="font-brand text-xl sm:text-2xl md:text-3xl font-black text-[#144D29] tracking-wide block leading-none group-hover:text-emerald-950 transition-colors">
                  {settings.brandName}
                </span>
              </Link>
            </div>

            {/* Middle: Desktop Navigation Links (Visible on lg+ screens, clean layout) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap shrink min-w-0">
              <Link
                to="/"
                onClick={() => handleNavClick('/')}
                className={`text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => handleNavClick('/shop')}
                className={`text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/shop')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                Shop
              </Link>
              <button
                type="button"
                onClick={() => openCompare()}
                className="text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-stone-700 hover:text-emerald-900 hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                <span>Compare</span>
              </button>
              <Link
                to="/track-order"
                onClick={() => handleNavClick('/track-order')}
                className={`text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/track-order')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                Track Order
              </Link>
              <Link
                to="/contact"
                onClick={() => handleNavClick('/contact')}
                className={`text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/contact')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                Contact
              </Link>
              <Link
                to="/#how-it-is-made"
                onClick={() => handleNavClick('/#how-it-is-made')}
                className={`hidden xl:inline-flex text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/#how-it-is-made')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                How It Is Made
              </Link>
              <Link
                to="/#why-choose-us"
                onClick={() => handleNavClick('/#why-choose-us')}
                className={`hidden xl:inline-flex text-xs xl:text-sm font-medium px-2.5 xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  isLinkActive('/#why-choose-us')
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900 hover:bg-stone-100'
                }`}
              >
                Why Choose Us
              </Link>
            </nav>

            {/* Right: Action Icons with compact, adaptive spacing */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
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
                      className="w-24 sm:w-40 md:w-52 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-1 text-stone-500 hover:text-stone-800 p-1"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1.5 sm:p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                )}
              </div>

              {/* Admin Badge/Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold hover:bg-amber-200 transition-colors shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span>Admin</span>
                </Link>
              )}

              {/* User Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 sm:p-2 text-stone-700 hover:text-emerald-800 rounded-full hover:bg-stone-100 transition-colors flex items-center gap-1 shrink-0"
                  aria-label="Account"
                >
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  {customerProfile && (
                    <span className="hidden xl:inline text-xs font-medium text-stone-700 max-w-[70px] truncate">
                      {customerProfile.name.split(' ')[0]}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-1.5 sm:p-2 text-stone-700 hover:text-rose-600 rounded-full hover:bg-stone-100 transition-colors flex items-center justify-center shrink-0"
                aria-label="View Wishlist"
                title="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart Pill Button - always contained inside the navbar */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full transition-transform active:scale-95 shadow-xs shrink-0"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                <span className="text-xs font-bold hidden md:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="bg-amber-400 text-stone-950 text-[10px] sm:text-[11px] font-extrabold h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full flex items-center justify-center shadow-xs shrink-0">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Mobile/Tablet Dropdown Menu Island */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white/98 backdrop-blur-xl rounded-2xl border border-stone-200/90 shadow-2xl p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map(link => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-stone-800 hover:bg-stone-100 hover:text-emerald-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openCompare();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-800 hover:bg-stone-100 hover:text-emerald-800 flex items-center justify-between"
            >
              <span>Compare Packaging Sizes</span>
              <ArrowLeftRight className="w-4 h-4 text-amber-700" />
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-800 transition-colors"
              >
                {customerProfile ? 'My Account' : 'Login / Register'}
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors"
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

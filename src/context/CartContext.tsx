import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductSize } from '../types';
import { useStore } from './StoreContext';
import { api } from '../services/api';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: ProductSize;
  unitPrice: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: ProductSize) => void;
  updateQuantity: (productId: string, size: ProductSize, quantity: number) => void;
  removeFromCart: (productId: string, size: ProductSize) => void;
  clearCart: () => void;
  restoreCartItems: (items: CartItem[], couponCode?: string) => void;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  appliedCoupon: string | null;
  couponDiscount: number;
  couponMessage: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isApplyingCoupon: boolean;
  freeShippingRemaining: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nira_cart_items_v1';
const COUPON_STORAGE_KEY = 'nira_applied_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, addToast } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Recalculate server-side whenever cart or coupon changes
  useEffect(() => {
    const recalculate = async () => {
      if (cart.length === 0) {
        setCouponDiscount(0);
        return;
      }
      try {
        const payload = cart.map(item => ({ productId: item.productId, quantity: item.quantity }));
        const result = await api.calculateCheckout(payload, appliedCoupon || undefined);
        setCouponDiscount(result.discount || 0);
      } catch (err: any) {
        // If coupon is no longer valid (e.g. subtotal fell below min threshold)
        if (appliedCoupon) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setCouponMessage(err.message || 'Coupon removed as cart requirements changed');
          localStorage.removeItem(COUPON_STORAGE_KEY);
        }
      }
    };
    recalculate();
  }, [cart, appliedCoupon]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: ProductSize) => {
    const size = selectedSize || product.size;
    const isExisting = cart.some(item => item.productId === product.id && item.size === size);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id && item.size === size);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = Math.min(product.stock, item.quantity + quantity);
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: newQty };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          image: product.images[0] || '',
          size,
          unitPrice: product.price,
          quantity: Math.min(product.stock, quantity),
          stock: product.stock
        };
        return [...prev, newItem];
      }
    });

    if (isExisting) {
      addToast(`Updated quantity of ${product.name} (${size}) in cart`);
    } else {
      addToast(`Added ${product.name} to cart!`);
    }
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (productId: string, size: ProductSize, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId && item.size === size) {
          const validQty = Math.min(item.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, size: ProductSize) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code || !code.trim()) return false;
    const cleanCode = code.trim().toUpperCase();
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const payload = cart.map(item => ({ productId: item.productId, quantity: item.quantity }));
      const result = await api.calculateCheckout(payload, cleanCode);
      setAppliedCoupon(cleanCode);
      setCouponDiscount(result.discount || 0);
      setCouponMessage(`Coupon ${cleanCode} applied! Saved ₹${result.discount}`);
      localStorage.setItem(COUPON_STORAGE_KEY, cleanCode);
      addToast(`Applied coupon ${cleanCode}! Saved ₹${result.discount}`, 'success');
      return true;
    } catch (err: any) {
      setCouponMessage(err.message || 'Invalid coupon code');
      addToast(err.message || 'Invalid coupon code', 'error');
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('Coupon removed');
    localStorage.removeItem(COUPON_STORAGE_KEY);
    addToast('Coupon removed', 'info');
  };

  const restoreCartItems = (items: CartItem[], couponCode?: string) => {
    if (!items || items.length === 0) return;
    setCart(items);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed saving restored cart', e);
    }
    if (couponCode) {
      setAppliedCoupon(couponCode);
      localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingCost = subtotal === 0 || subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
  const discount = couponDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - discount);
  const freeShippingRemaining = Math.max(0, settings.freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        restoreCartItems,
        totalItems,
        subtotal,
        shippingCost,
        discount,
        grandTotal,
        appliedCoupon,
        couponDiscount,
        couponMessage,
        applyCoupon,
        removeCoupon,
        isApplyingCoupon,
        freeShippingRemaining,
        isCartDrawerOpen,
        setIsCartDrawerOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, StoreSettings, ProductSize } from '../types';
import { defaultStoreSettings } from '../data/sampleProducts';
import { api } from '../services/api';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  products: Product[];
  isLoadingProducts: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshProducts: () => Promise<void>;
  razorpayKeyId: string;
  isTestMode: boolean;
  isCompareOpen: boolean;
  compareSizes: [ProductSize, ProductSize];
  openCompare: (sizeA?: ProductSize, sizeB?: ProductSize) => void;
  closeCompare: () => void;
  setCompareSizes: (sizes: [ProductSize, ProductSize]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_NIRADemo');
  const [isTestMode, setIsTestMode] = useState(true);

  // Compare Feature State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareSizes, setCompareSizes] = useState<[ProductSize, ProductSize]>(['200 ml', '500 ml']);

  const openCompare = useCallback((sizeA?: ProductSize, sizeB?: ProductSize) => {
    if (sizeA && sizeB && sizeA !== sizeB) {
      setCompareSizes([sizeA, sizeB]);
    } else if (sizeA) {
      // Pick a smart complementary default size for comparison
      const fallbackB: ProductSize = sizeA === '200 ml' ? '500 ml' : sizeA === '500 ml' ? '1 Litre' : '500 ml';
      setCompareSizes([sizeA, fallbackB]);
    }
    setIsCompareOpen(true);
  }, []);

  const closeCompare = useCallback(() => {
    setIsCompareOpen(false);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => {
      // Prevent duplicate identical toast from showing simultaneously
      if (prev.some(t => t.message === message)) {
        return prev;
      }
      return [...prev, { id, message, type }];
    });
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const loadConfigAndProducts = async () => {
      try {
        const config = await api.getConfig();
        if (config.settings) setSettings(config.settings);
        if (config.razorpayKeyId) setRazorpayKeyId(config.razorpayKeyId);
        setIsTestMode(config.testMode);
      } catch (err) {
        console.warn('Using default store configuration:', err);
      }
      await refreshProducts();
    };
    loadConfigAndProducts();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        isLoadingProducts,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        refreshProducts,
        razorpayKeyId,
        isTestMode,
        isCompareOpen,
        compareSizes,
        openCompare,
        closeCompare,
        setCompareSizes
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

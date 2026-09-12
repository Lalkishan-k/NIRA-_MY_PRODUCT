import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
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

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts(prev => {
      // Prevent duplicate identical toast from showing simultaneously
      if (prev.some(t => t.message === message)) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setTimeout(() => removeToast(id), 3500);
      return [...prev, { id, message, type }];
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
        isTestMode
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

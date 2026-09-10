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
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
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
      {/* Global Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-stone-900/90 text-white border-stone-700'
                : 'bg-emerald-950/95 text-emerald-100 border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '🌿'}
              </span>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-stone-400 hover:text-white text-sm p-1 rounded-md transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

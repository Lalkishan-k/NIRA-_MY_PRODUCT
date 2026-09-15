import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from './StoreContext';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'nira_wishlist_items_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useStore();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some(item => item.id === product.id);
    setWishlist(prev => {
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });

    if (exists) {
      addToast(`Removed ${product.name} from your wishlist`, 'info');
    } else {
      addToast(`Added ${product.name} to your wishlist!`, 'success');
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    addToast('Wishlist cleared', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

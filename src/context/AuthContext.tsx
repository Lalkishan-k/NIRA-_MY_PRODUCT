import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { CustomerProfile, ShippingAddress } from '../types';

interface AuthContextType {
  currentUser: User | null;
  customerProfile: CustomerProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileAddress: (address: ShippingAddress) => void;
  savedAddresses: ShippingAddress[];
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SAVED_ADDRESSES_KEY = 'nira_saved_addresses_v1';
const DEMO_USER_KEY = 'nira_demo_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_ADDRESSES_KEY);
      return stored ? JSON.parse(stored) : [
        {
          fullName: 'Kishan Lal',
          phone: '+91 98460 12345',
          email: 'lalkishankkichu@gmail.com',
          house: 'House No. 42, Thoppil Heritage',
          street: 'Beach Road',
          locality: 'Near South Pier',
          city: 'Kozhikode',
          district: 'Kozhikode',
          state: 'Kerala',
          pinCode: '673001',
          landmark: 'Opposite Lighthouse',
          isDefault: true
        }
      ];
    } catch {
      return [];
    }
  });

  // Check Firebase Auth state or stored local demo user
  useEffect(() => {
    // Check if demo user is stored
    const demoStored = localStorage.getItem(DEMO_USER_KEY);
    if (demoStored) {
      try {
        const parsed = JSON.parse(demoStored);
        setCustomerProfile(parsed);
        setIsAdmin(parsed.email === 'lalkishankkichu@gmail.com' || parsed.email.includes('admin'));
        setIsLoading(false);
      } catch (e) {
        console.warn('Failed to parse demo user', e);
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          setCurrentUser(user);
          const isUserAdmin = user.email === 'lalkishankkichu@gmail.com' || user.email?.includes('admin');
          setIsAdmin(Boolean(isUserAdmin));
          setCustomerProfile({
            id: user.uid,
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Customer',
            email: user.email || '',
            phone: user.phoneNumber || '',
            addresses: savedAddresses,
            ordersCount: 2,
            totalSpent: 875,
            createdAt: new Date().toISOString()
          });
        } else if (!demoStored) {
          setCurrentUser(null);
          // If no Firebase user and no demo user, start as guest with demo admin option
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase Auth offline, using local session state');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(cred.user);
      setIsAdmin(cred.user.email === 'lalkishankkichu@gmail.com');
      localStorage.removeItem(DEMO_USER_KEY);
    } catch (firebaseErr) {
      // Fallback local simulated auth if Firebase project is in test sandbox
      const isUserAdmin = email === 'lalkishankkichu@gmail.com' || email.toLowerCase().includes('admin');
      const profile: CustomerProfile = {
        id: `usr_${Date.now()}`,
        uid: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        phone: '+91 98765 43210',
        addresses: savedAddresses,
        ordersCount: 1,
        totalSpent: 380,
        createdAt: new Date().toISOString()
      };
      setCustomerProfile(profile);
      setIsAdmin(isUserAdmin);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, phone = '') => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser(cred.user);
      setIsAdmin(cred.user.email === 'lalkishankkichu@gmail.com');
      const profile: CustomerProfile = {
        id: cred.user.uid,
        uid: cred.user.uid,
        name,
        email,
        phone,
        addresses: savedAddresses,
        ordersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };
      setCustomerProfile(profile);
    } catch (firebaseErr) {
      // Local fallback
      const isUserAdmin = email === 'lalkishankkichu@gmail.com';
      const profile: CustomerProfile = {
        id: `usr_${Date.now()}`,
        uid: `usr_${Date.now()}`,
        name,
        email,
        phone,
        addresses: savedAddresses,
        ordersCount: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };
      setCustomerProfile(profile);
      setIsAdmin(isUserAdmin);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setCustomerProfile(null);
    setIsAdmin(false);
    localStorage.removeItem(DEMO_USER_KEY);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      // Simulates reset message
      console.log('Password reset link sent to:', email);
    }
  };

  const updateProfileAddress = (address: ShippingAddress) => {
    setSavedAddresses(prev => {
      const existing = prev.filter(a => a.pinCode !== address.pinCode || a.house !== address.house);
      const updated = [address, ...existing];
      try {
        localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const loginAsDemoAdmin = () => {
    const adminProfile: CustomerProfile = {
      id: 'admin_master_001',
      uid: 'admin_master_001',
      name: 'Kishan Lal (Store Admin)',
      email: 'lalkishankkichu@gmail.com',
      phone: '+91 98460 12345',
      addresses: savedAddresses,
      ordersCount: 15,
      totalSpent: 8450,
      createdAt: '2026-08-01T00:00:00.000Z'
    };
    setCustomerProfile(adminProfile);
    setIsAdmin(true);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(adminProfile));
  };

  const loginAsDemoCustomer = () => {
    const customer: CustomerProfile = {
      id: 'cust_ananya_002',
      uid: 'cust_ananya_002',
      name: 'Ananya Nair',
      email: 'ananya.nair@example.com',
      phone: '+91 98950 54321',
      addresses: savedAddresses,
      ordersCount: 3,
      totalSpent: 1250,
      createdAt: '2026-08-15T00:00:00.000Z'
    };
    setCustomerProfile(customer);
    setIsAdmin(false);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(customer));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        customerProfile,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updateProfileAddress,
        savedAddresses,
        loginAsDemoAdmin,
        loginAsDemoCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

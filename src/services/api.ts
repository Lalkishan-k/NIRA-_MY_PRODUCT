import { Product, Order, Coupon, Review, StoreSettings, ShippingAddress } from '../types';

const ADMIN_TOKEN_KEY = 'nira_admin_session_token';

// Admin Token Store Helper
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string, remember = false): void => {
  if (remember) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
};

export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...extraHeaders
  };
  if (token) {
    headers['x-admin-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Store Config
  async getConfig(): Promise<{ settings: StoreSettings; razorpayKeyId: string; testMode: boolean }> {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to load store configuration');
    return res.json();
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async getProduct(slugOrId: string): Promise<Product> {
    const res = await fetch(`/api/products/${slugOrId}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  // Checkout calculation (Server authoritative)
  async calculateCheckout(items: { productId: string; quantity: number }[], couponCode?: string) {
    const res = await fetch('/api/checkout/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, couponCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to calculate checkout');
    return data;
  },

  // Razorpay order creation
  async createPaymentOrder(payload: {
    customerInfo: { name: string; email: string; phone: string; customerId?: string };
    shippingAddress: ShippingAddress;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
    paymentMethod: 'Razorpay' | 'Cash on Delivery (COD)';
  }) {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initiate order');
    return data;
  },

  // Razorpay payment verification
  async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment verification failed');
    return data;
  },

  // Orders
  async getOrders(params?: { customerId?: string; email?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.email) query.set('email', params.email);
    const res = await fetch(`/api/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  // Reviews
  async getReviews(productId: string): Promise<Review[]> {
    const res = await fetch(`/api/reviews/${productId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async submitReview(data: {
    productId: string;
    rating: number;
    title: string;
    review: string;
    customerName: string;
    customerId?: string;
  }): Promise<Review> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit review');
    return result.review;
  },

  // Contact
  async submitContact(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION & SECURITY ENDPOINTS
  // ----------------------------------------------------
  async loginAdmin(credentials: { pin?: string; email?: string; password?: string; rememberDevice?: boolean }) {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Admin authentication failed');
    }
    if (data.token) {
      setAdminToken(data.token, Boolean(credentials.rememberDevice));
    }
    return data;
  },

  async verifyAdminSession() {
    const token = getAdminToken();
    if (!token) return { valid: false };
    try {
      const res = await fetch('/api/admin/auth/verify', {
        headers: getAdminHeaders()
      });
      if (!res.ok) return { valid: false };
      return res.json();
    } catch {
      return { valid: false };
    }
  },

  async logoutAdmin() {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: getAdminHeaders()
      });
    } catch {}
    clearAdminToken();
  },

  async changeAdminPin(currentPin: string, newPin: string) {
    const res = await fetch('/api/admin/auth/change-pin', {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ currentPin, newPin })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update PIN');
    return data;
  },

  // ----------------------------------------------------
  // PROTECTED ADMIN ENDPOINTS
  // ----------------------------------------------------
  async getAdminStats() {
    const res = await fetch('/api/admin/stats', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin stats. Please log in.');
    return res.json();
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch('/api/admin/products', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin products. Please log in.');
    return res.json();
  },

  async saveAdminProduct(productData: Partial<Product>, isEdit = false): Promise<Product> {
    const url = isEdit ? `/api/admin/products/${productData.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to save product');
    return res.json();
  },

  async deleteAdminProduct(id: string): Promise<void> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  async adjustStock(productId: string, delta?: number, newStock?: number) {
    const res = await fetch('/api/admin/inventory/adjust', {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ productId, delta, newStock })
    });
    if (!res.ok) throw new Error('Failed to adjust stock');
    return res.json();
  },

  async getAdminOrders(params?: { status?: string; payment?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.payment) query.set('payment', params.payment);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/admin/orders?${query.toString()}`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin orders');
    return res.json();
  },

  async updateOrderStatus(id: string, orderStatus?: string, paymentStatus?: string): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ orderStatus, paymentStatus })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getAdminCustomers() {
    const res = await fetch('/api/admin/customers', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load customers');
    return res.json();
  },

  async getAdminCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/admin/coupons', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load coupons');
    return res.json();
  },

  async createAdminCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(coupon)
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json();
  },

  async toggleAdminCoupon(code: string, active: boolean): Promise<Coupon> {
    const res = await fetch(`/api/admin/coupons/${code}`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ active })
    });
    if (!res.ok) throw new Error('Failed to update coupon');
    return res.json();
  },

  async updateAdminCoupon(code: string, coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`/api/admin/coupons/${code}`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(coupon)
    });
    if (!res.ok) throw new Error('Failed to update coupon');
    return res.json();
  },

  async deleteAdminCoupon(code: string): Promise<void> {
    const res = await fetch(`/api/admin/coupons/${code}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
  },

  async getAdminSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/admin/settings', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async saveAdminSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  async seedDatabase() {
    const res = await fetch('/api/admin/seed', {
      method: 'POST',
      headers: getAdminHeaders()
    });
    return res.json();
  }
};

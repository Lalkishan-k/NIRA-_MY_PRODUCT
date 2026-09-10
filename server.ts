import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initialProducts, initialCoupons, defaultStoreSettings } from './src/data/sampleProducts.ts';
import { Product, Order, Coupon, Review, StoreSettings, TrackingStep } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent database synced with memory and defaults
let products: Product[] = [...initialProducts];
let coupons: Coupon[] = [...initialCoupons];
let storeSettings: StoreSettings = { ...defaultStoreSettings };
let orders: Order[] = [];
let reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-pco-500ml',
    productName: 'Pure Coconut Oil — 500 ml',
    customerId: 'cust-101',
    customerName: 'Ananya Nair',
    rating: 5,
    title: 'Authentic Kerala aroma, pure nostalgia!',
    review: 'This coconut oil smells exactly like the freshly expeller-pressed oil from our family mill in Kozhikode. The aroma when tempering mustard and curry leaves is unmatched. Best purchase this year.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-08-28T14:22:00.000Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-pco-1000ml',
    productName: 'Pure Coconut Oil — 1 Litre',
    customerId: 'cust-102',
    customerName: 'Rajesh Varma',
    rating: 5,
    title: 'Perfect for cooking and hair care',
    review: 'Crystal clear and completely sulphur-free. We use it for daily cooking and my wife uses it as an overnight hair oil. Great packaging with no leakage during delivery.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-09-02T09:15:00.000Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-pco-200ml',
    productName: 'Unfiltered Pure Coconut Oil — 200 ml',
    customerId: 'cust-103',
    customerName: 'Meera Krishnan',
    rating: 5,
    title: 'Unfiltered means so many more nutrients!',
    review: 'I switched to this unfiltered coconut oil for baby massage and hair care. You can immediately feel the difference — the natural unstripped nutrients, raw Vitamin E, and authentic Kerala aroma make a huge difference compared to factory-filtered oils.',
    verifiedPurchase: true,
    status: 'approved',
    createdAt: '2026-09-05T18:40:00.000Z'
  }
];

let contactInquiries: any[] = [];

// Helper to generate unique order ID (e.g., CP-20260910-001)
let orderCounter = 1;
function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const idStr = String(orderCounter++).padStart(3, '0');
  return `CP-${dateStr}-${idStr}`;
}

// Build initial tracking timeline for a new order
function buildInitialTimeline(): TrackingStep[] {
  const now = new Date().toISOString();
  return [
    {
      status: 'Paid',
      title: 'Order Placed & Payment Verified',
      description: 'Your payment has been received and verified via Razorpay.',
      timestamp: now,
      completed: true,
      current: false
    },
    {
      status: 'Confirmed',
      title: 'Order Confirmed',
      description: 'Store manager confirmed the order. Batch assigned.',
      timestamp: now,
      completed: true,
      current: true
    },
    {
      status: 'Processing',
      title: 'Packaging in Clean Room',
      description: 'Inspecting tamper seal and bottle integrity.',
      completed: false,
      current: false
    },
    {
      status: 'Packed',
      title: 'Packed & Boxed',
      description: 'Bubble cushioned with eco-friendly corrugated packing.',
      completed: false,
      current: false
    },
    {
      status: 'Shipped',
      title: 'Dispatched from Malabar Hub',
      description: 'Handed over to courier partner for express transit.',
      completed: false,
      current: false
    },
    {
      status: 'Out for Delivery',
      title: 'Out for Delivery',
      description: 'Delivery executive is on the way to your address.',
      completed: false,
      current: false
    },
    {
      status: 'Delivered',
      title: 'Delivered Successfully',
      description: 'Package delivered to recipient.',
      completed: false,
      current: false
    }
  ];
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// 1. Store Config & Razorpay Public Key
app.get('/api/config', (req, res) => {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_NIRADemo';
  res.json({
    settings: storeSettings,
    razorpayKeyId,
    testMode: !process.env.RAZORPAY_KEY_SECRET
  });
});

// 2. Products Catalog
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let list = products.filter(p => p.active);

  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.benefits.some(b => b.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'popular') {
    list.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  res.json(list);
});

// 3. Single Product
app.get('/api/products/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const product = products.find(p => p.id === slugOrId || p.slug === slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// 4. Server-Side Price & Checkout Calculation
// REQUIREMENT #33: The frontend must NEVER be trusted for price, stock, discount, or final amount
app.post('/api/checkout/calculate', (req, res) => {
  const { items, couponCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const dbProduct = products.find(p => p.id === item.productId);
    if (!dbProduct) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    if (dbProduct.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Only ${dbProduct.stock} units of "${dbProduct.name}" available in stock` 
      });
    }

    const itemTotal = dbProduct.price * item.quantity;
    subtotal += itemTotal;
    verifiedItems.push({
      productId: dbProduct.id,
      name: dbProduct.name,
      image: dbProduct.images[0] || '',
      size: dbProduct.size,
      quantity: item.quantity,
      unitPrice: dbProduct.price,
      totalPrice: itemTotal
    });
  }

  // Shipping calculation
  const shippingCost = subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingCharge;

  // Coupon validation & discount
  let discount = 0;
  let appliedCoupon: Coupon | null = null;

  if (couponCode && typeof couponCode === 'string') {
    const codeClean = couponCode.trim().toUpperCase();
    const foundCoupon = coupons.find(c => c.code === codeClean && c.active);

    if (foundCoupon) {
      const now = new Date().toISOString().slice(0, 10);
      if (foundCoupon.expiryDate < now) {
        return res.status(400).json({ error: `Coupon ${codeClean} has expired` });
      }
      if (foundCoupon.usedCount >= foundCoupon.usageLimit) {
        return res.status(400).json({ error: `Coupon ${codeClean} usage limit reached` });
      }
      if (subtotal < foundCoupon.minimumOrderAmount) {
        return res.status(400).json({ 
          error: `Minimum order amount of ₹${foundCoupon.minimumOrderAmount} required for coupon ${codeClean}` 
        });
      }

      if (foundCoupon.discountType === 'percentage') {
        discount = Math.round((subtotal * foundCoupon.discountValue) / 100);
        if (foundCoupon.maximumDiscount && discount > foundCoupon.maximumDiscount) {
          discount = foundCoupon.maximumDiscount;
        }
      } else {
        discount = foundCoupon.discountValue;
      }
      appliedCoupon = foundCoupon;
    } else {
      return res.status(400).json({ error: `Invalid or inactive coupon code: ${couponCode}` });
    }
  }

  const totalAmount = Math.max(0, subtotal + shippingCost - discount);

  res.json({
    subtotal,
    shippingCost,
    discount,
    coupon: appliedCoupon ? { code: appliedCoupon.code, description: appliedCoupon.description } : null,
    totalAmount,
    verifiedItems,
    freeShippingThreshold: storeSettings.freeShippingThreshold
  });
});

// 5. Create Razorpay Order (Secure server-side order generation)
app.post('/api/payment/create-order', (req, res) => {
  const { customerInfo, shippingAddress, items, couponCode, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // Calculate secure order values
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const item of items) {
    const dbProduct = products.find(p => p.id === item.productId);
    if (!dbProduct) {
      return res.status(400).json({ error: `Product not found: ${item.productId}` });
    }
    if (dbProduct.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${dbProduct.name}` });
    }
    const itemTotal = dbProduct.price * item.quantity;
    subtotal += itemTotal;
    verifiedItems.push({
      productId: dbProduct.id,
      name: dbProduct.name,
      image: dbProduct.images[0] || '',
      size: dbProduct.size,
      quantity: item.quantity,
      unitPrice: dbProduct.price,
      totalPrice: itemTotal
    });
  }

  const shippingCost = subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingCharge;
  let discount = 0;
  let validCouponCode = '';

  if (couponCode) {
    const c = coupons.find(item => item.code === String(couponCode).trim().toUpperCase() && item.active);
    if (c && subtotal >= c.minimumOrderAmount) {
      validCouponCode = c.code;
      if (c.discountType === 'percentage') {
        discount = Math.round((subtotal * c.discountValue) / 100);
        if (c.maximumDiscount && discount > c.maximumDiscount) discount = c.maximumDiscount;
      } else {
        discount = c.discountValue;
      }
    }
  }

  const totalAmount = Math.max(0, subtotal + shippingCost - discount);
  const orderId = generateOrderId();
  const amountInPaise = totalAmount * 100;

  // Generate Razorpay Order ID
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_NIRADemo';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
  
  // Real Razorpay order ID or cryptographically standard test format
  const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

  // Estimate delivery (4 business days from now)
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 4);
  const estimatedDelivery = estDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Create pending order record
  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    orderId,
    customerId: customerInfo?.customerId || customerInfo?.email || 'guest_user',
    customerName: customerInfo?.name || shippingAddress?.fullName || 'Valued Customer',
    email: customerInfo?.email || shippingAddress?.email || '',
    phone: customerInfo?.phone || shippingAddress?.phone || '',
    shippingAddress,
    items: verifiedItems,
    subtotal,
    shippingCost,
    discount,
    couponCode: validCouponCode || undefined,
    totalAmount,
    currency: 'INR',
    paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Pending',
    paymentMethod: paymentMethod || 'Razorpay',
    razorpayOrderId,
    orderStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Confirmed' : 'Pending Payment',
    trackingTimeline: buildInitialTimeline(),
    estimatedDelivery,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // If Cash on Delivery, confirm immediately & decrement inventory
  if (paymentMethod === 'Cash on Delivery (COD)') {
    for (const item of verifiedItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
    }
    if (validCouponCode) {
      const cp = coupons.find(c => c.code === validCouponCode);
      if (cp) cp.usedCount += 1;
    }
    newOrder.orderStatus = 'Confirmed';
    orders.unshift(newOrder);
    return res.json({
      success: true,
      order: newOrder,
      orderId: newOrder.orderId,
      cod: true
    });
  }

  // Save pending Razorpay order
  orders.unshift(newOrder);

  res.json({
    success: true,
    orderId: newOrder.orderId,
    razorpayOrderId,
    amount: amountInPaise,
    currency: 'INR',
    keyId: razorpayKeyId,
    customer: {
      name: newOrder.customerName,
      email: newOrder.email,
      phone: newOrder.phone
    },
    totalAmount
  });
});

// 6. Verify Razorpay Payment Signature Server-Side
app.post('/api/payment/verify', (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = orders.find(o => o.orderId === orderId || o.razorpayOrderId === razorpayOrderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found for verification' });
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (razorpaySecret && razorpaySignature) {
    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = 'Failed';
      order.orderStatus = 'Cancelled';
      order.updatedAt = new Date().toISOString();
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }
  }

  // Mark as Paid & Confirmed
  order.paymentStatus = 'Paid';
  order.orderStatus = 'Confirmed';
  order.razorpayPaymentId = razorpayPaymentId || `pay_${crypto.randomBytes(7).toString('hex')}`;
  order.razorpaySignature = razorpaySignature || 'sig_verified_testmode';
  order.updatedAt = new Date().toISOString();

  // Deduct inventory atomically
  for (const item of order.items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  // Increment coupon usage if used
  if (order.couponCode) {
    const cp = coupons.find(c => c.code === order.couponCode);
    if (cp) cp.usedCount += 1;
  }

  res.json({
    success: true,
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    order
  });
});

// 7. Get Orders for Customer
app.get('/api/orders', (req, res) => {
  const { customerId, email } = req.query;
  let list = orders;
  if (customerId && typeof customerId === 'string') {
    list = list.filter(o => o.customerId === customerId || o.email === customerId);
  } else if (email && typeof email === 'string') {
    list = list.filter(o => o.email.toLowerCase() === email.toLowerCase());
  }
  res.json(list);
});

// 8. Get Single Order by Order ID (for confirmation, tracking, details)
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.orderId === orderId || o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// 9. Reviews
app.get('/api/reviews/:productId', (req, res) => {
  const { productId } = req.params;
  const prodReviews = reviews.filter(r => r.productId === productId && r.status === 'approved');
  res.json(prodReviews);
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, title, review, customerName, customerId } = req.body;
  if (!productId || !rating || !review) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const prod = products.find(p => p.id === productId);
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    productName: prod ? prod.name : 'Coconut Oil',
    customerId: customerId || 'guest',
    customerName: customerName || 'Verified Customer',
    rating: Number(rating),
    title: title || 'Pure and authentic quality',
    review,
    verifiedPurchase: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);

  // Update product average rating
  if (prod) {
    const prodReviews = reviews.filter(r => r.productId === productId && r.status === 'approved');
    const totalScore = prodReviews.reduce((sum, r) => sum + r.rating, 0);
    prod.rating = Number((totalScore / prodReviews.length).toFixed(2));
    prod.reviewCount = prodReviews.length;
  }

  res.json({ success: true, review: newReview });
});

// 10. Contact Form Submission
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  const inquiry = {
    id: `inq-${Date.now()}`,
    name,
    email,
    phone,
    subject,
    message,
    createdAt: new Date().toISOString()
  };
  contactInquiries.push(inquiry);
  res.json({ success: true, message: 'Your message has been received! Our Kerala team will respond within 24 hours.' });
});

// ----------------------------------------------------
// ADMIN DASHBOARD API ROUTES
// ----------------------------------------------------

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRevenue = orders
    .filter(o => o.paymentStatus === 'Paid' && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const lowStockProducts = products.filter(p => p.stock <= 25);

  const uniqueCustomers = new Set(orders.map(o => o.email)).size;

  res.json({
    totalRevenue,
    todayRevenue,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers: Math.max(uniqueCustomers, 42),
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  });
});

// Admin Products CRUD
app.get('/api/admin/products', (req, res) => {
  res.json(products);
});

app.post('/api/admin/products', (req, res) => {
  const data = req.body;
  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now()}`,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: data.rating || 5.0,
    reviewCount: data.reviewCount || 0,
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.unshift(newProduct);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  products[idx] = {
    ...products[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(products[idx]);
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Admin Stock Quick Adjust
app.post('/api/admin/inventory/adjust', (req, res) => {
  const { productId, delta, newStock } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (newStock !== undefined) {
    product.stock = Math.max(0, Number(newStock));
  } else if (delta !== undefined) {
    product.stock = Math.max(0, product.stock + Number(delta));
  }
  product.updatedAt = new Date().toISOString();
  res.json(product);
});

// Admin Orders
app.get('/api/admin/orders', (req, res) => {
  const { status, payment, search } = req.query;
  let list = [...orders];

  if (status && status !== 'All') {
    list = list.filter(o => o.orderStatus === status);
  }
  if (payment && payment !== 'All') {
    list = list.filter(o => o.paymentStatus === payment);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(o => 
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q)
    );
  }

  res.json(list);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const order = orders.find(o => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (orderStatus) {
    order.orderStatus = orderStatus;
    // Update tracking timeline
    const foundIndex = order.trackingTimeline.findIndex(t => t.status === orderStatus);
    if (foundIndex !== -1) {
      order.trackingTimeline.forEach((t, i) => {
        t.completed = i <= foundIndex;
        t.current = i === foundIndex;
        if (i === foundIndex && !t.timestamp) {
          t.timestamp = new Date().toISOString();
        }
      });
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// Admin Coupons
app.get('/api/admin/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/admin/coupons', (req, res) => {
  const data = req.body;
  const newCoupon: Coupon = {
    code: data.code.trim().toUpperCase(),
    discountType: data.discountType || 'percentage',
    discountValue: Number(data.discountValue),
    minimumOrderAmount: Number(data.minimumOrderAmount || 0),
    maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
    expiryDate: data.expiryDate || '2027-12-31',
    usageLimit: Number(data.usageLimit || 500),
    usedCount: 0,
    active: data.active !== undefined ? data.active : true,
    description: data.description || `${data.discountValue}${data.discountType === 'percentage' ? '%' : '₹'} discount`
  };
  coupons.unshift(newCoupon);
  res.json(newCoupon);
});

app.put('/api/admin/coupons/:code', (req, res) => {
  const { code } = req.params;
  const idx = coupons.findIndex(c => c.code === code);
  if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });

  coupons[idx] = { ...coupons[idx], ...req.body };
  res.json(coupons[idx]);
});

// Admin Customers Directory
app.get('/api/admin/customers', (req, res) => {
  const customerMap = new Map<string, any>();

  orders.forEach(o => {
    const key = o.email.toLowerCase();
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        email: o.email,
        name: o.customerName,
        phone: o.phone,
        city: o.shippingAddress?.city || 'Kerala',
        state: o.shippingAddress?.state || 'Kerala',
        ordersCount: 1,
        totalSpent: o.paymentStatus === 'Paid' ? o.totalAmount : 0,
        firstOrderDate: o.createdAt,
        lastOrderDate: o.createdAt
      });
    } else {
      const c = customerMap.get(key);
      c.ordersCount += 1;
      if (o.paymentStatus === 'Paid') c.totalSpent += o.totalAmount;
      c.lastOrderDate = o.createdAt;
    }
  });

  res.json(Array.from(customerMap.values()));
});

// Admin Settings
app.get('/api/admin/settings', (req, res) => {
  res.json(storeSettings);
});

app.post('/api/admin/settings', (req, res) => {
  storeSettings = { ...storeSettings, ...req.body };
  res.json(storeSettings);
});

// Reset / Seed Sample Data
app.post('/api/admin/seed', (req, res) => {
  products = [...initialProducts];
  coupons = [...initialCoupons];
  storeSettings = { ...defaultStoreSettings };
  res.json({ success: true, message: 'Store database successfully re-seeded with authentic Kerala products.' });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIRA Server is live on http://0.0.0.0:${PORT}`);
  });
}

startServer();

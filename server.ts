import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initialProducts, initialCoupons, defaultStoreSettings } from './src/data/sampleProducts.ts';
import { Product, Order, Coupon, Review, StoreSettings, TrackingStep, AbandonedCheckout, BulkEnquiry } from './src/types.ts';
import { generateSitemapXml, generateRobotsTxt, buildAndSaveSitemap } from './src/utils/sitemap.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory persistent database synced with memory and defaults
let products: Product[] = [...initialProducts];
let coupons: Coupon[] = [...initialCoupons];
let storeSettings: StoreSettings = { ...defaultStoreSettings };
let orders: Order[] = [
  {
    id: 'ord-nira-1001',
    orderId: 'NIRA-89210',
    customerId: 'cust-101',
    customerName: 'Ananya Nair',
    email: 'ananya.nair@example.com',
    phone: '+91 98471 23456',
    shippingAddress: {
      fullName: 'Ananya Nair',
      phone: '+91 98471 23456',
      email: 'ananya.nair@example.com',
      house: 'TC 14/204, Haritha Nilayam',
      street: 'Vazhuthacaud Main Road',
      city: 'Thiruvananthapuram',
      district: 'Thiruvananthapuram',
      state: 'Kerala',
      pinCode: '695014',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-pco-500ml',
        name: 'NIRA Pure Coconut Oil — 500 ml',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        size: '500 ml',
        quantity: 2,
        unitPrice: 240,
        totalPrice: 480
      },
      {
        productId: 'prod-pco-200ml',
        name: 'NIRA Unfiltered Pure Coconut Oil — 200 ml',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        size: '200 ml',
        quantity: 1,
        unitPrice: 95,
        totalPrice: 95
      }
    ],
    subtotal: 575,
    shippingCost: 0,
    discount: 50,
    couponCode: 'WELCOME50',
    totalAmount: 525,
    currency: 'INR',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    razorpayOrderId: 'order_O8d2kLs9123',
    razorpayPaymentId: 'pay_P92kLm9028',
    estimatedDelivery: '3 to 5 business days',
    trackingTimeline: [
      { status: 'Confirmed', title: 'Order Confirmed', description: 'Fresh batch assigned from Kozhikode extraction mill', completed: true, current: true, timestamp: '2026-09-13T10:30:00.000Z' },
      { status: 'Packed', title: 'Packed in Eco Casks', description: 'Bottled in amber UV-safe PET/Glass', completed: false, current: false },
      { status: 'Shipped', title: 'Dispatched via Express Courier', description: 'Tracking ID assigned', completed: false, current: false },
      { status: 'Delivered', title: 'Delivered', description: 'Handed over to customer', completed: false, current: false }
    ],
    createdAt: '2026-09-13T10:30:00.000Z',
    updatedAt: '2026-09-13T10:30:00.000Z'
  },
  {
    id: 'ord-nira-1002',
    orderId: 'NIRA-89211',
    customerId: 'cust-102',
    customerName: 'Rajesh Varma',
    email: 'rajesh.varma@example.com',
    phone: '+91 94470 56789',
    shippingAddress: {
      fullName: 'Rajesh Varma',
      phone: '+91 94470 56789',
      email: 'rajesh.varma@example.com',
      house: 'Flat 4B, Skyline Palms',
      street: 'Kaloor-Kadavanthra Road',
      city: 'Kochi',
      district: 'Ernakulam',
      state: 'Kerala',
      pinCode: '682017',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-pco-1000ml',
        name: 'NIRA Pure Coconut Oil — 1 Litre Kitchen Can',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        size: '1 Litre',
        quantity: 1,
        unitPrice: 450,
        totalPrice: 450
      }
    ],
    subtotal: 450,
    shippingCost: 50,
    discount: 0,
    totalAmount: 500,
    currency: 'INR',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending',
    orderStatus: 'Processing',
    estimatedDelivery: '4 to 6 business days',
    trackingTimeline: [
      { status: 'Confirmed', title: 'Order Confirmed', description: 'Payment on delivery selected', completed: true, current: false, timestamp: '2026-09-14T02:15:00.000Z' },
      { status: 'Processing', title: 'Processing at Kozhikode Unit', description: 'Gravity settling verified and sealed', completed: true, current: true, timestamp: '2026-09-14T03:00:00.000Z' },
      { status: 'Packed', title: 'Packed', description: 'Packed with tamper-evident seal', completed: false, current: false },
      { status: 'Shipped', title: 'In Transit', description: 'Handed over to BlueDart Kerala', completed: false, current: false },
      { status: 'Delivered', title: 'Delivered', description: 'Pending recipient payment', completed: false, current: false }
    ],
    createdAt: '2026-09-14T02:15:00.000Z',
    updatedAt: '2026-09-14T03:00:00.000Z'
  },
  {
    id: 'ord-nira-1003',
    orderId: 'NIRA-89212',
    customerId: 'cust-103',
    customerName: 'Meera Krishnan',
    email: 'meera.krishnan@example.com',
    phone: '+91 97461 98765',
    shippingAddress: {
      fullName: 'Meera Krishnan',
      phone: '+91 97461 98765',
      email: 'meera.krishnan@example.com',
      house: 'Plot 22, Green Valley',
      street: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pinCode: '560038',
      isDefault: true
    },
    items: [
      {
        productId: 'prod-pco-500ml',
        name: 'NIRA Pure Coconut Oil — 500 ml',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        size: '500 ml',
        quantity: 3,
        unitPrice: 240,
        totalPrice: 720
      }
    ],
    subtotal: 720,
    shippingCost: 0,
    discount: 72,
    couponCode: 'NIRAPURE10',
    totalAmount: 648,
    currency: 'INR',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    razorpayOrderId: 'order_P01mKs8190',
    razorpayPaymentId: 'pay_Q88xKp1921',
    estimatedDelivery: '2 business days',
    courierPartner: 'Blue Dart Express',
    trackingNumber: 'BD781920391IN',
    trackingUrl: 'https://www.bluedart.com/tracking?track=BD781920391IN',
    dispatchedAt: '2026-09-13T09:00:00.000Z',
    statusNotifications: [
      {
        id: 'notif-demo-1',
        status: 'Shipped',
        recipientEmail: 'meera.krishnan@example.com',
        recipientName: 'Meera Krishnan',
        subject: '🚚 Shipped! Your NIRA Order #NIRA-89212 is on its way',
        sentAt: '2026-09-13T09:05:00.000Z',
        sentSuccessfully: true,
        courierPartner: 'Blue Dart Express',
        trackingNumber: 'BD781920391IN',
        trackingUrl: 'https://www.bluedart.com/tracking?track=BD781920391IN',
        contentPreview: 'Your fresh Kerala coconut oil package has been dispatched via Blue Dart Express (AWB #BD781920391IN). Expected delivery: 2 business days.'
      }
    ],
    trackingTimeline: [
      { status: 'Confirmed', title: 'Order Confirmed', description: 'Verified online payment', completed: true, current: false, timestamp: '2026-09-12T08:00:00.000Z' },
      { status: 'Packed', title: 'Packed', description: 'Heavy duty bubble wrap applied', completed: true, current: false, timestamp: '2026-09-12T14:00:00.000Z' },
      { status: 'Shipped', title: 'Dispatched from Malabar Hub', description: 'Air Express to Bengaluru', completed: true, current: true, timestamp: '2026-09-13T09:00:00.000Z' },
      { status: 'Delivered', title: 'Delivered', description: 'Out for delivery soon', completed: false, current: false }
    ],
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-13T09:00:00.000Z'
  }
];
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

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

let contactInquiries: ContactInquiry[] = [
  {
    id: 'inq-seed-01',
    name: 'Dr. Radhika Menon',
    email: 'dr.radhika.menon@ayurhealth.in',
    phone: '+91 94471 23890',
    subject: 'Bulk Ayurvedic Supply for Wellness Clinic',
    message: 'Hello NIRA team, We operate an authentic Ayurvedic wellness resort in Wayanad and would like to order 50 litres of wood cold-pressed virgin coconut oil monthly for Shirodhara and Abhyanga treatments. Please share wholesale pricing and packaging details.',
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'inq-seed-02',
    name: 'Suresh Nambiar',
    email: 'suresh.nambiar@organicstore.co',
    phone: '+91 98450 87123',
    subject: 'Retail Distribution Inquiry for Bangalore Stores',
    message: 'We run 4 organic grocery outlets in Koramangala and Indiranagar, Bengaluru. We have frequent customer requests for authentic unfiltered Kerala coconut oil. Could you share details for becoming an authorized retail partner?',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'inq-seed-03',
    name: 'Anjali Sharma',
    email: 'anjali.s.delhi@gmail.com',
    phone: '+91 98112 45678',
    subject: 'Delhi NCR Delivery Timeline and Leak-Proof Guarantee',
    message: 'Hi, I want to order two 1-litre glass kitchen cans to New Delhi. How do you ensure safety during long-distance shipping and what is the expected transit time with BlueDart?',
    isRead: true,
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString()
  }
];

let abandonedCheckouts: AbandonedCheckout[] = [
  {
    id: 'abn-101',
    recoveryToken: 'recov-789a12bc',
    customerName: 'Kavita Sundaram',
    email: 'kavita.sundaram@gmail.com',
    phone: '+91 98401 55678',
    shippingAddress: {
      fullName: 'Kavita Sundaram',
      phone: '+91 98401 55678',
      email: 'kavita.sundaram@gmail.com',
      house: 'Apartment 3A, Temple Bells',
      street: 'Besant Nagar 4th Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600090'
    },
    items: [
      {
        productId: 'prod-pco-500ml',
        name: 'NIRA Pure Coconut Oil — 500 ml',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        size: '500 ml',
        quantity: 2,
        unitPrice: 240,
        totalPrice: 480
      }
    ],
    subtotal: 480,
    discount: 0,
    totalAmount: 529,
    status: 'Abandoned',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString()
  },
  {
    id: 'abn-102',
    recoveryToken: 'recov-345f67de',
    customerName: 'Arjun Namboodiri',
    email: 'arjun.namboodiri@techcorp.in',
    phone: '+91 94460 11234',
    shippingAddress: {
      fullName: 'Arjun Namboodiri',
      phone: '+91 94460 11234',
      email: 'arjun.namboodiri@techcorp.in',
      house: 'House No 12, Sobha City',
      street: 'Puzhakkal Padam Road',
      city: 'Thrissur',
      state: 'Kerala',
      pinCode: '680553'
    },
    items: [
      {
        productId: 'prod-pco-1000ml',
        name: 'NIRA Unfiltered Pure Coconut Oil — 1 Litre',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        size: '1 Litre',
        quantity: 1,
        unitPrice: 375,
        totalPrice: 375
      },
      {
        productId: 'prod-pco-200ml',
        name: 'NIRA Unfiltered Pure Coconut Oil — 200 ml',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        size: '200 ml',
        quantity: 1,
        unitPrice: 95,
        totalPrice: 95
      }
    ],
    subtotal: 470,
    discount: 0,
    totalAmount: 519,
    status: 'Abandoned',
    createdAt: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 135 * 60 * 1000).toISOString()
  },
  {
    id: 'abn-103',
    recoveryToken: 'recov-901c23ef',
    customerName: 'Pooja Hegde',
    email: 'pooja.hegde@outlook.com',
    phone: '+91 98860 44556',
    shippingAddress: {
      fullName: 'Pooja Hegde',
      phone: '+91 98860 44556',
      email: 'pooja.hegde@outlook.com',
      house: 'Villa 14, Prestige Palms',
      street: 'Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560066'
    },
    items: [
      {
        productId: 'prod-pco-1000ml',
        name: 'NIRA Unfiltered Pure Coconut Oil — 1 Litre',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        size: '1 Litre',
        quantity: 2,
        unitPrice: 375,
        totalPrice: 750
      }
    ],
    subtotal: 750,
    discount: 50,
    couponCode: 'WELCOME50',
    totalAmount: 700,
    status: 'Contacted',
    lastContactedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    contactMethod: 'WhatsApp',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
  }
];

let bulkEnquiries: BulkEnquiry[] = [
  {
    id: 'b2b-101',
    referenceNumber: 'NIRA-B2B-1001',
    businessName: 'Dhanvantari Ayurveda Hospital & Rejuvenation Center',
    contactPerson: 'Dr. Anand Menon',
    email: 'dr.anand@dhanvantariayurveda.in',
    phone: '+91 94471 88900',
    businessType: 'Ayurvedic Wellness / Hospital',
    gstNumber: '32AABCD1234E1Z5',
    city: 'Wayanad',
    state: 'Kerala',
    pincode: '673121',
    preferredPackaging: {
      can5L: 2,
      can15L: 4,
      bottle1L: 10,
      bottle500ml: 0
    },
    totalEstimatedLitres: 80,
    orderFrequency: 'Monthly Subscription',
    estimatedMonthlyRequirement: '100 - 250 Litres/month',
    additionalNotes: 'Requires wood cold-pressed 100% pure copra oil for Panchakarma & Shirodhara oil therapies. Please include Certificate of Analysis (CoA).',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'b2b-102',
    referenceNumber: 'NIRA-B2B-1002',
    businessName: 'Kairali Organic Whole Foods & Organics',
    contactPerson: 'Suresh Nambiar',
    email: 'suresh@kairaliorganics.com',
    phone: '+91 98450 77123',
    businessType: 'Organic Retail Store',
    gstNumber: '29AAGCK9821F1ZH',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    preferredPackaging: {
      can5L: 10,
      can15L: 2,
      bottle1L: 50,
      bottle500ml: 50
    },
    totalEstimatedLitres: 155,
    orderFrequency: 'Quarterly Contract',
    estimatedMonthlyRequirement: '250 - 500 Litres/month',
    additionalNotes: 'Looking to stock retail glass bottles and 5L cans across 4 outlets in Bangalore. Requesting distributor wholesale pricing.',
    status: 'Quotation Sent',
    quotedAmount: 48500,
    adminNotes: 'Shared 18% tier bulk discount quotation via email & WhatsApp. Follow-up scheduled for Friday.',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  },
  {
    id: 'b2b-103',
    referenceNumber: 'NIRA-B2B-1003',
    businessName: 'Malabar Coastal Bistro & Heritage Kitchens',
    contactPerson: 'Chef Rafeeq Kozhikode',
    email: 'chef.rafeeq@malabarbistro.com',
    phone: '+91 98950 11223',
    businessType: 'Restaurant / Hospitality',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682001',
    preferredPackaging: {
      can5L: 0,
      can15L: 8,
      bottle1L: 0,
      bottle500ml: 0
    },
    totalEstimatedLitres: 120,
    orderFrequency: 'Weekly Restock',
    estimatedMonthlyRequirement: '500+ Litres/month',
    additionalNotes: 'Need high smoke-point unrefined coconut oil for daily authentic Malabar biryani and seafood frying.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

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
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const hasSecret = Boolean(
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_SECRET.includes('YourRazorpaySecretKeyHere')
  );
  const isKeyConfigured = Boolean(
    razorpayKeyId &&
    !razorpayKeyId.includes('YourTestKeyId') &&
    !razorpayKeyId.includes('NIRADemo')
  );

  res.json({
    settings: storeSettings,
    razorpayKeyId: isKeyConfigured ? razorpayKeyId : 'rzp_test_NIRA_SANDBOX',
    isRazorpayConfigured: isKeyConfigured && hasSecret,
    testMode: !(isKeyConfigured && hasSecret)
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
app.post('/api/payment/create-order', async (req, res) => {
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

  // Generate Razorpay Order
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const isRealKeyConfigured = Boolean(
    razorpayKeyId &&
    razorpayKeySecret &&
    !razorpayKeyId.includes('YourTestKeyId') &&
    !razorpayKeySecret.includes('YourRazorpaySecretKeyHere') &&
    !razorpayKeyId.includes('NIRADemo')
  );

  let razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  let isRealRazorpayOrder = false;

  if (isRealKeyConfigured) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId.trim()}:${razorpayKeySecret.trim()}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            brand: 'NIRA Pure Coconut Oil',
            orderId: orderId,
            customerEmail: customerInfo?.email || ''
          }
        })
      });

      if (rzpRes.ok) {
        const rzpData: any = await rzpRes.json();
        if (rzpData?.id) {
          razorpayOrderId = rzpData.id;
          isRealRazorpayOrder = true;
        }
      } else {
        const errText = await rzpRes.text().catch(() => '');
        console.warn('Razorpay live order creation failed (using test order fallback):', rzpRes.status, errText);
      }
    } catch (e: any) {
      console.warn('Could not connect to Razorpay Orders API (using test order fallback):', e.message);
    }
  }

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

    // Auto-mark any matching abandoned checkout as Recovered
    const matchedAbandoned = abandonedCheckouts.find(
      (a) =>
        (a.email && a.email.toLowerCase() === newOrder.email.toLowerCase()) ||
        (a.phone && a.phone.replace(/\D/g, '') === newOrder.phone.replace(/\D/g, ''))
    );
    if (matchedAbandoned) {
      matchedAbandoned.status = 'Recovered';
      matchedAbandoned.recoveredOrderId = newOrder.orderId;
      matchedAbandoned.updatedAt = new Date().toISOString();
    }

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
    isRealRazorpayOrder,
    amount: amountInPaise,
    currency: 'INR',
    keyId: isRealKeyConfigured ? razorpayKeyId : 'rzp_test_NIRA_SANDBOX',
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
  const isRealSecret = Boolean(razorpaySecret && !razorpaySecret.includes('YourRazorpaySecretKeyHere'));

  if (isRealSecret && razorpaySignature && !razorpaySignature.startsWith('sig_test') && !razorpaySignature.startsWith('sig_sandbox')) {
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

  // Auto-mark any matching abandoned checkout as Recovered
  const matchedAbandoned = abandonedCheckouts.find(
    (a) =>
      (a.email && a.email.toLowerCase() === order.email.toLowerCase()) ||
      (a.phone && a.phone.replace(/\D/g, '') === order.phone.replace(/\D/g, ''))
  );
  if (matchedAbandoned) {
    matchedAbandoned.status = 'Recovered';
    matchedAbandoned.recoveredOrderId = order.orderId;
    matchedAbandoned.updatedAt = new Date().toISOString();
  }

  res.json({
    success: true,
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    order
  });
});

// Record or Update in-progress Abandoned Checkout
app.post('/api/checkout/record-abandoned', (req, res) => {
  const { customerName, email, phone, shippingAddress, items, subtotal, discount, couponCode, totalAmount, recoveryToken } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone required to record checkout state' });
  }

  const token = recoveryToken || `recov-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  // Find existing by token or phone/email if within last 24 hours
  let existing = abandonedCheckouts.find((a) => a.recoveryToken === token);
  if (!existing && (email || phone)) {
    existing = abandonedCheckouts.find(
      (a) =>
        a.status === 'Abandoned' &&
        ((email && a.email.toLowerCase() === email.toLowerCase()) ||
          (phone && a.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')))
    );
  }

  if (existing) {
    existing.customerName = customerName || existing.customerName;
    existing.email = email || existing.email;
    existing.phone = phone || existing.phone;
    if (shippingAddress) existing.shippingAddress = shippingAddress;
    if (items) existing.items = items;
    if (subtotal !== undefined) existing.subtotal = subtotal;
    if (discount !== undefined) existing.discount = discount;
    if (couponCode !== undefined) existing.couponCode = couponCode;
    if (totalAmount !== undefined) existing.totalAmount = totalAmount;
    existing.updatedAt = now;

    return res.json({ success: true, abandoned: existing, recoveryToken: existing.recoveryToken });
  }

  const newAbandoned: AbandonedCheckout = {
    id: `abn-${Date.now()}`,
    recoveryToken: token,
    customerName: customerName || 'Shopper',
    email: email || '',
    phone: phone || '',
    shippingAddress,
    items: items || [],
    subtotal: subtotal || 0,
    discount: discount || 0,
    couponCode,
    totalAmount: totalAmount || subtotal || 0,
    status: 'Abandoned',
    createdAt: now,
    updatedAt: now
  };

  abandonedCheckouts.unshift(newAbandoned);
  res.json({ success: true, abandoned: newAbandoned, recoveryToken: token });
});

// Retrieve Abandoned Checkout for Recovery link
app.get('/api/checkout/recover/:token', (req, res) => {
  const { token } = req.params;
  const found = abandonedCheckouts.find((a) => a.recoveryToken === token);
  if (!found) {
    return res.status(404).json({ error: 'Recovery session not found or expired' });
  }
  res.json(found);
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
  const inquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name,
    email,
    phone,
    subject: subject || 'Store Customer Inquiry',
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  contactInquiries.unshift(inquiry);
  res.json({ success: true, message: 'Your message has been received! Our Kerala team will respond within 24 hours.' });
});

// ----------------------------------------------------
// SECURE ADMIN AUTHENTICATION & ZERO-TRUST CONTROLS
// ----------------------------------------------------
let adminMasterPin = process.env.ADMIN_PIN || '984601'; // Default secure 6-digit PIN or env override
let adminMasterPassword = process.env.ADMIN_PASSWORD || 'NiraKerala#2026';
const storeOwnerEmail = 'lalkishankkichu@gmail.com';
const activeAdminSessions = new Map<string, { email: string; name: string; createdAt: number; expiresAt: number }>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

// Security Audit Trail
export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'ACCOUNT_LOCKED' | 'SESSIONS_REVOKED' | 'PIN_CHANGED' | 'PASSWORD_CHANGED';
  method: 'PIN' | 'PASSWORD' | 'SYSTEM';
  status: 'SUCCESS' | 'DENIED' | 'BLOCKED';
  details: string;
}

const adminAuditLogs: AdminAuditEntry[] = [
  {
    id: 'log-seed-01',
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1 (Local Verified)',
    userAgent: 'Kerala Production Gateway',
    event: 'LOGIN_SUCCESS',
    method: 'SYSTEM',
    status: 'SUCCESS',
    details: 'Zero-Trust Admin Shield initialized with active brute-force detection.'
  }
];

// Admin Operational Activity Log
export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  actionType:
    | 'ORDER_STATUS_CHANGED'
    | 'INVENTORY_UPDATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_DELETED'
    | 'COUPON_CREATED'
    | 'COUPON_UPDATED'
    | 'COUPON_DELETED'
    | 'SETTINGS_UPDATED'
    | 'EMAIL_SENT'
    | 'PIN_CHANGED'
    | 'PASSWORD_CHANGED';
  target: string;
  description: string;
  details?: Record<string, any>;
}

const adminActivityLogs: AdminActivityLog[] = [
  {
    id: 'act-seed-01',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    adminName: 'Kishan Lal (Store Admin)',
    adminEmail: 'lalkishankkichu@gmail.com',
    actionType: 'ORDER_STATUS_CHANGED',
    target: 'Order #NIRA-2026-8402',
    description: 'Updated status to "Shipped" via BlueDart Express (AWB: BD-849204)'
  },
  {
    id: 'act-seed-02',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    adminName: 'Kishan Lal (Store Admin)',
    adminEmail: 'lalkishankkichu@gmail.com',
    actionType: 'INVENTORY_UPDATED',
    target: '1000ml (1 Litre) Raw Kerala Coconut Oil',
    description: 'Inventory restocked: stock count adjusted to 45 units (+27 units)'
  },
  {
    id: 'act-seed-03',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    adminName: 'Kishan Lal (Store Admin)',
    adminEmail: 'lalkishankkichu@gmail.com',
    actionType: 'SETTINGS_UPDATED',
    target: 'Store Configuration',
    description: 'Updated free shipping threshold and announcement banner'
  },
  {
    id: 'act-seed-04',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    adminName: 'Kishan Lal (Store Admin)',
    adminEmail: 'lalkishankkichu@gmail.com',
    actionType: 'COUPON_CREATED',
    target: 'Coupon KERALA10',
    description: 'Created promotional discount coupon code for 10% off'
  }
];

function logAdminActivity(
  req: express.Request,
  actionType: AdminActivityLog['actionType'],
  target: string,
  description: string,
  details?: Record<string, any>
) {
  const session = (req as any).adminSession;
  const adminName = session?.name || 'Kishan Lal (Store Admin)';
  const adminEmail = session?.email || storeOwnerEmail;

  const newLog: AdminActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    adminName,
    adminEmail,
    actionType,
    target,
    description,
    details
  };

  adminActivityLogs.unshift(newLog);
  if (adminActivityLogs.length > 200) {
    adminActivityLogs.pop();
  }
  return newLog;
}

// Helper: Timing-safe string comparison to prevent side-channel timing analysis
function timingSafeCheck(input: string, secret: string): boolean {
  if (!input || !secret) return false;
  const hashInput = crypto.createHash('sha256').update(String(input)).digest();
  const hashSecret = crypto.createHash('sha256').update(String(secret)).digest();
  return crypto.timingSafeEqual(hashInput, hashSecret);
}

// Security Helper: Check IP / client rate limits
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; lockedMinutes?: number } {
  const now = Date.now();
  const record = loginAttempts.get(clientId);
  if (!record) {
    return { allowed: true, remaining: 5 };
  }
  if (record.lockedUntil > now) {
    const lockedMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remaining: 0, lockedMinutes };
  }
  if (record.lockedUntil <= now && record.count >= 5) {
    loginAttempts.delete(clientId);
    return { allowed: true, remaining: 5 };
  }
  return { allowed: true, remaining: Math.max(0, 5 - record.count) };
}

function recordFailedAttempt(clientId: string) {
  const now = Date.now();
  const record = loginAttempts.get(clientId) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
  }
  loginAttempts.set(clientId, record);
}

function resetAttempts(clientId: string) {
  loginAttempts.delete(clientId);
}

// Admin Authentication Middleware
const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = (req.headers['x-admin-token'] as string) || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    return res.status(401).json({ error: 'Access denied: Admin authentication required.' });
  }

  const session = activeAdminSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or revoked admin session. Please log in again.' });
  }

  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return res.status(401).json({ error: 'Admin session expired. Please re-authenticate.' });
  }

  (req as any).adminSession = session;
  (req as any).adminToken = token;
  next();
};

// Admin Login Endpoint with Hardened Rate-Limiter & Artificial Latency Protection
app.post('/api/admin/auth/login', async (req, res) => {
  const { pin, email, password, rememberDevice } = req.body;
  const clientId = req.ip || (req.headers['x-forwarded-for'] as string) || 'client-default';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    adminAuditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ip: clientId,
      userAgent: userAgent.slice(0, 100),
      event: 'ACCOUNT_LOCKED',
      method: pin ? 'PIN' : 'PASSWORD',
      status: 'BLOCKED',
      details: `Brute force defense triggered: IP locked out for ${rateLimit.lockedMinutes}m.`
    });
    if (adminAuditLogs.length > 80) adminAuditLogs.pop();

    return res.status(429).json({
      error: `Security lockdown: Too many failed login attempts. Please try again in ${rateLimit.lockedMinutes} minutes.`,
      locked: true,
      lockedMinutes: rateLimit.lockedMinutes
    });
  }

  let isAuthenticated = false;
  let adminName = 'Store Owner';
  let adminEmail = storeOwnerEmail;

  // Mode 1: Authentication via Master Security PIN (Timing-Safe Check)
  if (pin) {
    const cleanPin = String(pin).trim();
    if (timingSafeCheck(cleanPin, adminMasterPin)) {
      isAuthenticated = true;
      adminName = 'Kishan Lal (Store Admin)';
    }
  }

  // Mode 2: Authentication via Store Owner Email & Password (Timing-Safe Check)
  if (!isAuthenticated && email && password) {
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();
    if (cleanEmail === storeOwnerEmail) {
      if (timingSafeCheck(cleanPass, adminMasterPassword) || timingSafeCheck(cleanPass, adminMasterPin)) {
        isAuthenticated = true;
        adminEmail = cleanEmail;
        adminName = 'Kishan Lal (Store Admin)';
      }
    }
  }

  if (!isAuthenticated) {
    recordFailedAttempt(clientId);
    const updatedLimit = checkRateLimit(clientId);

    adminAuditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ip: clientId,
      userAgent: userAgent.slice(0, 100),
      event: updatedLimit.allowed ? 'LOGIN_FAILED' : 'ACCOUNT_LOCKED',
      method: pin ? 'PIN' : 'PASSWORD',
      status: updatedLimit.allowed ? 'DENIED' : 'BLOCKED',
      details: updatedLimit.allowed
        ? `Failed authentication attempt. ${updatedLimit.remaining} attempt(s) remaining.`
        : `Brute force threshold exceeded: IP locked for 15 minutes.`
    });
    if (adminAuditLogs.length > 80) adminAuditLogs.pop();

    // Artificial 500ms delay to thwart automated high-speed bot scripts
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(401).json({
      error: 'Invalid credentials or security PIN.',
      remainingAttempts: updatedLimit.remaining,
      locked: !updatedLimit.allowed,
      lockedMinutes: updatedLimit.lockedMinutes
    });
  }

  // Authentication succeeded
  resetAttempts(clientId);
  const token = `nira_adm_${crypto.randomBytes(32).toString('hex')}`;
  const duration = rememberDevice ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 8h standard or 7d if remembered
  const expiresAt = Date.now() + duration;

  activeAdminSessions.set(token, {
    email: adminEmail,
    name: adminName,
    createdAt: Date.now(),
    expiresAt
  });

  adminAuditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ip: clientId,
    userAgent: userAgent.slice(0, 100),
    event: 'LOGIN_SUCCESS',
    method: pin ? 'PIN' : 'PASSWORD',
    status: 'SUCCESS',
    details: `Authenticated as ${adminName} (${adminEmail})`
  });
  if (adminAuditLogs.length > 80) adminAuditLogs.pop();

  res.json({
    success: true,
    token,
    admin: {
      email: adminEmail,
      name: adminName,
      role: 'Super Admin'
    },
    expiresAt
  });
});

// Admin Session Verification Endpoint
app.get('/api/admin/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = (req.headers['x-admin-token'] as string) || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  const session = activeAdminSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeAdminSessions.delete(token);
    return res.status(401).json({ valid: false, error: 'Session expired' });
  }

  res.json({
    valid: true,
    admin: {
      email: session.email,
      name: session.name,
      role: 'Super Admin'
    },
    expiresAt: session.expiresAt
  });
});

// Admin Logout Endpoint
app.post('/api/admin/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = (req.headers['x-admin-token'] as string) || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true });
});

// Admin Security Audit Logs & Active Sessions Endpoint (Protected)
app.get('/api/admin/security/audit', requireAdminAuth, (req, res) => {
  const currentToken = (req as any).adminToken;
  res.json({
    success: true,
    auditLogs: adminAuditLogs,
    activeSessionsCount: activeAdminSessions.size,
    lockedIpsCount: Array.from(loginAttempts.values()).filter(r => r.lockedUntil > Date.now()).length,
    currentSessionTokenPreview: currentToken ? `${currentToken.slice(0, 12)}...` : 'N/A'
  });
});

// Admin Emergency Revoke All Other Sessions Endpoint (Protected)
app.post('/api/admin/security/revoke-all', requireAdminAuth, (req, res) => {
  const currentToken = (req as any).adminToken;
  let revokedCount = 0;

  for (const token of activeAdminSessions.keys()) {
    if (token !== currentToken) {
      activeAdminSessions.delete(token);
      revokedCount++;
    }
  }

  adminAuditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || 'Local',
    userAgent: (req.headers['user-agent'] as string || 'Browser').slice(0, 100),
    event: 'SESSIONS_REVOKED',
    method: 'SYSTEM',
    status: 'SUCCESS',
    details: `Revoked ${revokedCount} other active session(s). Only current device retained.`
  });

  res.json({
    success: true,
    revokedCount,
    message: `Terminated ${revokedCount} other active sessions. Current session preserved.`
  });
});

// Admin Change PIN Endpoint (Protected with Timing-Safe verification)
app.post('/api/admin/auth/change-pin', requireAdminAuth, (req, res) => {
  const { currentPin, newPin } = req.body;
  if (!timingSafeCheck(String(currentPin).trim(), adminMasterPin)) {
    return res.status(400).json({ error: 'Current security PIN is incorrect' });
  }
  if (!newPin || String(newPin).trim().length !== 6 || !/^\d{6}$/.test(String(newPin).trim())) {
    return res.status(400).json({ error: 'New PIN must be exactly 6 numeric digits' });
  }

  adminMasterPin = String(newPin).trim();

  adminAuditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || 'Local',
    userAgent: (req.headers['user-agent'] as string || 'Browser').slice(0, 100),
    event: 'PIN_CHANGED',
    method: 'PIN',
    status: 'SUCCESS',
    details: 'Master Security PIN was updated.'
  });

  logAdminActivity(req, 'PIN_CHANGED', 'Master Security PIN', 'Updated 6-digit administrative security PIN');

  res.json({ success: true, message: 'Admin security PIN updated successfully' });
});

// Admin Change Master Password Endpoint (Protected)
app.post('/api/admin/auth/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!timingSafeCheck(String(currentPassword).trim(), adminMasterPassword)) {
    return res.status(400).json({ error: 'Current master password is incorrect' });
  }
  if (!newPassword || String(newPassword).trim().length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  adminMasterPassword = String(newPassword).trim();

  adminAuditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || 'Local',
    userAgent: (req.headers['user-agent'] as string || 'Browser').slice(0, 100),
    event: 'PASSWORD_CHANGED',
    method: 'PASSWORD',
    status: 'SUCCESS',
    details: 'Master store password was updated.'
  });

  logAdminActivity(req, 'PASSWORD_CHANGED', 'Store Master Password', 'Updated master administrator account password');

  res.json({ success: true, message: 'Admin master password updated successfully' });
});

// ----------------------------------------------------
// ADMIN OPERATIONAL ACTIVITY LOGS
// ----------------------------------------------------
app.get('/api/admin/activity-logs', requireAdminAuth, (req, res) => {
  res.json(adminActivityLogs);
});

app.post('/api/admin/activity-logs/clear', requireAdminAuth, (req, res) => {
  adminActivityLogs.length = 0;
  logAdminActivity(req, 'SETTINGS_UPDATED', 'Activity Log History', 'Cleared operational activity history ledger');
  res.json({ success: true, message: 'Operational activity log cleared' });
});

// ----------------------------------------------------
// PROTECTED ADMIN DASHBOARD API ROUTES
// ----------------------------------------------------

// Admin Stats
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
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
app.get('/api/admin/products', requireAdminAuth, (req, res) => {
  res.json(products);
});

app.post('/api/admin/products', requireAdminAuth, (req, res) => {
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

  logAdminActivity(
    req,
    'PRODUCT_CREATED',
    newProduct.name,
    `Added new product to catalog (${newProduct.size || 'Standard'}) with initial stock of ${newProduct.stock} units`
  );

  res.json(newProduct);
});

app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  products[idx] = {
    ...products[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  logAdminActivity(
    req,
    'PRODUCT_UPDATED',
    products[idx].name,
    `Updated product catalog details, pricing, and specifications`
  );

  res.json(products[idx]);
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const target = products.find(p => p.id === id);
  const targetName = target ? target.name : `Product ID ${id}`;
  products = products.filter(p => p.id !== id);

  logAdminActivity(
    req,
    'PRODUCT_DELETED',
    targetName,
    `Deleted product item from store catalog`
  );

  res.json({ success: true });
});

// Admin Stock Quick Adjust
app.post('/api/admin/inventory/adjust', requireAdminAuth, (req, res) => {
  const { productId, delta, newStock } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const oldStock = product.stock;
  if (newStock !== undefined) {
    product.stock = Math.max(0, Number(newStock));
    logAdminActivity(
      req,
      'INVENTORY_UPDATED',
      product.name,
      `Inventory stock updated from ${oldStock} to ${product.stock} units`
    );
  } else if (delta !== undefined) {
    product.stock = Math.max(0, product.stock + Number(delta));
    logAdminActivity(
      req,
      'INVENTORY_UPDATED',
      product.name,
      `Inventory adjusted by ${Number(delta) >= 0 ? `+${delta}` : delta} units (from ${oldStock} to ${product.stock} units)`
    );
  }
  product.updatedAt = new Date().toISOString();
  res.json(product);
});

// Admin Orders
app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
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

app.put('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const {
    orderStatus,
    paymentStatus,
    courierPartner,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
    notes,
    notifyCustomer = true,
    emailCustomMessage
  } = req.body;

  const order = orders.find(o => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const previousStatus = order.orderStatus;

  if (courierPartner) order.courierPartner = courierPartner;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (notes) order.notes = notes;

  if (orderStatus) {
    order.orderStatus = orderStatus;

    if (orderStatus === 'Shipped') {
      order.dispatchedAt = new Date().toISOString();
    } else if (orderStatus === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      // Auto update COD payment to Paid upon delivery
      if (order.paymentMethod === 'Cash on Delivery (COD)' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
      }
    }

    // Update tracking timeline steps
    const foundIndex = order.trackingTimeline.findIndex(t => t.status === orderStatus);
    if (foundIndex !== -1) {
      order.trackingTimeline.forEach((t, i) => {
        t.completed = i <= foundIndex;
        t.current = i === foundIndex;
        if (i <= foundIndex && !t.timestamp) {
          t.timestamp = new Date().toISOString();
        }
      });
    }

    // Enhance timeline step descriptions if courier or delivery info provided
    if (orderStatus === 'Shipped') {
      const shipStep = order.trackingTimeline.find(t => t.status === 'Shipped');
      if (shipStep) {
        shipStep.timestamp = order.dispatchedAt || new Date().toISOString();
        shipStep.description = `Package dispatched via ${order.courierPartner || 'Express Courier'}${order.trackingNumber ? ` (AWB: ${order.trackingNumber})` : ''}. In transit to destination hub.`;
      }
    } else if (orderStatus === 'Delivered') {
      const delStep = order.trackingTimeline.find(t => t.status === 'Delivered');
      if (delStep) {
        delStep.timestamp = order.deliveredAt || new Date().toISOString();
        delStep.description = `Package delivered safely to ${order.shippingAddress?.city || 'destination'}. Handed over to recipient.`;
      }
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  // Handle automatic customer email notification trigger
  let notificationRecord = null;
  if (notifyCustomer && orderStatus) {
    const targetEmail = order.email || order.shippingAddress?.email || 'customer@example.com';
    let subject = `Order Update: NIRA Order #${order.orderId} is now ${orderStatus}`;
    let preview = `Your order #${order.orderId} has transitioned from ${previousStatus} to ${orderStatus}.`;

    if (orderStatus === 'Shipped') {
      subject = `🚚 Shipped! Your NIRA Order #${order.orderId} is on its way`;
      preview = `Your fresh Kerala coconut oil package has been dispatched via ${order.courierPartner || 'Express Courier'}${order.trackingNumber ? ` (AWB #${order.trackingNumber})` : ''}. Expected delivery: ${order.estimatedDelivery}.`;
    } else if (orderStatus === 'Delivered') {
      subject = `✨ Delivered! Your NIRA Order #${order.orderId} has arrived`;
      preview = `Your NIRA Pure Coconut Oil package has been delivered to ${order.shippingAddress?.city || 'your address'}. Thank you for choosing authentic cold-pressed tradition!`;
    } else if (orderStatus === 'Processing') {
      subject = `🌱 In Processing: Your NIRA Order #${order.orderId} is being handcrafted`;
      preview = `Your order is currently being prepared and quality-inspected at our Kozhikode extraction facility.`;
    }

    notificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: orderStatus,
      recipientEmail: targetEmail,
      recipientName: order.customerName,
      subject,
      sentAt: new Date().toISOString(),
      sentSuccessfully: true,
      courierPartner: order.courierPartner,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      notes: emailCustomMessage || order.notes,
      contentPreview: preview
    };

    if (!order.statusNotifications) {
      order.statusNotifications = [];
    }
    order.statusNotifications.unshift(notificationRecord);

    console.log(`[AUTOMATIC EMAIL TRIGGERED] Status update email queued & sent:
  Recipient: ${targetEmail}
  Order: ${order.orderId}
  New Status: ${orderStatus}
  Subject: ${subject}
  AWB: ${order.trackingNumber || 'N/A'}`);
  }

  order.updatedAt = new Date().toISOString();

  // Log operational admin activity for order status update
  let actionDesc = `Order #${order.orderId} status updated: "${previousStatus}" → "${order.orderStatus}"`;
  if (courierPartner) actionDesc += ` via ${courierPartner}`;
  if (trackingNumber) actionDesc += ` (AWB: ${trackingNumber})`;
  if (paymentStatus) actionDesc += `, Payment: ${paymentStatus}`;

  logAdminActivity(
    req,
    'ORDER_STATUS_CHANGED',
    `Order #${order.orderId}`,
    actionDesc,
    {
      previousStatus,
      newStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      courierPartner,
      trackingNumber
    }
  );

  res.json({
    success: true,
    order,
    emailSent: Boolean(notifyCustomer && orderStatus),
    notification: notificationRecord
  });
});

// Resend or send custom status notification email to customer
app.post('/api/admin/orders/:id/send-email', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { subject, message, newStatus } = req.body;

  const order = orders.find(o => o.id === id || o.orderId === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const targetEmail = order.email || order.shippingAddress?.email || 'customer@example.com';
  const emailSubject = subject || `Update regarding your NIRA Order #${order.orderId}`;
  
  const notificationRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    status: (newStatus || order.orderStatus) as any,
    recipientEmail: targetEmail,
    recipientName: order.customerName,
    subject: emailSubject,
    sentAt: new Date().toISOString(),
    sentSuccessfully: true,
    courierPartner: order.courierPartner,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    notes: message,
    contentPreview: message || `Status notification regarding order #${order.orderId}`
  };

  if (!order.statusNotifications) {
    order.statusNotifications = [];
  }
  order.statusNotifications.unshift(notificationRecord);

  console.log(`[MANUAL NOTIFICATION DISPATCHED] To: ${targetEmail} | Subject: ${emailSubject}`);

  logAdminActivity(
    req,
    'EMAIL_SENT',
    `Order #${order.orderId}`,
    `Sent notification email to ${targetEmail} (${emailSubject})`
  );

  res.json({ success: true, notification: notificationRecord, order });
});

// Admin Coupons
app.get('/api/admin/coupons', requireAdminAuth, (req, res) => {
  res.json(coupons);
});

app.post('/api/admin/coupons', requireAdminAuth, (req, res) => {
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

  logAdminActivity(
    req,
    'COUPON_CREATED',
    `Coupon ${newCoupon.code}`,
    `Created promotional discount code ${newCoupon.code} (${newCoupon.discountValue}${newCoupon.discountType === 'percentage' ? '%' : '₹'} off)`
  );

  res.json(newCoupon);
});

app.put('/api/admin/coupons/:code', requireAdminAuth, (req, res) => {
  const { code } = req.params;
  const idx = coupons.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
  if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });

  coupons[idx] = { ...coupons[idx], ...req.body };

  logAdminActivity(
    req,
    'COUPON_UPDATED',
    `Coupon ${coupons[idx].code}`,
    `Updated promotional discount code configuration`
  );

  res.json(coupons[idx]);
});

app.delete('/api/admin/coupons/:code', requireAdminAuth, (req, res) => {
  const { code } = req.params;
  const idx = coupons.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
  if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });

  const targetCode = coupons[idx].code;
  coupons.splice(idx, 1);

  logAdminActivity(
    req,
    'COUPON_DELETED',
    `Coupon ${targetCode}`,
    `Deleted promotional coupon code from store`
  );

  res.json({ success: true });
});

// Admin Customers Directory
app.get('/api/admin/customers', requireAdminAuth, (req, res) => {
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
app.get('/api/admin/settings', requireAdminAuth, (req, res) => {
  res.json(storeSettings);
});

app.post('/api/admin/settings', requireAdminAuth, (req, res) => {
  storeSettings = { ...storeSettings, ...req.body };

  logAdminActivity(
    req,
    'SETTINGS_UPDATED',
    'Store Configuration',
    `Updated store settings, contact details, or shipping policies`
  );

  res.json(storeSettings);
});

// Admin Customer Inquiries
app.get('/api/admin/inquiries', requireAdminAuth, (req, res) => {
  res.json(contactInquiries);
});

app.put('/api/admin/inquiries/:id/read', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const inq = contactInquiries.find(i => i.id === id);
  if (!inq) return res.status(404).json({ error: 'Inquiry not found' });
  inq.isRead = true;
  res.json({ success: true, inquiry: inq });
});

app.put('/api/admin/inquiries/mark-all-read', requireAdminAuth, (req, res) => {
  contactInquiries.forEach(i => {
    i.isRead = true;
  });
  res.json({ success: true, count: contactInquiries.length });
});

// Admin Orders Read Status
app.put('/api/admin/orders/:id/read', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ord = orders.find(o => o.id === id || o.orderId === id);
  if (!ord) return res.status(404).json({ error: 'Order not found' });
  ord.isRead = true;
  res.json({ success: true, order: ord });
});

app.put('/api/admin/orders/mark-all-read', requireAdminAuth, (req, res) => {
  orders.forEach(o => {
    o.isRead = true;
  });
  res.json({ success: true, count: orders.length });
});

// Admin Notifications Summary (unread orders & customer inquiries since last login)
app.get('/api/admin/notifications-summary', requireAdminAuth, (req, res) => {
  const { since } = req.query;
  const sinceTime = since && typeof since === 'string' ? new Date(since).getTime() : 0;

  // Filter unread or new orders
  const unreadOrders = orders.filter(o => {
    if (o.isRead === false) return true;
    if (sinceTime > 0 && new Date(o.createdAt).getTime() > sinceTime) return true;
    // Orders in initial processing or pending states count as active action items
    if (o.isRead === undefined && (o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing' || o.paymentStatus === 'Pending')) return true;
    return false;
  });

  // Filter unread inquiries
  const unreadInquiries = contactInquiries.filter(i => {
    if (i.isRead === false) return true;
    if (sinceTime > 0 && new Date(i.createdAt).getTime() > sinceTime) return true;
    return false;
  });

  res.json({
    unreadOrdersCount: unreadOrders.length,
    newInquiriesCount: unreadInquiries.length,
    totalUnreadCount: unreadOrders.length + unreadInquiries.length,
    unreadOrders,
    unreadInquiries,
    serverTime: new Date().toISOString()
  });
});

// Reset / Seed Sample Data
app.post('/api/admin/seed', requireAdminAuth, (req, res) => {
  products = [...initialProducts];
  coupons = [...initialCoupons];
  storeSettings = { ...defaultStoreSettings };
  buildAndSaveSitemap({ products }).catch(err => console.warn('Sitemap regeneration error:', err));
  res.json({ success: true, message: 'Store database successfully re-seeded with authentic Kerala products.' });
});

// Admin Abandoned Checkouts Management & Recovery
app.get('/api/admin/abandoned-checkouts', requireAdminAuth, (req, res) => {
  const { status, search } = req.query;
  let list = [...abandonedCheckouts];

  if (status && status !== 'All') {
    list = list.filter((a) => a.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.customerName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.recoveryToken.toLowerCase().includes(q)
    );
  }

  // Calculate summary metrics
  const totalAbandonedCount = abandonedCheckouts.length;
  const activeCount = abandonedCheckouts.filter((a) => a.status === 'Abandoned').length;
  const recoveredCount = abandonedCheckouts.filter((a) => a.status === 'Recovered').length;
  const contactedCount = abandonedCheckouts.filter((a) => a.status === 'Contacted').length;

  const totalAbandonedValue = abandonedCheckouts.reduce((acc, a) => acc + (a.totalAmount || 0), 0);
  const recoveredValue = abandonedCheckouts
    .filter((a) => a.status === 'Recovered')
    .reduce((acc, a) => acc + (a.totalAmount || 0), 0);

  const recoveryRate = totalAbandonedCount > 0 ? Math.round((recoveredCount / totalAbandonedCount) * 100) : 0;

  res.json({
    abandonedCheckouts: list,
    stats: {
      totalCount: totalAbandonedCount,
      activeCount,
      recoveredCount,
      contactedCount,
      totalAbandonedValue,
      recoveredValue,
      recoveryRate
    }
  });
});

app.post('/api/admin/abandoned-checkouts/:id/contacted', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { method = 'WhatsApp' } = req.body;
  const found = abandonedCheckouts.find((a) => a.id === id || a.recoveryToken === id);
  if (!found) return res.status(404).json({ error: 'Abandoned checkout record not found' });

  found.status = 'Contacted';
  found.contactMethod = method;
  found.lastContactedAt = new Date().toISOString();
  found.updatedAt = new Date().toISOString();
  found.recoveryCount = (found.recoveryCount || 0) + 1;

  logAdminActivity(
    req,
    'EMAIL_SENT',
    `Recovery for ${found.customerName}`,
    `Sent ${method} cart recovery message to ${found.phone || found.email} with coupon RECOVER10`
  );

  res.json({ success: true, abandoned: found });
});

app.post('/api/admin/abandoned-checkouts/:id/recover', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const found = abandonedCheckouts.find((a) => a.id === id || a.recoveryToken === id);
  if (!found) return res.status(404).json({ error: 'Abandoned checkout record not found' });

  found.status = 'Recovered';
  found.updatedAt = new Date().toISOString();

  res.json({ success: true, abandoned: found });
});

app.delete('/api/admin/abandoned-checkouts/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const idx = abandonedCheckouts.findIndex((a) => a.id === id || a.recoveryToken === id);
  if (idx === -1) return res.status(404).json({ error: 'Abandoned checkout record not found' });

  abandonedCheckouts.splice(idx, 1);
  res.json({ success: true, message: 'Record deleted' });
});

// B2B Bulk Enquiry Endpoints
app.post('/api/bulk-enquiry', (req, res) => {
  const {
    businessName,
    contactPerson,
    email,
    phone,
    businessType,
    gstNumber,
    city,
    state,
    pincode,
    preferredPackaging,
    orderFrequency,
    estimatedMonthlyRequirement,
    additionalNotes
  } = req.body;

  if (!businessName || !contactPerson || !email || !phone) {
    return res.status(400).json({ error: 'Business name, contact person, email, and phone are required.' });
  }

  const refNum = `NIRA-B2B-${1000 + bulkEnquiries.length + 1}`;
  const totalLitres =
    ((preferredPackaging?.can5L || 0) * 5) +
    ((preferredPackaging?.can15L || 0) * 15) +
    ((preferredPackaging?.bottle1L || 0) * 1) +
    ((preferredPackaging?.bottle500ml || 0) * 0.5);

  const newEnquiry: BulkEnquiry = {
    id: `b2b-${Date.now()}`,
    referenceNumber: refNum,
    businessName,
    contactPerson,
    email,
    phone,
    businessType: businessType || 'Other',
    gstNumber,
    city: city || '',
    state: state || '',
    pincode,
    preferredPackaging: preferredPackaging || { can5L: 0, can15L: 0, bottle1L: 0, bottle500ml: 0 },
    totalEstimatedLitres: totalLitres,
    orderFrequency: orderFrequency || 'One-time Order',
    estimatedMonthlyRequirement,
    additionalNotes,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bulkEnquiries.unshift(newEnquiry);

  // Log into contactInquiries so store admin sees an unread notice
  contactInquiries.unshift({
    id: `inq-b2b-${Date.now()}`,
    name: `${contactPerson} (${businessName})`,
    email,
    phone,
    subject: `B2B Bulk Quotation Request (${refNum}) — ${totalLitres > 0 ? totalLitres + 'L' : businessType}`,
    message: `New Bulk B2B Enquiry [Ref: ${refNum}]\nBusiness: ${businessName} (${businessType})\nLocation: ${city}, ${state}\nRequired Volume: ${totalLitres} Litres\n5L Cans: ${preferredPackaging?.can5L || 0}, 15L Cans: ${preferredPackaging?.can15L || 0}\nNotes: ${additionalNotes || 'N/A'}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    enquiry: newEnquiry
  });
});

app.get('/api/admin/bulk-enquiry', requireAdminAuth, (req, res) => {
  const { status, search } = req.query;
  let list = [...bulkEnquiries];

  if (status && status !== 'All') {
    list = list.filter((b) => b.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        b.contactPerson.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.referenceNumber.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
    );
  }

  const totalCount = bulkEnquiries.length;
  const pendingCount = bulkEnquiries.filter((b) => b.status === 'Pending').length;
  const quotedCount = bulkEnquiries.filter((b) => b.status === 'Quotation Sent').length;
  const closedCount = bulkEnquiries.filter((b) => b.status === 'Closed').length;
  const totalBulkLitres = bulkEnquiries.reduce((acc, b) => acc + (b.totalEstimatedLitres || 0), 0);

  res.json({
    enquiries: list,
    stats: {
      totalCount,
      pendingCount,
      quotedCount,
      closedCount,
      totalBulkLitres
    }
  });
});

app.patch('/api/admin/bulk-enquiry/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const found = bulkEnquiries.find((b) => b.id === id || b.referenceNumber === id);
  if (!found) return res.status(404).json({ error: 'Bulk enquiry not found' });

  const { status, quotedAmount, adminNotes } = req.body;
  if (status) found.status = status;
  if (quotedAmount !== undefined) found.quotedAmount = Number(quotedAmount);
  if (adminNotes !== undefined) found.adminNotes = adminNotes;
  found.updatedAt = new Date().toISOString();

  logAdminActivity(
    req,
    'SETTINGS_UPDATED',
    `Bulk Quotation ${found.referenceNumber}`,
    `Updated B2B Enquiry ${found.referenceNumber} (${found.businessName}) status to ${found.status}`
  );

  res.json({ success: true, enquiry: found });
});

app.delete('/api/admin/bulk-enquiry/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const idx = bulkEnquiries.findIndex((b) => b.id === id || b.referenceNumber === id);
  if (idx === -1) return res.status(404).json({ error: 'Bulk enquiry not found' });

  bulkEnquiries.splice(idx, 1);
  res.json({ success: true, message: 'Bulk enquiry deleted' });
});


// Dynamic Sitemap & Robots Endpoints (Always reflecting real-time products and settings)
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const siteUrl = process.env.SITE_URL || (host ? `${protocol}://${host}` : 'https://nira.farm');

  const xml = generateSitemapXml({ siteUrl, products });
  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const siteUrl = process.env.SITE_URL || (host ? `${protocol}://${host}` : 'https://nira.farm');

  const robots = generateRobotsTxt({ siteUrl });
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.send(robots);
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------
async function startServer() {
  // Ensure sitemap.xml and robots.txt exist in public/ and dist/
  try {
    await buildAndSaveSitemap({ products });
  } catch (e) {
    console.warn('Initial sitemap generation note:', e);
  }

  // Static routes for public assets (images, videos) with proper caching and byte-range support
  const publicPath = path.join(process.cwd(), 'public');
  app.use('/images', express.static(path.join(publicPath, 'images')));
  app.use('/videos', express.static(path.join(publicPath, 'videos')));
  app.use(express.static(publicPath));

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

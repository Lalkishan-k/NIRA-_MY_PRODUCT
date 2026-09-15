export type ProductSize = '200 ml' | '500 ml' | '1 Litre' | '2 Litre' | '5 Litre' | string;

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  discount?: number; // percentage
  stock: number;
  sku: string;
  size: ProductSize;
  unit: string;
  images: string[];
  ingredients: string[];
  benefits: string[];
  usage: string[];
  storage: string;
  specifications: {
    extractionMethod: string;
    shelfLife: string;
    aroma: string;
    smokePoint: string;
    source: string;
    fssaiLicense?: string;
  };
  featured: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
  unitPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  house: string;
  street: string;
  locality?: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  size: ProductSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

export interface StatusNotificationLog {
  id: string;
  status: OrderStatus;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  sentAt: string;
  sentSuccessfully: boolean;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  contentPreview?: string;
}

export interface Order {
  id: string;
  orderId: string; // e.g. CP-20260910-001
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  paymentMethod: 'Razorpay' | 'Cash on Delivery (COD)';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus: OrderStatus;
  trackingTimeline: TrackingStep[];
  estimatedDelivery: string;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  statusNotifications?: StatusNotificationLog[];
  notes?: string;
  isRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  title: string;
  review: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  addresses: ShippingAddress[];
  defaultAddressIndex?: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  supportPhone: string;
  secondaryPhone?: string;
  supportEmail: string;
  whatsappNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  freeShippingThreshold: number;
  shippingCharge: number;
  announcementText: string;
  fssaiNumber: string;
  currencySymbol: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'ACCOUNT_LOCKED' | 'SESSIONS_REVOKED' | 'PIN_CHANGED' | 'PASSWORD_CHANGED';
  method: 'PIN' | 'PASSWORD' | 'SYSTEM';
  status: 'SUCCESS' | 'DENIED' | 'BLOCKED';
  details: string;
}

export interface SecurityAuditResponse {
  success: boolean;
  auditLogs: SecurityAuditLog[];
  activeSessionsCount: number;
  lockedIpsCount: number;
  currentSessionTokenPreview: string;
}

export type AdminActionType =
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

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  actionType: AdminActionType;
  target: string;
  description: string;
  details?: Record<string, any>;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export interface AdminNotificationSummary {
  unreadOrdersCount: number;
  newInquiriesCount: number;
  totalUnreadCount: number;
  lastLoginTime?: string;
  unreadOrders: Order[];
  unreadInquiries: CustomerInquiry[];
}

export interface PincodeDeliveryEstimate {
  pincode: string;
  valid: boolean;
  city: string;
  district?: string;
  state: string;
  zone: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  deliveryTimeframe: string;
  estimatedDeliveryDate: string;
  isExpress: boolean;
  codAvailable: boolean;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  courierPartners: string[];
  message: string;
}

export interface AbandonedCheckoutItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AbandonedCheckout {
  id: string;
  recoveryToken: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress?: Partial<ShippingAddress>;
  items: AbandonedCheckoutItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  status: 'Abandoned' | 'Recovered' | 'Contacted';
  lastContactedAt?: string;
  contactMethod?: 'WhatsApp' | 'Email';
  recoveryCount?: number;
  recoveredOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkEnquiry {
  id: string;
  referenceNumber: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: 'Ayurvedic Wellness / Hospital' | 'Organic Retail Store' | 'Restaurant / Hospitality' | 'Wholesale Exporter' | 'Other';
  gstNumber?: string;
  city: string;
  state: string;
  pincode?: string;
  preferredPackaging: {
    can5L: number;
    can15L: number;
    bottle1L: number;
    bottle500ml: number;
  };
  totalEstimatedLitres: number;
  orderFrequency: 'One-time Order' | 'Monthly Subscription' | 'Quarterly Contract' | 'Weekly Restock';
  estimatedMonthlyRequirement?: string;
  additionalNotes?: string;
  status: 'Pending' | 'In Progress' | 'Quotation Sent' | 'Closed' | 'Rejected';
  quotedAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}



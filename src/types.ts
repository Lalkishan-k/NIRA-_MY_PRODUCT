export type ProductSize = '200 ml' | '500 ml' | '1 Litre' | '2 Litre' | '5 Litre' | string;

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
  notes?: string;
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

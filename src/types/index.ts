export type Role = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Address {
  id: string;
  title?: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  address: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface ProductSpecification {
  group: string; // e.g. "Processor", "Display", "Memory", "Storage", "Graphics"
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  specifications: ProductSpecification[];
  features: string[];
  regularPrice: number;
  salePrice: number;
  costPrice?: number;
  discountPercentage: number;
  stock: number;
  lowStockThreshold: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  flashSale: boolean;
  flashSaleEndsAt?: string;
  images: string[];
  videoUrl?: string;
  warranty: string;
  condition: 'Brand New' | 'Official Warranty' | 'Imported' | 'Refurbished';
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  website?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSpecs?: Record<string, string>;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'SSLCOMMERZ';

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  regularPrice: number;
  quantity: number;
  totalPrice: number;
  warranty: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "STB-2026-1042"
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  valId?: string; // SSLCommerz validation ID
  shippingMethod: 'Inside Chattogram' | 'Outside Chattogram' | 'Store Pickup';
  notes?: string;
  internalNotes?: string;
  history: {
    status: OrderStatus;
    note: string;
    timestamp: string;
    updatedBy?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryTransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'CANCELLATION';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: InventoryTransactionType;
  previousStock: number;
  quantityChange: number; // positive or negative
  newStock: number;
  reason: string;
  referenceId?: string; // e.g. orderId
  performedBy: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  applicableCategories?: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  link: string;
  imageUrl: string;
  buttonText?: string;
  position: 'HERO' | 'PROMO_MIDDLE' | 'PROMO_SIDE' | 'POPUP';
  order: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logo: string;
  phone: string;
  supportPhone: string;
  email: string;
  supportEmail: string;
  address: string;
  facebookUrl: string;
  whatsappNumber: string;
  youtubeUrl?: string;
  announcementBarText: string;
  showAnnouncementBar: boolean;
  shippingInsideChattogram: number;
  shippingOutsideChattogram: number;
  freeShippingThreshold: number;
  currency: string;
  currencySymbol: string;
  vatPercentage: number;
  maintenanceMode: boolean;
  sslcommerzIsLive: boolean;
  sslcommerzStoreId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

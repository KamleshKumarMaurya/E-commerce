export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  avatarUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  status: 'In Review' | 'Verified' | 'Active' | 'Pending';
  applications: string;
  verificationId: string;
  totalEarnings: number;
  createdAt: any;
  category: string;
  email: string;
  storeName: string;
}
export interface Category {
  id?: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: number;
  bannerImageUrl: string;
  iconUrl?: string;
  commissionPercentage: number;
  isActive: boolean;
  displayOrder: number;
  attributes?: {
    attributeName: string;
    values: string[];
  }[];
  childCategories?: Category[];
}

export interface CategoryHierarchyDTO {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number;
  attributes?: {
    attributeName: string;
    values: string[];
  }[];
  childCategories?: CategoryHierarchyDTO[];
}

export interface ProductVariant {
  id?: number;
  sku: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
  attributes: { [key: string]: string };
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  maxStock: number;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  whatsInBox?: string[];
  specifications?: { [key: string]: string };
  image?: string;
  attributes?: any;
  basePrice?: number;
  sizes?: string[];
  highlights?: { [key: string]: string };
  aboutItem?: string[];
  additionalInfo?: { [key: string]: string };
  variants?: ProductVariant[];
  categoryName?: string;
  stockQuantity?: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  productId: string;
  vendorId: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: Date;
}

export interface CartItem {
  key: string;           // productId + size (unique identifier)
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice: number;     // resolved price (may vary by size)
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlacedOrderItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus = 'Order Placed' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface PlacedOrder {
  orderId: string;
  customerId: string;
  customerEmail: string;
  placedAt: string;         // ISO date string
  items: PlacedOrderItem[];
  deliveryAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  estimatedDelivery: string; // ISO date string
}

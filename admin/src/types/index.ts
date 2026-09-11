export type Role = "super_admin" | "admin" | "sales" | "technician" | "accountant" | "customer";

export interface StaffUser {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
  isActive: boolean;
  sortOrder: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  SKU: string;
  category?: Category | { _id: string; name: string; slug: string } | string | null;
  subcategory?: string;
  brand: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  lowStockThreshold: number;
  minimumOrderQuantity: number;
  unit: string;
  capacity?: string;
  weight?: string;
  fireClass: string[];
  modelNumber?: string;
  specifications: ProductSpecification[];
  features: string[];
  certifications: string[];
  images: ProductImage[];
  datasheet?: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

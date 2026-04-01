/* eslint-disable @typescript-eslint/no-explicit-any */
// categories
export interface Category {
  id: number;
  name: string;
  description: string;
}
export interface CategoryCreateDTO {
  name: string;
  description?: string;
}
export interface CategoryUpdateDTO {
  name?: string;
  description?: string;
}

// product images
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  color?: string;
}

// product variants
export interface ProductVariant {
  id: number;
  productId: number;
  color: string;
  size: string;
  stock: number;
}
export interface CreateVariantDTO {
  productId: number;
  color: string;
  size: string;
  stock: number;
}
export interface UpdateVariantDTO {
  color: string;
  size: string;
  stock: number;
}

// products
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
}
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}
export interface UpdateProductDTO {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
}
export interface ProductFilterRequest {
  [key: string]: any;
}

// orders
export interface OrderItemResponse {
  variantId: number;
  productName: string;
  quantity: number;
  price: number;
}
export interface OrderResponse {
  id: number;
  totalPrice: number;
  address: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemResponse[];
}
export interface UpdateOrderStatusRequest {
  status: string;
}

// users
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
}

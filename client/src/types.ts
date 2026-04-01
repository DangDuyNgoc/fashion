import { z } from "zod";

// ============ LOCAL STORE TYPES ============
export type ProductType = {
  id: string | number;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
};

export type ProductsType = ProductType[];

export type CartItemType = ProductType & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

// ============ API TYPES (from .NET server) ============
export type ProductVariantType = {
  id: number;
  productId: number;
  color: string;
  size: string;
  stock: number;
};

export type ProductImageType = {
  id: number;
  productId: number;
  imageUrl: string;
  color?: string;
};

export type ApiProductType = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  variants: ProductVariantType[];
  images: ProductImageType[];
};

export type CategoryType = {
  id: number;
  name: string;
  description: string;
};

export type ApiCartItemType = {
  id: number;
  variantId: number;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type ApiCartType = {
  id: number;
  userId: string;
  items: ApiCartItemType[];
};

// ============ FORMS & STORE ============
export const shippingFormSchema = z.object({
  name: z.string().min(1, "Vui lòng điền tên!"),
  email: z.email().min(1, "Vui lòng điền email!"),
  phone: z
    .string()
    .max(10, "Số điện thoại phải có 10 chữ số!")
    .regex(/^\d+$/, "Số điện thoại phải chứa số!"),
  address: z.string().min(1, "Vui lòng điền địa chỉ!"),
  city: z.string().min(1, "Vui lòng chọn thành phố!"),
  addressId: z.number().optional(),
});

export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardHolder: z.string().min(1, "Vui lòng điền tên chủ thẻ!"),
  cardNumber: z
    .string()
    .min(16, "Số thẻ phải có 16 chữ số!")
    .max(16, "Số thẻ phải có 16 chữ số!"),
  expirationDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      "Ngày hết hạn phải có định dạng MM/YY!"
    ),
  cvv: z.string().min(3, "CVV phải có 3 chữ số!").max(3, "CVV phải có 3 chữ số!"),
});

export type PaymentFormInputs = z.infer<typeof paymentFormSchema>;

export type CartStoreStateType = {
  cart: ApiCartItemType[];
};

export type CartStoreActionsType = {
  loadCart: () => Promise<void>;
  addToCart: (variantId: number, quantity: number) => Promise<void>;
  updateCartQuantity: (
    itemId: number,
    variantId: number,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
};

// ============ AUTH STORE TYPES ============
export type AuthStoreStateType = {
  isLoggedIn: boolean;
};

export type AuthStoreActionsType = {
  setIsLoggedIn: (status: boolean) => void;
  checkLoginStatus: () => void;
};

// ============ PROFILE & ADDRESS TYPES ============
export type AddressType = {
  id: number;
  addressLine: string;
  city: string;
  district: string;
  isDefault: boolean;
};

export type UserProfileType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
};

export type CreateAddressDTO = {
  addressLine: string;
  city: string;
  district: string;
  isDefault?: boolean;
};

// ============ ORDER TYPES ============
export type OrderItemType = {
  id: number;
  variantId: number;
  productName: string;
  quantity: number;
  price: number;
};

export type OrderType = {
  id: number;
  totalPrice: number;
  address: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemType[];
};

// ============ WISHLIST TYPES ============
export type WishlistItemType = {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  variants: ProductVariantType[];
};

export type WishlistStoreStateType = {
  wishlist: WishlistItemType[];
  wishlistProductIds: Set<number>;
  loading: boolean;
};

export type WishlistStoreActionsType = {
  loadWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => void;
};


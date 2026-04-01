import api from "@/lib/api";

export const wishlistService = {
  getWishlist: () => api.get("/wishlist/get-wishlist"),

  addToWishlist: (productId: number) =>
    api.post("/wishlist/add-to-wishlist", { productId }),

  removeFromWishlist: (productId: number) =>
    api.delete(`/wishlist/remove-from-wishlist/${productId}`),
};

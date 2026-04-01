import api from "@/lib/api";

export const cartService = {
  getCart: () => api.get("/cart/get-cart"),

  addItem: (dto: { variantId: number; quantity: number }) =>
    api.post("/cart/add-items", dto),

  updateItem: (itemId: number, dto: { variantId: number; quantity: number }) =>
    api.put(`/cart/update-items/${itemId}`, dto),

  removeItem: (itemId: number) => api.delete(`/cart/delete-items/${itemId}`),
};

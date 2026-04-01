import { CartStoreActionsType, CartStoreStateType } from "@/types";
import { create } from "zustand";
import { cartService } from "../../service/cart.service";

const useCartStore = create<CartStoreStateType & CartStoreActionsType>((set, get) => ({
  cart: [],

  loadCart: async () => {
    try {
      const res = await cartService.getCart();
      set({ cart: res.data.data.items });
    } catch {
      set({ cart: [] });
    }
  },

  addToCart: async (variantId: number, quantity: number) => {
    try {
      await cartService.addItem({ variantId, quantity });
      await get().loadCart();
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  },

  updateCartQuantity: async (itemId: number, variantId: number, quantity: number) => {
    try {
      await cartService.updateItem(itemId, { variantId, quantity });
      await get().loadCart();
    } catch (err) {
      console.error("Failed to update cart quantity", err);
    }
  },

  removeFromCart: async (itemId: number) => {
    try {
      await cartService.removeItem(itemId);
      await get().loadCart();
    } catch (err) {
      console.error("Failed to remove from cart", err);
    }
  },

  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;
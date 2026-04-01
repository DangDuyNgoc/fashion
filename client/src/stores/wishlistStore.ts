import { WishlistStoreActionsType, WishlistStoreStateType, WishlistItemType } from "@/types";
import { create } from "zustand";
import { wishlistService } from "../../service/wishlist.service";

const useWishlistStore = create<WishlistStoreStateType & WishlistStoreActionsType>((set, get) => ({
  wishlist: [],
  wishlistProductIds: new Set<number>(),
  loading: false,

  loadWishlist: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    try {
      set({ loading: true });
      const res = await wishlistService.getWishlist();
      const items: WishlistItemType[] = res.data.data;
      set({ 
        wishlist: items,
        wishlistProductIds: new Set(items.map(i => i.productId)),
        loading: false
      });
    } catch {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    const { wishlistProductIds } = get();
    const isInWishlist = wishlistProductIds.has(productId);

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
      await get().loadWishlist();
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  },

  clearWishlist: () => set({ wishlist: [], wishlistProductIds: new Set() }),
}));

export default useWishlistStore;

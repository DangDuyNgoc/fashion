import { AuthStoreActionsType, AuthStoreStateType } from "@/types";
import { create } from "zustand";

const useAuthStore = create<AuthStoreStateType & AuthStoreActionsType>((set) => ({
  isLoggedIn: false,

  setIsLoggedIn: (status: boolean) => set({ isLoggedIn: status }),

  checkLoginStatus: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      set({ isLoggedIn: !!token });
    }
  },
}));

export default useAuthStore;

"use client";

import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { Package, Home, User, LogOut, ClipboardList, UserCircle, Heart } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCartIcon";
import { useEffect, useRef, useState } from "react";
import { authService } from "../../service/auth.service";
import { useRouter } from "next/navigation";
import useCartStore from "@/stores/cartStore";
import useAuthStore from "@/stores/authStore";
import useWishlistStore from "@/stores/wishlistStore";

const Navbar = () => {
  const router = useRouter();
  const { isLoggedIn, checkLoginStatus, setIsLoggedIn } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { loadCart, clearCart } = useCartStore();
  const { wishlist, loadWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isLoggedIn) {
      loadCart();
      loadWishlist();
    } else {
      clearCart();
      clearWishlist();
    }
  }, [isLoggedIn, loadCart, clearCart, loadWishlist, clearWishlist]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || "";
      await authService.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setDropdownOpen(false);
      router.push("/");
    }
  };

  return (
    <nav className="w-full flex items-center justify-between border-b border-gray-200 pb-4">
      {/* LEFT */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="Fashion"
          width={36}
          height={36}
          className="w-6 h-6 md:w-9 md:h-9"
        />
        <p className="hidden md:block text-md font-medium tracking-wider">
          FASHION.
        </p>
      </Link>
      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <SearchBar />
        <Link href="/">
          <Home className="w-4 h-4 text-gray-600"/>
        </Link>
        <Link href="/orders">
          <Package className="w-4 h-4 text-gray-600"/>
        </Link>
        <Link href="/wishlist" className="relative">
          <Heart className="w-4 h-4 text-gray-600" />
          {wishlist.length > 0 && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {wishlist.length}
            </div>
          )}
        </Link>
        <ShoppingCartIcon/>

        {isLoggedIn ? (
          /* USER DROPDOWN */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Tài khoản"
            >
              <User className="w-4 h-4 text-gray-600" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-gray-500" />
                  Cập nhật hồ sơ
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 text-gray-500" />
                  Lịch sử mua hàng
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

"use client";

import ProductCard from "@/components/ProductCard";
import useWishlistStore from "@/stores/wishlistStore";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const { wishlist, loading, loadWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    loadWishlist();
  }, [isLoggedIn, loadWishlist, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="bg-red-50 p-8 rounded-full">
          <Heart className="w-16 h-16 text-red-200" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Danh sách yêu thích trống!</h2>
          <p className="text-gray-500 max-w-sm text-sm">
            Hãy thêm những sản phẩm bạn yêu thích vào danh sách để dễ dàng theo dõi và mua sắm sau này.
          </p>
        </div>
        <Link
          href="/"
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
        >
          <ShoppingBag size={18} />
          Khám phá ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 max-w-7xl mx-auto px-4 md:px-8 pb-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
          <Heart className="text-white fill-white" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
          <p className="text-sm text-gray-500">Bạn đang có {wishlist.length} sản phẩm trong danh sách</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12">
        {wishlist.map((item) => (
          <ProductCard
            key={item.id}
            product={{
              id: item.productId,
              name: item.productName,
              description: "",
              price: item.price,
              categoryId: 0,
              categoryName: "",
              createdAt: "",
              variants: item.variants,
              images: [{ id: 0, productId: item.productId, imageUrl: item.imageUrl || "" }]
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

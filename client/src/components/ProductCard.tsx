"use client";

import useCartStore from "@/stores/cartStore";
import useWishlistStore from "@/stores/wishlistStore";
import { ApiProductType } from "@/types";
import { ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatImageUrl } from "@/lib/api";
import { translateColor } from "@/lib/colors";

const ProductCard = ({ product }: { product: ApiProductType }) => {
  const { wishlistProductIds, toggleWishlist } = useWishlistStore();
  const isInWishlist = wishlistProductIds.has(product.id);

  // Derive unique colors and sizes from variants
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");

  const { addToCart } = useCartStore();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập để yêu thích sản phẩm này!");
      return;
    }
    
    await toggleWishlist(product.id);
  };

  // Find matching image for selected color
  const selectedImage = product.images.find(
    (img) => img.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
  ) || product.images[0];
  
  const imageUrl = formatImageUrl(selectedImage?.imageUrl);

  const handleAddToCart = async () => {
    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }

    // Find matching variant
    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
    const variantStock = variant?.stock || 0;

    if (!variant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp.");
      return;
    }

    if (variantStock <= 0) {
      toast.error("Sản phẩm đã hết hàng.");
      return;
    }

    try {
      await addToCart(variant.id, 1);
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const currentVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const isOutOfStock = (currentVariant?.stock || 0) <= 0;

  return (
    <div className="shadow-lg rounded-lg overflow-hidden group">
      {/* IMAGE */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[2/3] bg-gray-100">
          <Image
            key={imageUrl}
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-all duration-300 animate-fade-in"
          />
          {/* WISHLIST BUTTON */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm z-10"
          >
            <Heart
              size={18}
              className={`${
                isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
              } transition-colors`}
            />
          </button>
        </div>
      </Link>
      {/* PRODUCT DETAIL */}
      <div className="flex flex-col gap-4 p-4">
        <h1 className="font-medium">{product.name}</h1>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        {/* PRODUCT TYPES */}
        <div className="flex items-center gap-4 text-xs">
          {/* SIZES */}
          {sizes.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Kích cỡ</span>
              <select
                name="size"
                className="ring ring-gray-300 rounded-md px-2 py-1 outline-none"
                value={selectedSize}
                onChange={(e) => {
                  const newSize = e.target.value;
                  setSelectedSize(newSize);
                  // Auto-switch color if not compatible
                  const isCompatible = product.variants.some(
                    (v) => v.color === selectedColor && v.size === newSize
                  );
                  if (!isCompatible) {
                    const firstValidVariant = product.variants.find(
                      (v) => v.size === newSize
                    );
                    if (firstValidVariant) {
                      setSelectedColor(firstValidVariant.color);
                    }
                  }
                }}
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* COLORS */}
          {colors.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500">Màu sắc</span>
              <div className="flex items-center gap-2">
                {colors.map((color) => (
                  <div
                    className={`cursor-pointer border-1 ${
                      selectedColor === color
                        ? "border-gray-400"
                        : "border-gray-200"
                    } rounded-full p-[1.2px] transition-all`}
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={translateColor(color)}
                  >
                    <div
                      className="w-[14px] h-[14px] rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* PRICE AND ADD TO CART BUTTON */}
        <div className="flex items-center justify-between">
          <p className="font-medium">
            {new Intl.NumberFormat("vi-VN").format(Number(product.price))} ₫
          </p>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`ring-1 ${
              isOutOfStock 
                ? "ring-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "ring-gray-200 shadow-lg cursor-pointer hover:text-white hover:bg-black"
            } rounded-md px-2 py-1 text-sm transition-all duration-300 flex items-center gap-2`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

"use client";

import useCartStore from "@/stores/cartStore";
import { ApiProductType } from "@/types";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { translateColor } from "@/lib/colors";
import useWishlistStore from "@/stores/wishlistStore";

const ProductInteraction = ({
  product,
  selectedSize,
  selectedColor,
}: {
  product: ApiProductType;
  selectedSize: string;
  selectedColor: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCartStore();
  const { wishlistProductIds, toggleWishlist } = useWishlistStore();
  const isInWishlist = wishlistProductIds.has(product.id);

  const handleWishlistToggle = async () => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập để yêu thích sản phẩm này!");
      return;
    }
    await toggleWishlist(product.id);
  };

  // Derive unique colors and sizes from variants
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.map((v) => v.size))];

  const variant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const variantStock = variant?.stock || 0;

  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      if (quantity < variantStock) {
        setQuantity((prev) => prev + 1);
      } else {
        toast.warning(`Chỉ còn ${variantStock} sản phẩm trong kho`);
      }
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = async () => {
    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }

    if (!variant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp.");
      return;
    }
    try {
      setIsAddingToCart(true);
      await addToCart(variant.id, quantity);
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để mua hàng.");
      return;
    }

    if (!variant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp.");
      return;
    }
    try {
      setIsAddingToCart(true);
      await addToCart(variant.id, quantity);
      router.push("/cart?step=2");
    } catch {
      toast.error("Không thể xử lý yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* SIZE */}
      <div className="flex flex-col gap-2 text-xs">
        <span className="text-gray-500">Kích cỡ</span>
        <div className="flex items-center gap-2">
          {sizes.map((size) => (
            <div
              className={`cursor-pointer border-1 p-[2px] transition-all hover:scale-105 ${
                selectedSize === size ? "border-gray-600" : "border-gray-300"
              }`}
              key={size}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("size", size);

                // Auto-switch color if current is not compatible
                const isCompatible = product.variants.some(
                  (v) => v.color === selectedColor && v.size === size
                );
                if (!isCompatible) {
                  const firstValidVariant = product.variants.find(
                    (v) => v.size === size
                  );
                  if (firstValidVariant) {
                    params.set("color", firstValidVariant.color);
                  }
                }
                router.push(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
            >
              <div
                className={`w-6 h-6 text-center flex items-center justify-center transition-colors ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {size.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* COLOR */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Màu sắc:</span>
          <span className="font-medium">{translateColor(selectedColor)}</span>
        </div>
        <div className="flex items-center gap-2">
          {colors.map((color) => (
            <div
              className={`cursor-pointer border-1 p-[2px] rounded-sm transition-all hover:scale-110 ${
                selectedColor === color
                  ? "border-gray-400"
                  : "border-transparent"
              }`}
              key={color}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("color", color);

                // Auto-switch size if current is not compatible
                const isCompatible = product.variants.some(
                  (v) => v.color === color && v.size === selectedSize
                );
                if (!isCompatible) {
                  const firstValidVariant = product.variants.find(
                    (v) => v.color === color
                  );
                  if (firstValidVariant) {
                    params.set("size", firstValidVariant.size);
                  }
                }
                router.push(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              title={translateColor(color)}
            >
              <div
                className="w-6 h-6 rounded-xs shadow-sm"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* QUANTITY */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-gray-500">Số lượng</span>
        <div className="flex items-center gap-2">
          <button
            className={`cursor-pointer border-1 border-gray-300 p-1 disabled:opacity-30 disabled:cursor-not-allowed`}
            onClick={() => handleQuantityChange("decrement")}
            disabled={variantStock <= 0}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={variantStock <= 0 ? "text-gray-400" : ""}>{variantStock <= 0 ? 0 : quantity}</span>
          <button
            className={`cursor-pointer border-1 border-gray-300 p-1 disabled:opacity-30 disabled:cursor-not-allowed`}
            onClick={() => handleQuantityChange("increment")}
            disabled={variantStock <= 0}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* BUTTONS */}
      <button
        onClick={handleAddToCart}
        disabled={variantStock <= 0 || isAddingToCart}
        className={`w-full ${
          variantStock > 0 ? "bg-gray-800 hover:bg-black" : "bg-gray-400 cursor-not-allowed"
        } text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm font-medium disabled:opacity-70`}
      >
        <Plus className="w-4 h-4" />
        {variantStock > 0 ? (isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng") : "Hết hàng"}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={variantStock <= 0 || isAddingToCart}
        className={`ring-1 ring-gray-400 shadow-lg text-gray-800 px-4 py-2 rounded-md flex items-center justify-center cursor-pointer gap-2 text-sm font-medium transition-colors disabled:opacity-70 ${
          variantStock > 0 ? "hover:bg-gray-50" : "bg-gray-100 cursor-not-allowed"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Mua ngay
      </button>

      <button
        onClick={handleWishlistToggle}
        className={`w-full ring-1 ${
          isInWishlist ? "ring-red-500 text-red-500 bg-red-50" : "ring-gray-300 text-gray-600 hover:bg-gray-50"
        } px-4 py-2 rounded-md flex items-center justify-center cursor-pointer gap-2 text-sm font-medium transition-all duration-300`}
      >
        <Heart size={16} className={isInWishlist ? "fill-red-500" : ""} />
        {isInWishlist ? "Đã yêu thích" : "Thêm vào yêu thích"}
      </button>
    </div>
  );
};

export default ProductInteraction;
"use client";

import PaymentForm from "@/components/PaymentForm";
import ShippingForm from "@/components/ShippingForm";
import useCartStore from "@/stores/cartStore";
import { ShippingFormInputs } from "@/types";
import { ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatImageUrl } from "@/lib/api";
import { translateColor } from "@/lib/colors";

// Helper to translate "Color / Size" strings
const translateVariantName = (variantName: string) => {
  if (!variantName) return "";
  const parts = variantName.split(" / ");
  if (parts.length === 2) {
    return `${translateColor(parts[0])} / ${parts[1]}`;
  }
  return translateColor(variantName);
};

const steps = [
  {
    id: 1,
    title: "Giỏ hàng",
  },
  {
    id: 2,
    title: "Địa chỉ nhận hàng",
  },
  {
    id: 3,
    title: "Phương thức thanh toán",
  },
];

// TEMPORARY
// const cartItems: CartItemsType = [
//   {
//     id: 1,
//     name: "Adidas CoreFit T-Shirt",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 39.9,
//     sizes: ["s", "m", "l", "xl", "xxl"],
//     colors: ["gray", "purple", "green"],
//     images: {
//       gray: "/products/1g.png",
//       purple: "/products/1p.png",
//       green: "/products/1gr.png",
//     },
//     quantity: 1,
//     selectedSize: "m",
//     selectedColor: "gray",
//   },
//   {
//     id: 2,
//     name: "Puma Ultra Warm Zip",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 59.9,
//     sizes: ["s", "m", "l", "xl"],
//     colors: ["gray", "green"],
//     images: { gray: "/products/2g.png", green: "/products/2gr.png" },
//     quantity: 1,
//     selectedSize: "l",
//     selectedColor: "gray",
//   },
//   {
//     id: 3,
//     name: "Nike Air Essentials Pullover",
//     shortDescription:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     description:
//       "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
//     price: 69.9,
//     sizes: ["s", "m", "l"],
//     colors: ["green", "blue", "black"],
//     images: {
//       green: "/products/3gr.png",
//       blue: "/products/3b.png",
//       black: "/products/3bl.png",
//     },
//     quantity: 1,
//     selectedSize: "l",
//     selectedColor: "black",
//   },
// ];

const CartPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart, updateCartQuantity } = useCartStore();

  if (cart.length === 0 && activeStep === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="bg-gray-100 p-8 rounded-full">
          <Image
            src="/empty-cart.png"
            alt="Giỏ hàng trống"
            width={120}
            height={120}
            className="opacity-40"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Giỏ hàng trống!</h2>
          <p className="text-gray-500 max-w-sm text-sm">
            Có vẻ như bạn chưa chọn được sản phẩm nào. Hãy khám phá bộ sưu tập mới nhất của chúng tôi nhé.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-800 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
        >
          Mua ngay
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12 max-w-7xl mx-auto px-4 md:px-8">
      {/* TITLE */}
      <h1 className="text-2xl font-medium">Giỏ hàng của bạn</h1>
      {/* STEPS */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            className={`flex items-center gap-2 border-b-2 pb-4 ${
              step.id === activeStep ? "border-gray-800" : "border-gray-200"
            }`}
            key={step.id}
          >
            <div
              className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${
                step.id === activeStep ? "bg-gray-800" : "bg-gray-400"
              }`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium ${
                step.id === activeStep ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
          </div>
        ))}
      </div>
      {/* STEPS & DETAILS */}
      <div className="w-full flex flex-col lg:flex-row gap-16">
        {/* STEPS */}
        <div className="w-full lg:w-7/12 shadow-lg border-1 border-gray-100 p-8 rounded-lg flex flex-col gap-8">
          {activeStep === 1 ? (
            cart.map((item) => (
              // SINGLE CART ITEM
              <div
                className="flex items-center justify-between"
                key={item.id}
              >
                {/* IMAGE AND DETAILS */}
                <div className="flex gap-8">
                  {/* IMAGE */}
                  <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={formatImageUrl(item.imageUrl)}
                      alt={item.productName}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* ITEM DETAILS */}
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateCartQuantity(item.id, item.variantId, item.quantity - 1);
                            } else {
                              removeFromCart(item.id);
                            }
                          }}
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            updateCartQuantity(item.id, item.variantId, item.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Phân loại: {translateVariantName(item.variantName)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} ₫
                    </p>
                  </div>
                </div>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 text-red-400 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentForm shippingForm={shippingForm} />
          ) : (
            <p className="text-sm text-gray-500">
              Vui lòng điền thông tin nhận hàng để tiếp tục.
            </p>
          )}
        </div>
        {/* DETAILS */}
        <div className="w-full lg:w-5/12 shadow-lg border-1 border-gray-100 p-8 rounded-lg flex flex-col gap-8 h-max">
          <h2 className="font-semibold">Chi tiết đơn hàng</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Tạm tính</p>
              <p className="font-medium">
                {new Intl.NumberFormat("vi-VN").format(
                  cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
                )}{" "}
                ₫
              </p>
            </div>
            {/* <div className="flex justify-between text-sm">
              <p className="text-gray-500">Giảm giá(10%)</p>
              <p className="font-medium">20.000 ₫</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Phí giao hàng</p>
              <p className="font-medium">30.000 ₫</p>
            </div> */}
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <p className="text-gray-800 font-semibold">Tổng cộng</p>
              <p className="font-bold text-lg">
                {new Intl.NumberFormat("vi-VN").format(
                  cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
                )}{" "}
                ₫
              </p>
            </div>
          </div>
          {activeStep === 1 ? (
            <button
              onClick={() => router.push("/cart?step=2", { scroll: false })}
              className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 font-medium"
            >
              Tiếp tục
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/cart?step=${activeStep - 1}`, { scroll: false })}
              className="w-full border border-gray-800 text-gray-800 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;

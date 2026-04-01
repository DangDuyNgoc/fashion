"use client";

import { ShippingFormInputs } from "@/types";
import { CheckCircle, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { orderService } from "../../service/order.service";
import { toast } from "react-toastify";
import useCartStore from "@/stores/cartStore";

const PaymentForm = ({ shippingForm }: { shippingForm: ShippingFormInputs }) => {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrder = async () => {
    try {
      setIsSubmitting(true);
      const res = await orderService.create({
        addressId: shippingForm.addressId,
        paymentMethod: "COD",
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("Đặt hàng thành công!");
        clearCart();
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi xảy ra khi đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="w-5 h-5 text-gray-800" /> Phương thức thanh toán
        </h2>
        <p className="text-sm text-gray-500">
          Hệ thống hiện tại chỉ hỗ trợ thanh toán khi nhận hàng (COD).
        </p>
      </div>

      {/* COD OPTION */}
      <div className="flex items-center justify-between p-4 border-2 border-gray-800 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
            <p className="text-xs text-gray-400">Thanh toán bằng tiền mặt khi bạn nhận hàng.</p>
          </div>
        </div>
        <p className="text-sm font-bold text-gray-800">Miễn phí</p>
      </div>

      {/* SHIPPING SUMMARY */}
      <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-2">
        <h3 className="text-sm font-medium border-b pb-2 mb-2">Thông tin giao hàng</h3>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Người nhận:</span>
          <span className="font-medium">{shippingForm.name}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Số điện thoại:</span>
          <span className="font-medium">{shippingForm.phone}</span>
        </div>
        <div className="flex flex-col gap-1 text-xs mt-2">
          <span className="text-gray-500">Địa chỉ:</span>
          <span className="font-medium leading-relaxed">{shippingForm.address}, {shippingForm.city}</span>
        </div>
      </div>

      <button
        onClick={handleCreateOrder}
        disabled={isSubmitting}
        className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
      </button>
    </div>
  );
};

export default PaymentForm;

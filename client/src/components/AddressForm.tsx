"use client";

import { AddressType, CreateAddressDTO } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const addressSchema = z.object({
  addressLine: z.string().min(5, "Địa chỉ chi tiết phải có ít nhất 5 ký tự"),
  city: z.string().min(2, "Vui lòng nhập Tỉnh/Thành phố"),
  district: z.string().min(2, "Vui lòng nhập Quận/Huyện"),
  isDefault: z.boolean().optional(),
});

interface AddressFormProps {
  initialData?: AddressType;
  onSubmit: (data: CreateAddressDTO) => Promise<void>;
  isLoading: boolean;
}

const AddressForm = ({ initialData, onSubmit, isLoading }: AddressFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAddressDTO>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData
      ? {
          addressLine: initialData.addressLine,
          city: initialData.city,
          district: initialData.district,
          isDefault: initialData.isDefault,
        }
      : {
          addressLine: "",
          city: "",
          district: "",
          isDefault: false,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ chi tiết (Số nhà, Tên đường)
        </label>
        <input
          {...register("addressLine")}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.addressLine ? "border-red-500" : "border-gray-200"
          }`}
          placeholder="Ví dụ: 123 Đường ABC..."
        />
        {errors.addressLine && (
          <p className="mt-1 text-xs text-red-500">{errors.addressLine.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận / Huyện
          </label>
          <input
            {...register("district")}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.district ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.district && (
            <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh / Thành phố
          </label>
          <input
            {...register("city")}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.city ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          {...register("isDefault")}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shadow-sm"
        />
        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {initialData ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;

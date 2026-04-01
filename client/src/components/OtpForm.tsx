"use client";

import { ShieldCheck, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const verifySchema = z.object({
  otpCode: z.string().min(1, "Vui lòng nhập mã OTP"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

interface OtpFormProps {
  email: string;
  isLoading: boolean;
  serverError?: string;
  onSubmit: (otpCode: string) => void | Promise<void>;
}

export default function OtpForm({ email, isLoading, serverError, onSubmit }: OtpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  const handleFormSubmit = async (data: VerifyFormValues) => {
    await onSubmit(data.otpCode.trim());
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Xác Thực Email</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Chúng tôi đã gửi mã xác thực tới email{" "}
          <strong className="text-gray-800">{email}</strong>. Vui lòng nhập mã để tiếp tục.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Mã OTP
          </label>
          <input
            type="text"
            maxLength={10}
            {...register("otpCode")}
            className={`block w-full px-3 py-3 border rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
              ${errors.otpCode || serverError ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
            placeholder="······"
            autoFocus
            autoComplete="one-time-code"
          />
          {errors.otpCode && (
            <p className="mt-1.5 text-xs text-red-500 font-medium text-center">
              {errors.otpCode.message}
            </p>
          )}
          {/* Server-side OTP error shown immediately */}
          {serverError && !errors.otpCode && (
            <p className="mt-1.5 text-xs text-red-500 font-medium text-center">
              {serverError}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Mã OTP có hiệu lực trong 5 phút. Kiểm tra cả thư mục spam.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Đang xác thực...
            </>
          ) : (
            "Xác nhận"
          )}
        </button>
      </form>
    </div>
  );
}

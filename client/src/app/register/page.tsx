/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, UserPlus } from "lucide-react";
import { authService } from "../../../service/auth.service";
import OtpForm from "@/components/OtpForm";

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionToken, setSessionToken] = useState("");
  const [tempCredentials, setTempCredentials] = useState({ email: "", password: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onRegister = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const res = await authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      if (res.data?.sessionToken) {
        setSessionToken(res.data.sessionToken);
      }

      setTempCredentials({ email: data.email, password: data.password });
      setStep(2);
      toast.success("Mã xác thực đã được gửi đến email của bạn.");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async (otpCode: string) => {
    try {
      setIsLoading(true);

      await authService.verifyEmail({
        email: tempCredentials.email,
        otpCode,
        sessionToken,
      });

      toast.success("Xác thực thành công! Đang đăng nhập...");

      const loginRes = await authService.login({
        email: tempCredentials.email,
        password: tempCredentials.password,
      });

      if (loginRes.data) {
        if (loginRes.data.accessToken) localStorage.setItem("token", loginRes.data.accessToken);
        if (loginRes.data.refreshToken) localStorage.setItem("refreshToken", loginRes.data.refreshToken);
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
                <p className="text-gray-500 mt-2 text-sm">Tham gia cùng chúng tôi ngay hôm nay</p>
              </div>

              <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      {...register("fullName")}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                        ${errors.fullName ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  {errors.fullName && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      {...register("email")}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                        ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      placeholder="name@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      {...register("password")}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                        ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                        ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                  Đăng nhập
                </Link>
              </div>
            </>
          )}

          {step === 2 && (
            <OtpForm
              email={tempCredentials.email}
              isLoading={isLoading}
              onSubmit={onVerify}
            />
          )}
        </div>
      </div>
    </div>
  );
}

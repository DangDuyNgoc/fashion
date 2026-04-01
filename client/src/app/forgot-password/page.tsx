/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { authService } from "../../../service/auth.service";
import OtpForm from "@/components/OtpForm";

const forgotPasswordSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 1 = email form, 2 = otp form, 3 = new password form
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sessionToken, setSessionToken] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempOtp, setTempOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);

  const {
    register: emailForm,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: pwForm,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      const res = await authService.forgotPassword(data);
      if (res.data?.sessionToken) {
        setSessionToken(res.data.sessionToken);
      }
      setTempEmail(data.email);
      setStep(2);
      toast.success("Mã xác thực đã được gửi đến email của bạn.");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Không thể gửi mã. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpVerify = async (otpCode: string) => {
    try {
      setIsLoading(true);
      setOtpError(undefined);
      // Verify OTP immediately using the verify-email endpoint (shared OTP logic)
      await authService.verifyEmail({
        email: tempEmail,
        otpCode,
        sessionToken,
      });
      // OTP is valid — save it and proceed to password step
      setTempOtp(otpCode);
      setStep(3);
    } catch (error: any) {
      console.error(error);
      setOtpError(
        error?.response?.data?.message || "Mã OTP không hợp lệ. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      await authService.resetPassword({
        email: tempEmail,
        otpCode: tempOtp,
        sessionToken,
        newPassword: data.newPassword,
      });
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      // If OTP is wrong, step back to OTP entry
      if (error?.response?.data?.message?.toLowerCase().includes("otp")) {
        toast.error("Mã OTP không hợp lệ. Vui lòng thử lại.");
        setStep(2);
      } else {
        toast.error(error?.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                <KeyRound className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Nhập email của bạn và chúng tôi sẽ gửi mã để đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    {...emailForm("email")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                      ${emailErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    placeholder="name@example.com"
                  />
                </div>
                {emailErrors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{emailErrors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã xác thực"
                )}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <OtpForm
            email={tempEmail}
            isLoading={isLoading}
            serverError={otpError}
            onSubmit={onOtpVerify}
          />
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Đặt mật khẩu mới</h1>
              <p className="text-gray-500 mt-2 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            <form onSubmit={handlePwSubmit(onResetPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    {...pwForm("newPassword")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                      ${pwErrors.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    placeholder="••••••••"
                  />
                </div>
                {pwErrors.newPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{pwErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    {...pwForm("confirmPassword")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white
                      ${pwErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200"}`}
                    placeholder="••••••••"
                  />
                </div>
                {pwErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{pwErrors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center text-sm">
          <Link href="/login" className="inline-flex items-center justify-center font-bold text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

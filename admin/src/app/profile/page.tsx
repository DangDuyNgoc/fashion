/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/service/auth.service";
import { Button } from "@/components/ui/button";      
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import Image from "next/image";

const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && !data.oldPassword) {
    return false;
  }
  return true;
}, {
  message: "Vui lòng nhập mật khẩu cũ nếu muốn đổi mật khẩu mới",
  path: ["oldPassword"],
});

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      oldPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        const data = res.data?.data || res.data;
        if (data) {
          form.reset({
            name: data.name || "",
            phone: data.phone || "",
            oldPassword: "",
            newPassword: "",
          });
          setAvatarUrl(data.avatarUrl || null);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("Lỗi khi tải dữ liệu cá nhân");
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setLoading(true);
    try {
      await authService.updateProfile({
        name: values.name,
        phone: values.phone,
        oldPassword: values.oldPassword || null,
        newPassword: values.newPassword || null,
      });
      toast.success("Cập nhật hồ sơ thành công!");
      form.setValue("oldPassword", "");
      form.setValue("newPassword", "");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(err.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await authService.uploadAvatar(file);
      setAvatarUrl(res.data?.avatarUrl);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải ảnh đại diện");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Hồ sơ cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-4 mb-6">
                <div className="w-24 h-24 relative rounded-full overflow-hidden border bg-muted">
                  <Image
                    src={avatarUrl ? (avatarUrl.startsWith("http") ? avatarUrl : `http://localhost:5015${avatarUrl}`) : "/users/1.png"}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpdate}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer px-4 py-2 bg-secondary text-sm rounded-md shadow hover:bg-secondary/80"
                  >
                    Đổi ảnh đại diện
                  </label>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Vd: Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="09xxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-semibold mb-3">Đổi mật khẩu (không bắt buộc)</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu cũ</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full mt-6">
                    {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

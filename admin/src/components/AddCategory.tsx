"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { categoriesService } from "@/service/categories.service";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Category } from "@/types/api";

const formSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập tên!" }),
});

interface AddCategoryProps {
  initialData?: Category | null;
  onSuccess?: () => void;
}

const AddCategory = ({ initialData, onSuccess }: AddCategoryProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: initialData?.name || "" }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      if (initialData) {
        await categoriesService.update(initialData.id, values);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoriesService.create({ name: values.name });
        toast.success("Thêm danh mục thành công!");
      }
      form.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Thêm danh mục thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="mb-4">{initialData ? "Cập nhật danh mục" : "Thêm danh mục"}</SheetTitle>
        <SheetDescription asChild>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Nhập tên danh mục.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </form>
          </Form>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  );
};

export default AddCategory;

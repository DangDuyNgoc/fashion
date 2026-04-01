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
import { useState, useEffect } from "react";
import { categoriesService } from "@/service/categories.service";
import { productsService } from "@/service/products.service";
import { productVariantsService } from "@/service/product-variants.service";
import { productImagesService } from "@/service/product-images.service";
import { toast } from "react-toastify";
import { Product, Category } from "@/types/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập tên sản phẩm!" }),
  description: z.string().min(1, { message: "Vui lòng nhập mô tả!" }),
  price: z.coerce.number().min(1, { message: "Vui lòng nhập giá!" }),
  categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục!" }),
  stock: z.coerce.number().min(0, { message: "Vui lòng nhập số lượng!" }),
  sizes: z.array(z.string()).min(1, { message: "Chọn ít nhất 1 kích thước" }),
  colors: z.array(z.string()).min(1, { message: "Chọn ít nhất 1 màu sắc" }),
});

interface AddProductProps {
  initialData?: Product | null;
  onSuccess?: () => void;
}

const AddProduct = ({ initialData, onSuccess }: AddProductProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const [existingImages, setExistingImages] = useState(initialData?.images || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: initialData?.name || "", 
      description: initialData?.description || "", 
      price: initialData?.price || 0, 
      categoryId: initialData?.categoryId?.toString() || "", 
      stock: initialData?.variants?.[0]?.stock || 0,
      sizes: initialData?.variants ? Array.from(new Set(initialData.variants.map((v) => v.size))) : [], 
      colors: initialData?.variants ? Array.from(new Set(initialData.variants.map((v) => v.color))) : [] 
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        categoryId: initialData.categoryId.toString(),
        stock: initialData.variants?.[0]?.stock || 0,
        sizes: initialData.variants ? Array.from(new Set(initialData.variants.map((v) => v.size))) : [],
        colors: initialData.variants ? Array.from(new Set(initialData.variants.map((v) => v.color))) : [],
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesService.getAll();
        setCategoryList(res.data.data || res.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleDeleteImage = async (id: number) => {
    try {
      await productImagesService.delete(id);
      setExistingImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Đã xóa hình ảnh!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa hình ảnh.");
    }
  };

  const handleUpdateImageColor = async (id: number, color: string) => {
    try {
      await productImagesService.updateColor(id, color);
      setExistingImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, color } : img))
      );
      toast.success("Đã cập nhật màu sắc cho ảnh!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật màu sắc.");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      // 1. Create or Update Product
      const productPayload = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        categoryId: Number(values.categoryId),
      };
      
      let productId = initialData?.id;

      if (initialData) {
        await productsService.update(initialData.id, productPayload);
        // Also update variants stock for existing ones (simplified logic)
        const variantPromises = [];
        for (const color of values.colors) {
          for (const size of values.sizes) {
            variantPromises.push(
              productVariantsService.create({
                productId: initialData.id,
                color,
                size,
                stock: Number(values.stock),
              })
            );
          }
        }
        await Promise.all(variantPromises);
      } else {
        const productRes = await productsService.create(productPayload);
        productId = productRes.data?.id || productRes.data?.data?.id;

        if (!productId) throw new Error("Product creation returned no ID.");

        // 2. Create Variants
        const variantPromises = [];
        for (const color of values.colors) {
          for (const size of values.sizes) {
            variantPromises.push(
              productVariantsService.create({
                productId,
                color,
                size,
                stock: Number(values.stock),
              })
            );
          }
        }
        await Promise.all(variantPromises);
      }

      // 3. Upload Images (Works for both Create and Edit)
      if (productId) {
        for (const color of values.colors) {
          if (imageFiles[color]) {
            const formData = new FormData();
            formData.append("productId", productId.toString());
            formData.append("color", color);
            formData.append("Images", imageFiles[color]);
            await productImagesService.upload(formData);
          }
        }
      }

      toast.success(initialData ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
      
      form.reset();
      setImageFiles({});
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(initialData ? "Cập nhật sản phẩm thất bại!" : "Thêm sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen w-full pr-4">
        <SheetHeader>
          <SheetTitle className="mb-4">{initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Nhập tên sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Nhập mô tả chi tiết cho sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nhập giá của sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Chọn danh mục cho sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kích thước</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {sizes.map((size) => (
                            <div className="flex items-center gap-2" key={size}>
                              <Checkbox
                                id="size"
                                checked={field.value?.includes(size)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, size]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((v) => v !== size)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor="size" className="text-xs">
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Chọn các kích thước có sẵn cho sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Màu sắc</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 my-2">
                            {colors.map((color) => (
                              <div
                                className="flex items-center gap-2"
                                key={color}
                              >
                                <Checkbox
                                  id="color"
                                  checked={field.value?.includes(color)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, color]);
                                    } else {
                                      field.onChange(
                                        currentValues.filter((v) => v !== color)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="color"
                                  className="text-xs flex items-center gap-2"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  {color}
                                </label>
                              </div>
                            ))}
                          </div>
                          {/* EXISTING IMAGES GALLERY */}
                          {initialData && existingImages.length > 0 && (
                            <div className="mt-6 space-y-4">
                              <p className="text-sm font-semibold border-t pt-4">Hình ảnh hiện tại:</p>
                              <div className="grid grid-cols-2 gap-4">
                                {existingImages.map((img) => (
                                  <div key={img.id} className="relative group border rounded-lg p-2 bg-gray-50 flex flex-col gap-2">
                                    <div className="relative aspect-square w-full rounded overflow-hidden">
                                      <Image 
                                        src={img.imageUrl.startsWith("http") ? img.imageUrl : `http://localhost:5015${img.imageUrl}`} 
                                        alt="Product" 
                                        fill 
                                        className="object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                      </button>
                                    </div>
                                    <Select 
                                      value={img.color || ""} 
                                      onValueChange={(val) => handleUpdateImageColor(img.id, val)}
                                    >
                                      <SelectTrigger className="h-7 text-[10px]">
                                        <SelectValue placeholder="Chọn màu" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">Không xác định</SelectItem>
                                        {(field.value || []).map((c: string) => (
                                          <SelectItem key={c} value={c}>
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: c}} />
                                              {c}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {field.value && field.value.length > 0 && (
                            <div className="mt-8 space-y-4">
                              <p className="text-sm font-medium border-t pt-4">Tải lên hình ảnh mới cho các màu:</p>
                              {field.value.map((color) => (
                                <div className="flex items-center gap-2" key={color}>
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-sm min-w-[60px]">{color}</span>
                                  <Input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setImageFiles((prev) => ({ ...prev, [color]: e.target.files![0] }));
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Chọn các màu sắc có sẵn cho sản phẩm.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng tồn kho</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ""} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormDescription>
                        Nhập số lượng tồn kho của sản phẩm.
                      </FormDescription>
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
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;

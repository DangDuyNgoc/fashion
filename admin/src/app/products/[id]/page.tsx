"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsService } from "@/service/products.service";
import { Product } from "@/types/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProductDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (params.id) {
          const res = await productsService.getById(Number(params.id));
          setProduct(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Đang tải dữ liệu...</div>;
  }

  if (!product) {
    return <div className="p-8">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-secondary/20 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="space-y-3">
              <p><span className="font-medium">ID:</span> {product.id}</p>
              <p><span className="font-medium">Tên:</span> {product.name}</p>
              <p><span className="font-medium">Giá:</span> {product.price.toLocaleString("vi-VN")} đ</p>
              <p><span className="font-medium">Danh mục:</span> {product.categoryName}</p>
              <p><span className="font-medium">Ngày tạo:</span> {new Date(product.createdAt).toLocaleDateString("vi-VN")}</p>
              <div>
                <span className="font-medium">Mô tả:</span>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary/20 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Biến thể ({product.variants?.length || 0})</h2>
            {product.variants && product.variants.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 font-medium text-sm mb-2 border-b pb-2">
                <span>Màu sắc</span>
                <span>Kích thước</span>
                <span>Tồn kho</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có biến thể nào.</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {product.variants?.map((v) => (
                <div key={v.id} className="grid grid-cols-3 gap-2 text-sm items-center py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: v.color }}></div>
                    <span className="capitalize">{v.color}</span>
                  </div>
                  <span className="uppercase">{v.size}</span>
                  <span>{v.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-secondary/20 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Tất cả hình ảnh ({product.images?.length || 0})</h2>
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {product.images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Image
                    src={img.imageUrl.startsWith("http") ? img.imageUrl : `http://localhost:5015${img.imageUrl}`}
                    alt={`${product.name} image`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
             <div className="h-40 flex items-center justify-center border-2 border-dashed rounded-md">
               <span className="text-muted-foreground">Không có hình ảnh</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;

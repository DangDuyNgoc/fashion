"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiProductType } from "@/types";
import { productService } from "../../service/product.service";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";

const ProductList = ({
  category,
  params,
}: {
  category: string;
  params: "homepage" | "products";
}) => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ApiProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const categoryId = searchParams.get("categoryId") || undefined;
        const minPrice = searchParams.get("minPrice") || undefined;
        const maxPrice = searchParams.get("maxPrice") || undefined;
        const color = searchParams.get("color") || undefined;
        const size = searchParams.get("size") || undefined;
        const keyword = searchParams.get("keyword") || undefined;
        const sort = searchParams.get("sort") || undefined;

        const res = await productService.filter({
          categoryId: categoryId ? Number(categoryId) : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          color,
          size,
          keyword,
          sort,
          pageSize: params === "homepage" ? 8 : 20,
        });

        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, params]);

  return (
    <div className="w-full">
      <Categories />
      <Filter />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="shadow-lg rounded-lg overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-gray-200" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Không tìm thấy sản phẩm nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {params === "homepage" && (
        <Link
          href={category ? `/products/?categoryId=${category}` : "/products"}
          className="flex justify-end mt-4 underline text-sm text-gray-500"
        >
          Xem tất cả sản phẩm
        </Link>
      )}
    </div>
  );
};

export default ProductList;

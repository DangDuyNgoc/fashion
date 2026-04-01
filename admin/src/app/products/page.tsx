"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Product } from "@/types/api";
import { DataTable } from "./data-table";
import { productsService } from "@/service/products.service";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductFilterRequest } from "@/types/api";

const ProductsPage = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilterRequest>({
    Keyword: "",
    MinPrice: undefined,
    MaxPrice: undefined,
    Color: "",
    Size: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter((entry) => entry[1] !== "" && entry[1] !== undefined)
      );
      const res = await productsService.filter(cleanFilters);
      setData(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableColumns = columns(fetchProducts);

  return (
    <div className="">
      <div className="mb-4 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold text-xl">Tất cả sản phẩm</h1>
      </div>

      <div className="flex flex-col gap-4 mb-6 bg-card p-4 rounded-md shadow-sm border">
        <h2 className="font-medium text-lg">Tìm kiếm & Lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input 
            placeholder="Tìm theo tên..." 
            value={filters.Keyword || ""}
            onChange={(e) => setFilters({...filters, Keyword: e.target.value})}
          />
          <Input 
            type="number"
            placeholder="Giá thấp nhất" 
            value={filters.MinPrice || ""}
            onChange={(e) => setFilters({...filters, MinPrice: e.target.value ? Number(e.target.value) : undefined})}
          />
          <Input 
            type="number"
            placeholder="Giá cao nhất" 
            value={filters.MaxPrice || ""}
            onChange={(e) => setFilters({...filters, MaxPrice: e.target.value ? Number(e.target.value) : undefined})}
          />
          <Input 
            placeholder="Màu sắc (vd: Đỏ, Xanh...)" 
            value={filters.Color || ""}
            onChange={(e) => setFilters({...filters, Color: e.target.value})}
          />
          <Input 
            placeholder="Kích cỡ (vd: S, M, L...)" 
            value={filters.Size || ""}
            onChange={(e) => setFilters({...filters, Size: e.target.value})}
          />
          <Button onClick={fetchProducts} className="w-full lg:w-max">
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable columns={tableColumns} data={data} />
      )}
    </div>
  );
};

export default ProductsPage;

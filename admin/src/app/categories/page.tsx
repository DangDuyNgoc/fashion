"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "../products/data-table";
import { categoriesService } from "@/service/categories.service";
import { Category } from "@/types/api";

import { Input } from "@/components/ui/input";

const CategoriesPage = () => {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesService.getAll();
      setData(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const tableColumns = columns(fetchCategories);

  const filteredData = data.filter((cat) => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="">
      <div className="mb-6 px-4 py-3 bg-secondary rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-semibold text-xl">Tất cả danh mục</h1>
        <Input 
          placeholder="Tìm kiếm danh mục..." 
          className="w-full sm:w-72 bg-background"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable columns={tableColumns} data={filteredData} />
      )}
    </div>
  );
};

export default CategoriesPage;

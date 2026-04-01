"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBasket,
  Shirt,
  Footprints,
  Glasses,
  Briefcase,
  Venus,
  Hand,
  Tag,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryType } from "@/types";
import { categoryService } from "../../service/category.service";

// Map category name keywords to icons
const getIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("giày") || lower.includes("shoe")) return <Footprints className="w-4 h-4" />;
  if (lower.includes("áo thun") || lower.includes("shirt") || lower.includes("t-shirt")) return <Shirt className="w-4 h-4" />;
  if (lower.includes("kính") || lower.includes("glasses") || lower.includes("phụ kiện") || lower.includes("accessories")) return <Glasses className="w-4 h-4" />;
  if (lower.includes("túi") || lower.includes("bag")) return <Briefcase className="w-4 h-4" />;
  if (lower.includes("váy") || lower.includes("dress")) return <Venus className="w-4 h-4" />;
  if (lower.includes("khoác") || lower.includes("jacket")) return <Shirt className="w-4 h-4" />;
  if (lower.includes("găng") || lower.includes("glove")) return <Hand className="w-4 h-4" />;
  return <Tag className="w-4 h-4" />;
};

const Categories = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryType[]>([]);

  const selectedCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(res.data?.data || res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (id: number | null) => {
    const params = new URLSearchParams(searchParams);
    if (id === null) {
      params.delete("categoryId");
    } else {
      params.set("categoryId", String(id));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg mb-4 text-sm">
      {/* "All" option */}
      <div
        className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-1 rounded-md ${
          !selectedCategoryId ? "bg-white" : "text-gray-500"
        }`}
        onClick={() => handleChange(null)}
      >
        <ShoppingBasket className="w-4 h-4" />
        Tất cả
      </div>
      {categories.map((cat) => (
        <div
          className={`flex items-center justify-center gap-2 cursor-pointer px-3 py-1 rounded-md ${
            String(cat.id) === selectedCategoryId ? "bg-white" : "text-gray-500"
          }`}
          key={cat.id}
          onClick={() => handleChange(cat.id)}
        >
          {getIcon(cat.name)}
          {cat.name}
        </div>
      ))}
    </div>
  );
};

export default Categories;

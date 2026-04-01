"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("keyword") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(searchParams.get("keyword") || "");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setValue(keyword);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword.trim()) {
        params.set("keyword", keyword.trim());
      } else {
        params.delete("keyword");
      }

      if (pathname === "/products") {
        router.push(`/products?${params.toString()}`, { scroll: false });
      } else {
        // Navigate to products page with keyword
        router.push(`/products?keyword=${encodeURIComponent(keyword.trim())}`, {
          scroll: false,
        });
      }
    }, 400);
  };

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-md ring-1 ring-gray-200 px-2 py-1 shadow-md">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        id="search"
        placeholder="Tìm kiếm..."
        className="text-sm outline-0 w-32 md:w-44"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
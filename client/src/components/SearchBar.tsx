"use client";

import { Search, X, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { productService } from "../../service/product.service";
import { ApiProductType } from "@/types";
import { formatImageUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("keyword") || "");
  const [suggestions, setSuggestions] = useState<ApiProductType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(searchParams.get("keyword") || "");
  }, [searchParams]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await productService.getSuggestions(query);
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to fetch suggestions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setValue(keyword);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!keyword.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(keyword);
    }, 300);
  };

  const handleSearch = (keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    } else {
      params.delete("keyword");
    }
    setShowSuggestions(false);

    if (pathname === "/products") {
      router.push(`/products?${params.toString()}`, { scroll: false });
    } else {
      router.push(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(value);
    }
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className="hidden sm:flex items-center gap-2 rounded-full ring-1 ring-gray-200 px-4 py-2 shadow-sm focus-within:ring-black focus-within:shadow-md transition-all bg-white">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          id="search"
          placeholder="Tìm sản phẩm..."
          className="text-sm outline-0 w-32 md:w-64 bg-transparent"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim() && setShowSuggestions(true)}
          autoComplete="off"
        />
        {value && (
          <button 
            onClick={() => { setValue(""); setSuggestions([]); setShowSuggestions(false); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* SUGGESTIONS DROPDOWN */}
      {showSuggestions && (value.trim().length > 0) && (
        <div className="absolute top-12 left-0 w-[320px] md:w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gợi ý thông minh</span>
            {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
          </div>

          <div className="max-h-[400px] overflow-y-auto py-2">
            {suggestions.length > 0 ? (
              suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group/item"
                >
                  <div className="relative w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={formatImageUrl(product.images?.[0]?.imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-black">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      {new Intl.NumberFormat("vi-VN").format(product.price)} ₫
                    </p>
                  </div>
                </Link>
              ))
            ) : !loading ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400 italic">Không tìm thấy sản phẩm nào khớp với &quot;{value}&quot;</p>
              </div>
            ) : null}
          </div>

          {suggestions.length > 0 && (
            <button
              onClick={() => handleSearch(value)}
              className="w-full py-3 bg-gray-50 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 transition-colors border-t border-gray-100 uppercase tracking-tight"
            >
              Xem tất cả kết quả cho &quot;{value}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
"use client";

import { X, Loader2, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { productService } from "../../service/product.service";
import { ApiProductType } from "@/types";
import { formatImageUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface AiSuggestionResponse {
  products: ApiProductType[];
  aiMessage: string;
}

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("keyword") || "");
  const [suggestions, setSuggestions] = useState<ApiProductType[]>([]);
  const [aiMessage, setAiMessage] = useState("");
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
      setAiMessage("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await productService.getAiSuggestions(query);
      const data: AiSuggestionResponse = res.data;
      setSuggestions(data.products);
      setAiMessage(data.aiMessage || "");
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to fetch AI suggestions", err);
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
      setAiMessage("");
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(keyword);
    }, 500);
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
      <div className="hidden sm:flex items-center gap-2 rounded-full ring-1 ring-gray-200 px-4 py-2 shadow-sm focus-within:ring-purple-400 focus-within:shadow-md transition-all bg-white">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <input
          id="search"
          placeholder="Tìm kiếm thông minh bằng AI..."
          className="text-sm outline-0 w-32 md:w-64 bg-transparent"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim() && setShowSuggestions(true)}
          autoComplete="off"
        />
        {value && (
          <button 
            onClick={() => { setValue(""); setSuggestions([]); setAiMessage(""); setShowSuggestions(false); }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* AI SUGGESTIONS DROPDOWN */}
      {showSuggestions && (value.trim().length > 0) && (
        <div className="absolute top-12 left-0 w-[320px] md:w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-500" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-purple-500">AI Gợi ý</span>
              </div>
              {loading && <Loader2 size={12} className="animate-spin text-purple-400" />}
            </div>
            {aiMessage && !loading && (
              <p className="text-[11px] text-gray-500 italic leading-relaxed">{aiMessage}</p>
            )}
            {loading && (
              <p className="text-[11px] text-gray-400 italic">Đang phân tích yêu cầu...</p>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto py-2">
            {loading ? (
              <div className="px-4 py-3 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-purple-50/50 transition-colors group/item"
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
                    <p className="text-sm font-medium text-gray-900 truncate group-hover/item:text-purple-700">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">
                      {new Intl.NumberFormat("vi-VN").format(product.price)} ₫
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400 italic">AI không tìm thấy sản phẩm phù hợp với &quot;{value}&quot;</p>
              </div>
            )}
          </div>

          {suggestions.length > 0 && (
            <button
              onClick={() => handleSearch(value)}
              className="w-full py-3 bg-gradient-to-r from-purple-50 to-pink-50 text-xs font-bold text-purple-600 hover:text-purple-800 hover:from-purple-100 hover:to-pink-100 transition-all border-t border-gray-100 uppercase tracking-tight"
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
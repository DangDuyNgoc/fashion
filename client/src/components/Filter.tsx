"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const Filter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");

  const applyFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleSort = (value: string) => {
    applyFilters({ sort: value });
  };

  const handlePriceApply = () => {
    applyFilters({ minPrice, maxPrice });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setColor("");
    setSize("");
    const params = new URLSearchParams(searchParams.toString());
    ["minPrice", "maxPrice", "color", "size", "sort"].forEach((k) =>
      params.delete(k)
    );
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 text-sm text-gray-600 my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      {/* PRICE RANGE */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Giá (đ)</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-20 ring-1 ring-gray-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-gray-400"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            min={0}
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-20 ring-1 ring-gray-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-gray-400"
          />
          <button
            onClick={handlePriceApply}
            className="ml-1 px-2 py-1 text-xs bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* COLOR */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Màu sắc</span>
        <div className="flex items-center gap-1">
          <select
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              applyFilters({ color: e.target.value });
            }}
            className="w-28 ring-1 ring-gray-200 px-2 py-1 rounded-md text-xs outline-none"
          >
            <option value="">Tất cả</option>
            {Object.entries({
              blue: "Xanh dương",
              green: "Xanh lá",
              red: "Đỏ",
              yellow: "Vàng",
              purple: "Tím",
              orange: "Cam",
              pink: "Hồng",
              brown: "Nâu",
              gray: "Xám",
              black: "Đen",
              white: "Trắng",
            }).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SIZE */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Kích cỡ</span>
        <div className="flex items-center gap-1">
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              applyFilters({ size: e.target.value });
            }}
            className="ring-1 ring-gray-200 shadow-sm px-2 py-1 rounded-md text-xs outline-none"
          >
            <option value="">Tất cả</option>
            {["XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44"].map(
              (s) => (
                <option key={s} value={s.toLowerCase()}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* SORT */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">Sắp xếp</span>
        <select
          defaultValue={searchParams.get("sort") || "newest"}
          className="ring-1 ring-gray-200 shadow-sm px-2 py-1 rounded-md text-xs outline-none"
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="asc">Giá: Thấp → Cao</option>
          <option value="desc">Giá: Cao → Thấp</option>
        </select>
      </div>

      {/* RESET */}
      <button
        onClick={handleReset}
        className="px-3 py-1.5 text-xs text-gray-500 ring-1 ring-gray-200 rounded-md hover:bg-gray-100 transition-colors"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};

export default Filter;

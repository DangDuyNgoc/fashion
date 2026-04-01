"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ProductImageType } from "@/types";
import { formatImageUrl } from "@/lib/api";

const ProductGallery = ({
  images,
  selectedColor,
}: {
  images: ProductImageType[];
  selectedColor: string;
}) => {
  // Filter images by color, or use all if no color matches
  const filteredImages = images.filter(
    (img) => img.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
  );
  
  const displayImages = filteredImages.length > 0 ? filteredImages : images;
  const [index, setIndex] = useState(0);

  // Reset index when color changes
  useEffect(() => {
    setIndex(0);
  }, [selectedColor]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full lg:w-5/12 flex flex-col gap-4">
      {/* MAIN IMAGE */}
      <div className="relative aspect-[2/3] bg-gray-50 rounded-xl overflow-hidden group">
        <Image
          key={displayImages[index]?.imageUrl}
          src={formatImageUrl(displayImages[index]?.imageUrl)}
          alt="product"
          fill
          className="object-contain transition-all duration-500 group-hover:scale-105 animate-fade-in"
          priority
        />
      </div>

      {/* THUMBNAILS */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, i) => (
            <div
              key={img.id}
              className={`relative w-20 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                index === i ? "border-black scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              onClick={() => setIndex(i)}
            >
              <Image
                src={formatImageUrl(img.imageUrl)}
                alt={`product-${i}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

import ProductGallery from "@/components/ProductGallery";
import ProductInteraction from "@/components/ProductInteraction";
import ReviewSection from "@/components/ReviewSection";
import { ApiProductType } from "@/types";
import { productService } from "../../../../service/product.service";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  try {
    const { id } = await params;
    const res = await productService.getById(id);
    const product: ApiProductType = res.data;
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: "Sản phẩm" };
  }
};

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color: string; size: string }>;
}) => {
  const { id } = await params;
  const { size, color } = await searchParams;

  let product: ApiProductType;
  try {
    const res = await productService.getById(id);
    product = res.data;
  } catch {
    notFound();
  }

  // Derive unique colors and sizes from variants
  const colors = [...new Set(product!.variants.map((v) => v.color))];
  const sizes = [...new Set(product!.variants.map((v) => v.size))];

  const selectedColor = (color || colors[0] || "").toLowerCase().trim();
  const selectedSize = size || sizes[0] || "";

  return (
    <div className="flex flex-col gap-4 lg:flex-row md:gap-12 mt-12">
      {/* IMAGE GALLERY */}
      <ProductGallery images={product.images} selectedColor={selectedColor} />
      {/* DETAILS */}
      <div className="w-full lg:w-7/12 flex flex-col gap-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          {product!.categoryName}
        </p>
        <h1 className="text-2xl font-medium">{product!.name}</h1>
        <p className="text-gray-500">{product!.description}</p>
        <h2 className="text-2xl font-semibold">
          {new Intl.NumberFormat("vi-VN").format(Number(product!.price))} ₫
        </h2>
        <ProductInteraction
          product={product!}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
        />
        {/* CARD INFO */}
        <div className="flex items-center gap-2 mt-4">
          <Image
            src="/klarna.png"
            alt="klarna"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/cards.png"
            alt="cards"
            width={50}
            height={25}
            className="rounded-md"
          />
          <Image
            src="/stripe.png"
            alt="stripe"
            width={50}
            height={25}
            className="rounded-md"
          />
        </div>
        <p className="text-gray-500 text-xs">
          Bằng việc nhấn Thanh Toán Ngay, bạn đồng ý với{" "}
          <span className="underline hover:text-black">
            Điều khoản & Điều kiện
          </span>{" "}
          và{" "}
          <span className="underline hover:text-black">Chính sách bảo mật</span>
          . Bạn ủy quyền cho chúng tôi tính phí phương thức thanh toán đã chọn
          cho tổng số tiền hiển thị. Tất cả giao dịch bán hàng đều tuân theo
          chính sách đổi trả và{" "}
          <span className="underline hover:text-black">
            Chính sách hoàn tiền
          </span>
          .
        </p>
      </div>
      <div className="w-full">
        <ReviewSection productId={product!.id} />
      </div>
    </div>
  );
};

export default ProductPage;

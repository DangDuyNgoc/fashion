import ProductList from "@/components/ProductList";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string; categoryId: string }>;
}) => {
  const { category, categoryId } = await searchParams;
  return (
    <div>
      <ProductList category={categoryId || category} params="products" />
    </div>
  );
};

export default ProductsPage;

import api from "@/lib/api";

export interface ProductFilterParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  keyword?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const productService = {
  getAll: () => api.get("/product/get-all-products"),

  getById: (id: number | string) => api.get(`/product/get-product/${id}`),

  filter: (params: ProductFilterParams) =>
    api.get("/product/filter", { params }),

  getAiSuggestions: (query: string) =>
    api.get("/product/ai-suggestions", { params: { query } }),
};

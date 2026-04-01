import api from "@/lib/api";
import { CreateProductDTO, UpdateProductDTO, ProductFilterRequest } from "@/types/api";

export const productsService = {
  getAll: () => api.get("/Product/get-all-products"),
  getById: (id: number) => api.get(`/Product/get-product/${id}`),
  create: (data: CreateProductDTO) => api.post("/Product/create-product", data),
  update: (id: number, data: UpdateProductDTO) => api.put(`/Product/update-product/${id}`, data),
  delete: (id: number) => api.delete(`/Product/delete-product/${id}`),
  filter: (params: ProductFilterRequest) => api.get("/Product/filter", { params }),
};

import api from "@/lib/api";
import { CreateVariantDTO, UpdateVariantDTO } from "@/types/api";

export const productVariantsService = {
  getByProductId: (productId: number) => api.get(`/get-variant/${productId}`),
  create: (data: CreateVariantDTO) => api.post("/product-variants/create-variant", data),
  update: (id: number, data: UpdateVariantDTO) => api.put(`/product-variants/update-variant/${id}`, data),
  delete: (id: number) => api.delete(`/product-variants/delete-variant/${id}`),
};

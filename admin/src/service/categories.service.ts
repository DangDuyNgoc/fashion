import api from "@/lib/api";
import { CategoryCreateDTO, CategoryUpdateDTO } from "@/types/api";

export const categoriesService = {
  getAll: () => api.get("/categories/get-all-categories"),
  getById: (id: number) => api.get(`/categories/get-category/${id}`),
  create: (data: CategoryCreateDTO) => api.post("/categories/create-category", data),
  update: (id: number, data: CategoryUpdateDTO) => api.put(`/categories/update-category/${id}`, data),
  delete: (id: number) => api.delete(`/categories/delete-category/${id}`),
};

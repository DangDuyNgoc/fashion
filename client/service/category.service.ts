import api from "@/lib/api";

export const categoryService = {
  getAll: () => api.get("/categories/get-all-categories"),
};

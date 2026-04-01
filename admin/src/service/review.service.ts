import api from "@/lib/api";

export const reviewService = {
  getAll: () => 
    api.get("/reviews/admin-all"),
    
  update: (id: number, data: { rating: number; comment: string }) =>
    api.put(`/reviews/admin-update/${id}`, data),
    
  delete: (id: number) =>
    api.delete(`/reviews/admin-delete/${id}`),
};

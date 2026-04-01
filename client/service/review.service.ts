import api from "@/lib/api";

export const reviewService = {
  getReviewsByProduct: (productId: number) => 
    api.get(`/reviews/product-reviews/${productId}`),
    
  createReview: (data: { orderItemId: number; rating: number; comment: string }) =>
    api.post("/reviews/create-review", data),
    
  deleteReview: (id: number) =>
    api.delete(`/reviews/delete-review/${id}`),

  updateReview: (id: number, data: { rating: number; comment: string }) =>
    api.put(`/reviews/update-review/${id}`, data),
};

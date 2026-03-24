using server.DTOs;

namespace server.Services
{
    public interface IReviewService
    {
        Task<ReviewResponse> CreateReviewAsync(Guid userId, CreateReviewRequest req);

        Task<List<ReviewResponse>> GetReviewsByProductIdAsync(int productId);

        Task<ReviewResponse?> GetReviewByIdAsync(int reviewId);

        Task UpdateReviewAsync(Guid userId, int reviewId, UpdateReviewRequest req);

        Task DeleteReviewAsync(Guid userId, int reviewId);

        //Admin
        Task DeleteReviewByAdminAsync(int reviewId);

        Task UpdateReviewByAdminAsync(int reviewId, UpdateReviewRequest req);
    }
}
using server.Models;

namespace server.Interfaces
{   
        public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(int id);

        Task CreateAsync(Review review);

        Task DeleteAsync(Review review);

        Task<bool> ExistsByOrderItemAsync(int orderItemId);

        Task<List<Review>> GetByProductIdAsync(int productId);

        Task<List<Review>> GetAllAsync();

        Task SaveChangesAsync();
    }
}
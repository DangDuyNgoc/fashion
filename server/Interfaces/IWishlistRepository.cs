using server.Models;

namespace server.Repositories
{
    public interface IWishlistRepository
    {
        Task<List<Wishlist>> GetByUserIdAsync(Guid userId);

        Task<Wishlist?> GetItemAsync(Guid userId, int productId);

        Task AddAsync(Wishlist wishlist);

        Task RemoveAsync(Wishlist wishlist);

        Task SaveChangesAsync();
    }
}
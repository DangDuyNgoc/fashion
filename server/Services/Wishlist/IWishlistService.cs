using server.DTOs;

namespace server.Services
{
    public interface IWishlistService
    {
        Task<List<WishlistItemDTO>> GetWishlistAsync(Guid userId);

        Task AddToWishlistAsync(Guid userId, int productId);

        Task RemoveFromWishlistAsync(Guid userId, int productId);
    }
}
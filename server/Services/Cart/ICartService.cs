using server.DTOs;

namespace server.Services
{
    public interface ICartService
    {
        Task<CartDTO> GetCartAsync(Guid userId);
        Task<CartDTO> AddToCartAsync(Guid userId, AddToCartDTO dto);
        Task<CartDTO> UpdateItemAsync(Guid userId, int itemId, UpdateCartItemDTO dto);
        Task<bool> RemoveItemAsync(Guid userId, int itemId);
    }
}
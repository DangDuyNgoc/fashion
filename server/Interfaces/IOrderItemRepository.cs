using server.Models;

namespace server.Interfaces
{
    public interface IOrderItemRepository
    {
        Task<OrderItem?> GetByIdWithDetailsAsync(int id);
    }
}
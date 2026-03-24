using server.Models;

namespace server.Interfaces
{
    public interface IOrderRepository
    {
        Task CreateAsync(Order order);
        Task<List<Order>> GetByUserIdAsync(Guid userId);
        Task<Order?> GetByIdAsync(int orderId);
        Task<List<Order>> GetAllAsync();
        Task UpdateAsync(Order order);
        Task SaveChangesAsync();
    }
}
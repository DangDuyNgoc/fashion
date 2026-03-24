using server.DTOs;

namespace server.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrder(Guid userId, CreateOrderRequest req);
        Task<List<OrderResponse>> GetUserOrders(Guid userId);
        Task<List<OrderResponse>> GetAllOrders();
        Task<OrderResponse?> GetOrderByIdForAdmin(int orderId);
        Task<bool> UpdateOrderStatus(int orderId, string status);
        Task<OrderResponse?> GetOrderById(int orderId, Guid userId);
    }
}
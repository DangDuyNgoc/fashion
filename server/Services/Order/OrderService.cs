using server.DTOs;
using server.Interfaces;
using server.Models;
using server.Data;
using server.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Net.Sockets;

namespace server.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly AppDbContext _context;
        private readonly ICartRepository _cartRepo;
        private readonly IAddressRepository _addressRepo;

        public OrderService(
            IOrderRepository orderRepo, 
            AppDbContext context,
            ICartRepository cartRepo,
            IAddressRepository addressRepo
        )
        {
            _orderRepo = orderRepo;
            _context = context;
            _cartRepo = cartRepo;
            _addressRepo = addressRepo;
        }

        public async Task<OrderResponse> CreateOrder(Guid userId, CreateOrderRequest req)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cart = await _cartRepo.GetByUserIdAsync(userId);
                if (cart == null || !cart.Items.Any())
                    throw new Exception("Cart is empty");

                Address? address;

                if (req.AddressId.HasValue)
                {
                    address = await _addressRepo.GetByIdAsync(req.AddressId.Value);

                    if (address == null || address.UserId != userId)
                        throw new Exception("Invalid address");
                }
                else
                {
                    address = await _addressRepo.GetDefaultAsync(userId);

                    if (address == null)
                        throw new Exception("No default address found");
                }

                var order = new Order
                {
                    UserId = userId,
                    Address = $"{address.AddressLine}, {address.District}, {address.City}",
                    PaymentMethod = req.PaymentMethod,
                    Status = OrderStatus.Pending,
                    Items = new List<OrderItem>()
                };

                decimal total = 0;

                foreach (var item in cart.Items)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                    if (variant == null)
                        throw new Exception("Variant not found");

                    if (item.Quantity > variant.Stock)
                        throw new Exception("Not enough stock");

                    var orderItem = new OrderItem
                    {
                        VariantId = item.VariantId,
                        Quantity = item.Quantity,
                        Price = variant.Product.Price,
                        ProductName = variant.Product.Name,
                        VariantName = $"{variant.Color} - {variant.Size}"
                    };

                    total += variant.Product.Price * item.Quantity;

                    variant.Stock -= item.Quantity;

                    order.Items.Add(orderItem);
                }

                order.TotalPrice = total;

                await _orderRepo.CreateAsync(order);

                // clear cart
                cart.Items.Clear();
                await _cartRepo.UpdateAsync(cart);

                await _orderRepo.SaveChangesAsync();

                await transaction.CommitAsync();

                return await MapToResponse(order.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<OrderResponse>> GetUserOrders(Guid userId)
        {
            var orders = await _orderRepo.GetByUserIdAsync(userId);
            
            var orderItemIds = orders.SelectMany(o => o.Items.Select(i => i.Id)).ToList();
            var reviewedOrderItemIds = await _context.Reviews
                .Where(r => orderItemIds.Contains(r.OrderItemId))
                .Select(r => r.OrderItemId)
                .ToListAsync();

            var reviewedSet = new HashSet<int>(reviewedOrderItemIds);

            return orders.Select(o => MapToResponse(o, reviewedSet)).ToList();
        }

        public async Task<OrderResponse?> GetOrderById(int orderId, Guid userId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);

            if (order == null || order.UserId != userId)
                return null;

            var orderItemIds = order.Items.Select(i => i.Id).ToList();
            var reviewedOrderItemIds = await _context.Reviews
                .Where(r => orderItemIds.Contains(r.OrderItemId))
                .Select(r => r.OrderItemId)
                .ToListAsync();

            return MapToResponse(order, new HashSet<int>(reviewedOrderItemIds));
        }

        public async Task<List<OrderResponse>> GetAllOrders()
        {
            var orders = await _orderRepo.GetAllAsync();
            
            var orderItemIds = orders.SelectMany(o => o.Items.Select(i => i.Id)).ToList();
            var reviewedOrderItemIds = await _context.Reviews
                .Where(r => orderItemIds.Contains(r.OrderItemId))
                .Select(r => r.OrderItemId)
                .ToListAsync();
            
            var reviewedSet = new HashSet<int>(reviewedOrderItemIds);

            return orders.Select(o => MapToResponse(o, reviewedSet)).ToList();
        }

        public async Task<OrderResponse?> GetOrderByIdForAdmin(int orderId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order == null) return null;

            var orderItemIds = order.Items.Select(i => i.Id).ToList();
            var reviewedOrderItemIds = await _context.Reviews
                .Where(r => orderItemIds.Contains(r.OrderItemId))
                .Select(r => r.OrderItemId)
                .ToListAsync();

            return MapToResponse(order, new HashSet<int>(reviewedOrderItemIds));
        }

        public async Task<bool> UpdateOrderStatus(int orderId, string status)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order == null) return false;

            if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
                throw new Exception("Invalid status");

            if (order.Status == OrderStatus.Delivered)
                throw new Exception("Cannot update delivered order");

            if (order.Status == OrderStatus.Cancelled)
                throw new Exception("Cannot update cancelled order");

            order.Status = newStatus;

            await _orderRepo.UpdateAsync(order);
            await _orderRepo.SaveChangesAsync();

            return true;
        }

        private OrderResponse MapToResponse(Order order, HashSet<int> reviewedOrderItemIds)
        {
            return new OrderResponse
            {
                Id = order.Id,
                TotalPrice = order.TotalPrice,
                Address = order.Address,
                Status = order.Status.ToString(),
                PaymentMethod = order.PaymentMethod,
                CreatedAt = order.CreatedAt,
                Items = order.Items.Select(i => new OrderItemResponse
                {
                    Id = i.Id,
                    ProductId = i.Variant.ProductId,
                    VariantId = i.VariantId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price,
                    IsReviewed = reviewedOrderItemIds.Contains(i.Id)
                }).ToList()
            };
        }

        private async Task<OrderResponse> MapToResponse(int orderId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            return MapToResponse(order!, new HashSet<int>());
        }
    }
}
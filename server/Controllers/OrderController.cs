using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Interfaces;
using server.Middleware;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // order (COD)
        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest req)
        {
            var userId = GetUserId();
            var result = await _orderService.CreateOrder(userId, req);

            return Ok(new { message = "Order created successfully", order = result });
        }

        // view order history
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();
            var orders = await _orderService.GetUserOrders(userId);

            return Ok(new {message = "Orders retrieved successfully", data = orders });
        }

        // tracking order status
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMyOrder(int id)
        {
            var userId = GetUserId();
            var order = await _orderService.GetOrderById(id, userId);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [HttpGet("admin/all-orders")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrders();
            return Ok(new { message = "All orders retrieved successfully", data = orders });
        }

        [HttpGet("admin/orders/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _orderService.GetOrderByIdForAdmin(id);

            if (order == null)
                return NotFound();

            return Ok(new { message = "Order retrieved successfully", data = order });
        }

        // Update order status (Admin only)
        [HttpPatch("admin/orders/{id}/status")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequest req)
        {
            var result = await _orderService.UpdateOrderStatus(id, req.Status);

            if (!result)
                return NotFound();

            return Ok(new { message = "Order status updated" });
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

namespace server.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _service;

        public CartController(ICartService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            return (Guid)HttpContext.Items["UserId"]!;
        }

        // GET CART
        [HttpGet("get-cart")]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            var result = await _service.GetCartAsync(userId);
            return Ok(new { Message = "Cart retrieved successfully", Data = result });
        }

        // ADD TO CART
        [HttpPost("add-items")]
        public async Task<IActionResult> AddToCart(AddToCartDTO dto)
        {
            var userId = GetUserId();
            var result = await _service.AddToCartAsync(userId, dto);
            return Ok(new { Message = "Item added to cart successfully", Data = result });
        }

        // UPDATE ITEM
        [HttpPut("update-items/{itemId}")]
        public async Task<IActionResult> UpdateItem(int itemId, UpdateCartItemDTO dto)
        {
            var userId = GetUserId();   
            var result = await _service.UpdateItemAsync(userId, itemId, dto);
            return Ok(new { Message = "Item updated successfully", Data = result });
        }

        // REMOVE ITEM
        [HttpDelete("delete-items/{itemId}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();

            var success = await _service.RemoveItemAsync(userId, itemId);
            if (!success) return NotFound();

            return Ok(new { Message = "Item removed successfully" });
        }
    }
}
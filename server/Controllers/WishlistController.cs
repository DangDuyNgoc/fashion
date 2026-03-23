using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/wishlist")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _service;

        public WishlistController(IWishlistService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpGet("get-wishlist")]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserId();
            var result = await _service.GetWishlistAsync(userId);

            return Ok(new {message = "Wishlist retrieved successfully", data = result});
        }

        [HttpPost("add-to-wishlist")]
        public async Task<IActionResult> AddToWishlist([FromBody] AddWishlistDTO dto)
        {
            var userId = GetUserId();

            await _service.AddToWishlistAsync(userId, dto.ProductId);

            return Ok(new { message = "Added to wishlist" });
        }

        [HttpDelete("remove-from-wishlist/{productId}")]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            var userId = GetUserId();

            await _service.RemoveFromWishlistAsync(userId, productId);

            return Ok(new { message = "Removed from wishlist" });
        }
    }
}
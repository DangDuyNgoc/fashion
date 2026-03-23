using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _service;

        public ReviewController(IReviewService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpPost("create-review")]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest req)
        {
            var userId = GetUserId();

            var review = await _service.CreateReviewAsync(userId, req);

            return Ok(new { message = "Review created", data = review });
        }

        [HttpGet("product-reviews/{productId}")]
        public async Task<IActionResult> GetReviews(int productId)
        {
            var result = await _service.GetReviewsByProductIdAsync(productId);
            return Ok(new { message = "Reviews retrieved successfully", data = result });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var review = await _service.GetReviewByIdAsync(id);

            if (review == null)
                return NotFound(new { message = "Review not found" });

            return Ok(new { data = review });
        }

        [Authorize]
        [HttpPut("update-review/{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewRequest req)
        {
            var userId = GetUserId();

            await _service.UpdateReviewAsync(userId, id, req);

            return Ok(new { message = "Review updated"});
        }

        [Authorize]
        [HttpDelete("delete-review/{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetUserId();

            await _service.DeleteReviewAsync(userId, id);

            return Ok(new { message = "Deleted" });
        }

        [Authorize(Role = "Admin")]
        [HttpDelete("admin-delete/{id}")]
        public async Task<IActionResult> AdminDelete(int id)
        {
            await _service.DeleteReviewByAdminAsync(id);
            return Ok(new { message = "Deleted by admin" });
        }

        [Authorize(Role = "Admin")]
        [HttpPut("admin-update/{id}")]
        public async Task<IActionResult> AdminUpdate(int id, [FromBody] UpdateReviewRequest req)
        {
            await _service.UpdateReviewByAdminAsync(id, req);
            return Ok(new { message = "Review updated by admin" });
        }
    }
}

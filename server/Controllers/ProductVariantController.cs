using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

namespace server.Controllers
{
    [ApiController]
    [Route("api/product-variants")]
    public class ProductVariantController : ControllerBase
    {
        private readonly IProductVariantService _service;

        public ProductVariantController(IProductVariantService service)
        {
            _service = service;
        }

        // ================= GET BY PRODUCT =================
        [HttpGet("/get-variant/{productId}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> GetByProductId(int productId)
        {
            var variants = await _service.GetByProductId(productId);
            return Ok(new { message = "Variants retrieved successfully", variants = variants });
        }

        // ================= CREATE =================
        [HttpPost("create-variant")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateVariantDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.Create(dto);

            return CreatedAtAction(
                nameof(GetByProductId),
                new { productId = created.ProductId },
                created
            );
        }

        // ================= UPDATE =================
        [HttpPut("update-variant/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVariantDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.Update(id, dto);

            if (updated == null)
                return NotFound(new { message = "Variant not found" });

            return Ok(new { message = "Updated successfully", variant = updated });
        }

        // ================= DELETE =================
        [HttpDelete("delete-variant/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);

            if (!result)
                return NotFound(new { message = "Variant not found" });

            return Ok(new { message = "Deleted successfully" });
        }
    }
}
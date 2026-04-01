using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

namespace server.Controllers
{
    [ApiController]
    [Route("api/product-images")]
    public class ProductImageController : ControllerBase
    {
        private readonly IProductImageService _service;

        public ProductImageController(IProductImageService service)
        {
            _service = service;
        }
        
        // ================= UPLOAD =================
        [HttpPost("upload-image")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> UploadImages([FromForm] UploadProductImageDTO dto)
        {
            if (dto.Images == null || !dto.Images.Any())
                return BadRequest("No images uploaded");

            var result = await _service.UploadImages(dto);

            return Ok(new { message = "Images uploaded successfully", images = result });
        }

        // ================= UPDATE COLOR =================
        [HttpPut("update-color/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> UpdateColor(int id, [FromBody] UpdateProductImageColorRequest req)
        {
            var result = await _service.UpdateColor(id, req.Color);
            
            if (!result)
                return NotFound(new { message = "Image not found" });

            return Ok(new { message = "Updated color successfully" });
        }

        // ================= DELETE =================
        [HttpDelete("delete-image/{id}")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
    
            if (!result)
                return NotFound(new { message = "Image not found" });

            return Ok(new { message = "Deleted successfully" });
        }
    }
}
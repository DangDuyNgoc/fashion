using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services;
using server.Middleware;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        [HttpGet("get-all-products")]
        public async Task<IActionResult> GetAll()
        {
            var products = await _service.GetAllAsync();
            return Ok(products);
        }

        [HttpGet("get-product/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _service.GetByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost("create-product")]
        [Authorize(Role = "Admin")]
        public async Task<IActionResult> Create(CreateProductDTO dto)
        {
            var product = await _service.CreateAsync(dto);
            return Ok(product);
        }

        [HttpPut("update-product/{id}")]
        public async Task<IActionResult> Update(int id, UpdateProductDTO dto)
        {
            var product = await _service.UpdateAsync(id, dto);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpDelete("delete-product/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok("Deleted successfully");
        }

        [HttpGet("filter")]
        public async Task<IActionResult> Filter([FromQuery] ProductFilterRequest filter)
        {
            var result = await _service.GetFilteredAsync(filter);
            return Ok(result);
        }
    }
}